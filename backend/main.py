from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import secrets
import jwt # PyJWT
from dotenv import load_dotenv
from database import supabase
from models import Organization, OrganizationCreate, Project, ProjectCreate, APIKey
from agent import score_candidate
from models import ApplicantCreate, Applicant, ApplicantUpdate
import io
from pydantic import ValidationError
from pypdf import PdfReader
from email_service import send_decision_email

load_dotenv()

app = FastAPI(title="HRIS Cloud API")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Explicitly allow all for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Strategy: Decode unverified to get 'sub' (User ID) for MVP
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Token")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Auth")

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
    if project.template_id != "recruitment-ai-v1":
         raise HTTPException(status_code=400, detail="Invalid template ID")
         
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
    return res.data[0]

@app.patch("/projects/{project_id}", response_model=Project)
def update_project(project_id: str, update: ProjectUpdate, user_id: str = Depends(get_current_user)):
    # Verify ownership
    proj_check = supabase.table("projects").select("id").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    res = supabase.table("projects").update({"name": update.name}).eq("id", project_id).execute()
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

@app.post("/apply", response_model=Applicant)
async def apply_candidate(
    name: str = Form(...),
    email: str = Form(...),
    cv: UploadFile = File(...),
    x_api_key: str = Header(None),
    x_project_id: str = Header(None)
):
    # 1. Validate Keys
    if not x_project_id:
        raise HTTPException(status_code=400, detail="Missing Project ID")

    # 2. Check Auth
    if x_api_key:
        key_check = supabase.table("api_keys").select("*").eq("key_value", x_api_key).eq("project_id", x_project_id).execute()
        if not key_check.data:
             raise HTTPException(status_code=403, detail="Invalid API Key")
    else:
        proj_check = supabase.table("projects").select("id").eq("id", x_project_id).execute()
        if not proj_check.data:
             raise HTTPException(status_code=404, detail="Project not found")

    # 3. Process File (Extract Text)
    content = await cv.read()
    cv_text = ""
    
    if cv.filename.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                cv_text += page.extract_text() + "\n"
        except Exception as e:
            print(f"PDF Parse Error: {e}")
            cv_text = "Failed to parse PDF content."
    else:
        # Assume text/md
        cv_text = content.decode("utf-8", errors="ignore")

    # 4. Run AI Agent
    ai_result = score_candidate(name, email, cv_text)
    
    # 5. Save to DB
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
