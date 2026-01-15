from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
import os
import uuid
import secrets
import jwt # PyJWT
import re
from dotenv import load_dotenv
from database import supabase
from models import Organization, OrganizationCreate, Project, ProjectCreate, APIKey, ProjectUpdate
from agent import score_candidate
from models import ApplicantCreate, Applicant, ApplicantUpdate
import io
from pydantic import ValidationError
from pypdf import PdfReader
from email_service import send_decision_email
from rate_limiter import rate_limit_middleware

load_dotenv()

app = FastAPI(title="HRIS Cloud API")
security = HTTPBearer()

# CORS Configuration - Whitelist specific origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "https://hris-cloud.vercel.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.middleware("http")(rate_limit_middleware)

# Auth Dependency - FIXED: Proper JWT validation with better logging
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Get Supabase JWT secret from environment
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            print("AUTH ALERT: SUPABASE_JWT_SECRET is MISSING in environment variables")
            # Fallback to unverified for local dev ONLY
            print("WARNING: Using unverified JWT (Mode: DEV/SECURITY_RISK)")
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            print(f"AUTH DEBUG: JWT Secret found (Length: {len(jwt_secret)})")
            # Log the algorithm from the token header for debugging
            header = jwt.get_unverified_header(token)
            print(f"AUTH DEBUG: Token Header Alg: {header.get('alg')}")
            # Proper verification with secret
            # Supabase can use either:
            # - HMAC (HS256/384/512) with Legacy JWT Secret
            # - ECDSA (ES256/384/512) with JWT Signing Keys
            # - RSA (RS256/384/512) with JWT Signing Keys
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256", "HS384", "HS512", "ES256", "ES384", "ES512", "RS256", "RS384", "RS512"],
                options={"verify_aud": False, "verify_signature": True},
                leeway=120
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Token: No sub claim")
        return user_id
    except jwt.ExpiredSignatureError:
        print("JWT Error: Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"JWT Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "HRIS Cloud"}

# --- Platform Layer ---

@app.post("/organizations", response_model=Organization)
def create_organization(org: OrganizationCreate, user_id: str = Depends(get_current_user)):
    res = supabase.table("organizations").insert({
        "name": org.name,
        "owner_id": user_id
    }).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create organization")
    return res.data[0]

@app.get("/organizations", response_model=List[Organization])
def list_organizations(user_id: str = Depends(get_current_user)):
    # Filter by user_id
    res = supabase.table("organizations").select("*").eq("owner_id", user_id).execute()
    return res.data

@app.post("/projects", response_model=Project)
def create_project(project: ProjectCreate, user_id: str = Depends(get_current_user)):

         
    # Check Org Owner
    org_check = supabase.table("organizations").select("id").eq("id", project.org_id).eq("owner_id", user_id).execute()
    if not org_check.data:
         raise HTTPException(status_code=403, detail="Not authorized for this Organization")

    res = supabase.table("projects").insert({
        "org_id": str(project.org_id),
        "name": project.name,
        "template_id": project.template_id,
        "owner_id": user_id
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create project")
    return res.data[0]

@app.get("/projects", response_model=List[Project])
def list_projects(org_id: str, user_id: str = Depends(get_current_user)):
    # Verify via owner_id match
    res = supabase.table("projects").select("*").eq("org_id", org_id).eq("owner_id", user_id).execute()
    return res.data

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    # Public endpoint allowed for Career Page (Auth handled via key or just ID existence)
    # But ideally we should protect it if called from Dashboard.
    # For MVP Career Page flow, this is public read.
    res = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = res.data[0]
    
    # Fetch Org Name
    org_res = supabase.table("organizations").select("name").eq("id", project['org_id']).execute()
    if org_res.data:
        project['org_name'] = org_res.data[0]['name']
        
    return project

@app.patch("/projects/{project_id}", response_model=Project)
def update_project(project_id: str, updates: ProjectUpdate, user_id: str = Depends(get_current_user)):
    # Verify ownership
    proj_check = supabase.table("projects").select("id").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build update dict (only include non-None values)
    update_data = {}
    if updates.name is not None: # Changed from `if updates.name:` to handle empty string if name is Optional[str]
        update_data["name"] = updates.name
    if updates.description is not None:
        update_data["description"] = updates.description
    if updates.requirements is not None:
        update_data["requirements"] = updates.requirements
    if updates.benefits is not None:
        update_data["benefits"] = updates.benefits
    if updates.is_active is not None:
        update_data["is_active"] = updates.is_active
    
    res = supabase.table("projects").update(update_data).eq("id", project_id).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Update failed")
    return res.data[0]

@app.post("/projects/{project_id}/keys", response_model=APIKey)
def generate_api_key(project_id: str, user_id: str = Depends(get_current_user)):
    proj_check = supabase.table("projects").select("id").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized for this Project")

    new_key = f"hris_{secrets.token_urlsafe(24)}"
    
    res = supabase.table("api_keys").insert({
        "project_id": project_id,
        "key_value": new_key,
        "owner_id": user_id
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not generate key")
    return res.data[0]

@app.get("/templates")
def list_templates():
    res = supabase.table("templates").select("*").execute()
    return res.data

# --- Recruitment Layer ---

# Input validation model
class ApplicantInput(BaseModel):
    name: constr(min_length=2, max_length=100, strip_whitespace=True)
    email: EmailStr

@app.post("/apply", response_model=Applicant)
async def apply_candidate(
    name: str = Form(...),
    email: str = Form(...),
    cv: UploadFile = File(...),
    x_api_key: str = Header(None),
    x_project_id: str = Header(None)
):
    # Input validation and sanitization
    try:
        validated_input = ApplicantInput(name=name, email=email)
        name = validated_input.name
        email = validated_input.email
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid input", "message": str(e)}
        )
    # 1. Validate Keys
    if not x_project_id:
        raise HTTPException(status_code=400, detail="Missing Project ID")

    # 2. Authenticate Request
    if x_api_key:
        key_check = supabase.table("api_keys").select("*").eq("key_value", x_api_key).eq("project_id", x_project_id).execute()
        if not key_check.data:
             raise HTTPException(status_code=403, detail="Invalid API Key")
    else:
        proj_check = supabase.table("projects").select("id, is_active").eq("id", x_project_id).execute()
        if not proj_check.data:
             raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if project is active
        project = proj_check.data[0]
        if not project.get("is_active", True):
            raise HTTPException(
                status_code=403, 
                detail="This position is currently closed and not accepting applications"
            )

    # 3. Read file content
    content = await cv.read()
    
    # 4. VALIDATION PIPELINE - Reject invalid files early
    from validators import validate_cv_file
    from extractors import extract_and_validate_cv_text
    
    # Step 4a: Validate file (extension, size, MIME type)
    mime_type, _ = validate_cv_file(cv, content)
    
    # Step 4b: Extract and validate text quality
    cv_text = extract_and_validate_cv_text(content, mime_type)
    
    # If we reach here, CV is valid and has good text quality

    # 5. Run AI Agent (only on validated CVs)
    ai_result = score_candidate(name, email, cv_text)
    
    # 6. Save to Database
    res = supabase.table("applicants").insert({
        "project_id": x_project_id,
        "name": name,
        "email": email,
        "cv_text": cv_text, # Storing extracted text for MVP
        "ai_score": ai_result.get("score", 0),
        "ai_reasoning": ai_result.get("reasoning", "AI Analysis Failed"),
        "status": "pending"
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save application")
    
    return res.data[0]

@app.get("/applicants", response_model=List[Applicant])
def list_applicants(project_id: str, user_id: str = Depends(get_current_user)):
    # Verify Project Ownership before listing applicants
    proj_check = supabase.table("projects").select("id").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized for this Project")

    res = supabase.table("applicants").select("*").eq("project_id", project_id).order("ai_score", desc=True).execute()
    return res.data

class ApplicantUpdate(BaseModel):
    status: str

@app.patch("/applicants/{applicant_id}", response_model=Applicant)
def update_applicant(applicant_id: str, update: ApplicantUpdate, user_id: str = Depends(get_current_user)):
    
    app_data = supabase.table("applicants").select("project_id, name, email").eq("id", applicant_id).execute()
    if not app_data.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
        
    applicant = app_data.data[0]
    project_id = applicant['project_id']
    
    # Verify ownership and get project name
    proj_check = supabase.table("projects").select("id, name").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    project_name = proj_check.data[0]['name']

    # Send Email Notification
    send_decision_email(applicant['email'], applicant['name'], update.status, project_name)

    res = supabase.table("applicants").update({"status": update.status}).eq("id", applicant_id).execute()
    return res.data[0]
