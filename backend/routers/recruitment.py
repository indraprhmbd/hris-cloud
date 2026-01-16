import secrets
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, UploadFile, File, Form
from pydantic import EmailStr
from database import supabase, EPOCH_SENTINEL
from dependencies import get_current_user
from models import (
    Organization, OrganizationCreate, Project, ProjectCreate, ProjectUpdate, 
    Applicant, ApplicantUpdate, APIKey, VerifyApplicantRequest
)
from services.ai_service import process_ai_score
from validators import validate_cv_file, is_professional_cv
from extractors import extract_and_validate_cv_text
from utils import calculate_cv_hash
from email_service import send_decision_email

router = APIRouter()

# --- Organizations ---
@router.post("/organizations", response_model=Organization)
def create_organization(org: OrganizationCreate, user_id: str = Depends(get_current_user)):
    res = supabase.table("organizations").insert({
        "name": org.name,
        "owner_id": user_id
    }).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create organization")
    return res.data[0]

@router.get("/organizations", response_model=List[Organization])
def list_organizations(user_id: str = Depends(get_current_user)):
    res = supabase.table("organizations")\
        .select("*")\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    return res.data

# --- Projects ---
def get_or_create_org(user_id: str) -> str:
    """Helper to ensure 1 HR = 1 Org."""
    res = supabase.table("organizations").select("id").eq("owner_id", user_id).eq("deleted_at", EPOCH_SENTINEL).execute()
    if res.data:
        return res.data[0]["id"]
    
    # Auto-create if not exists
    new_org = supabase.table("organizations").insert({
        "name": "My Organization",
        "owner_id": user_id
    }).execute()
    
    if not new_org.data:
        raise HTTPException(status_code=500, detail="Failed to initialize organization")
    return new_org.data[0]["id"]

# --- Projects ---
@router.post("/projects", response_model=Project)
def create_project(project: ProjectCreate, user_id: str = Depends(get_current_user)):
    # Auto-resolve Org
    org_id = get_or_create_org(user_id)

    res = supabase.table("projects").insert({
        "org_id": org_id,
        "name": project.name,
        "template_id": project.template_id,
        "owner_id": user_id
    }).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create project")
    return res.data[0]

@router.get("/projects", response_model=List[Project])
def list_projects(user_id: str = Depends(get_current_user)):
    # Auto-resolve Org (Implicit ownership check via org_id)
    org_id = get_or_create_org(user_id)
    
    res = supabase.table("projects")\
        .select("*")\
        .eq("org_id", org_id)\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    return res.data

@router.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    res = supabase.table("projects")\
        .select("*")\
        .eq("id", project_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = res.data[0]
    org_res = supabase.table("organizations").select("name").eq("id", project['org_id']).execute()
    if org_res.data:
        project['org_name'] = org_res.data[0]['name']
    return project

@router.patch("/projects/{project_id}", response_model=Project)
def update_project(project_id: str, updates: ProjectUpdate, user_id: str = Depends(get_current_user)):
    proj_check = supabase.table("projects")\
        .select("id")\
        .eq("id", project_id)\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    if not proj_check.data:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    res = supabase.table("projects").update(update_data).eq("id", project_id).execute()
    return res.data[0]

@router.delete("/projects/{project_id}")
def delete_project(project_id: str, user_id: str = Depends(get_current_user)):
    """Soft delete a project."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    proj_check = supabase.table("projects").select("id").eq("id", project_id).eq("owner_id", user_id).execute()
    if not proj_check.data:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase.table("projects").update({"deleted_at": now}).eq("id", project_id).execute()
    supabase.table("applicants").update({"deleted_at": now}).eq("project_id", project_id).execute()
    return {"status": "success", "message": "Project archived"}

# --- API Keys ---
@router.post("/projects/{project_id}/keys", response_model=APIKey)
def generate_api_key(project_id: str, user_id: str = Depends(get_current_user)):
    proj_check = supabase.table("projects")\
        .select("id")\
        .eq("id", project_id)\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized")

    new_key = f"hris_{secrets.token_urlsafe(24)}"
    res = supabase.table("api_keys").insert({
        "project_id": project_id,
        "key_value": new_key,
        "owner_id": user_id
    }).execute()
    return res.data[0]

# --- Applicants (Recruitment Logic) ---
@router.get("/applicants/all", response_model=List[Applicant])
def list_all_applicants(user_id: str = Depends(get_current_user)):
    """List all applicants across all projects for the user's organization."""
    org_id = get_or_create_org(user_id)
    
    org_check = supabase.table("organizations")\
        .select("id")\
        .eq("id", org_id)\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    if not org_check.data:
         # Should catch inconsistent state if get_or_create failed logic
         raise HTTPException(status_code=403, detail="Not authorized")
    
    proj_res = supabase.table("projects")\
        .select("id")\
        .eq("org_id", org_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    proj_ids = [p["id"] for p in proj_res.data]
    
    if not proj_ids:
        return []
    
    res = supabase.table("applicants")\
        .select("*, projects(name)")\
        .in_("project_id", proj_ids)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .order("created_at", desc=True)\
        .execute()
    
    flattened = []
    if res.data:
        for item in res.data:
            project_info = item.get("projects")
            p_name = "Unknown Project"
            if isinstance(project_info, dict):
                p_name = project_info.get("name", "Unknown")
            elif isinstance(project_info, list) and len(project_info) > 0:
                p_name = project_info[0].get("name", "Unknown")
            item["project_name"] = p_name
            if "projects" in item:
                del item["projects"]
            flattened.append(item)
    return flattened

@router.get("/applicants", response_model=List[Applicant])
def list_applicants(project_id: str, user_id: str = Depends(get_current_user)):
    proj_check = supabase.table("projects")\
        .select("id")\
        .eq("id", project_id)\
        .eq("owner_id", user_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized for this Project")

    res = supabase.table("applicants")\
        .select("*")\
        .eq("project_id", project_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .order("ai_score", desc=True)\
        .execute()
    return res.data

@router.patch("/applicants/{applicant_id}", response_model=Applicant)
def update_applicant(applicant_id: str, update: ApplicantUpdate, user_id: str = Depends(get_current_user)):
    app_data = supabase.table("applicants").select("project_id, name, email").eq("id", applicant_id).execute()
    if not app_data.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
        
    applicant = app_data.data[0]
    proj_check = supabase.table("projects").select("id, name").eq("id", applicant['project_id']).eq("owner_id", user_id).eq("deleted_at", EPOCH_SENTINEL).execute()
    if not proj_check.data:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    project_name = proj_check.data[0]['name']
    send_decision_email(applicant['email'], applicant['name'], update.status, project_name)
    res = supabase.table("applicants").update({"status": update.status}).eq("id", applicant_id).execute()
    return res.data[0]

@router.delete("/applicants/{applicant_id}")
def delete_applicant(applicant_id: str, user_id: str = Depends(get_current_user)):
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    app_res = supabase.table("applicants").select("project_id").eq("id", applicant_id).execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
        
    proj_check = supabase.table("projects").select("id").eq("id", app_res.data[0]["project_id"]).eq("owner_id", user_id).execute()
    if not proj_check.data:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase.table("applicants").update({"deleted_at": now}).eq("id", applicant_id).execute()
    return {"status": "success", "message": "Applicant archived"}

# --- Public Submission ---
@router.post("/apply")
async def apply_candidate(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: EmailStr = Form(...),
    cv: UploadFile = File(...)
):
    """Public endpoint for CV submission. Validates project status and AI eligibility."""
    x_api_key = request.headers.get("X-API-KEY")
    x_project_id = request.headers.get("X-PROJECT-ID")
    
    if x_api_key:
        key_res = supabase.table("api_keys").select("project_id").eq("key_value", x_api_key).execute()
        if not key_res.data:
            raise HTTPException(status_code=401, detail="Invalid API Key")
        x_project_id = key_res.data[0]["project_id"]
    else:
        proj_check = supabase.table("projects").select("id, is_active").eq("id", x_project_id).eq("deleted_at", EPOCH_SENTINEL).execute()
        if not proj_check.data:
            raise HTTPException(status_code=404, detail="Project not found")
        if not proj_check.data[0].get("is_active", True):
            raise HTTPException(status_code=403, detail="Position closed")

    content = await cv.read()
    cv_hash = calculate_cv_hash(content)
    
    # Deduplication
    existing = supabase.table("applicants").select("*").eq("project_id", x_project_id).eq("cv_hash", cv_hash).eq("deleted_at", EPOCH_SENTINEL).execute()
    if existing.data:
        return existing.data[0]

    # Rule-based validation
    mime_type, _ = validate_cv_file(cv, content)
    cv_text = extract_and_validate_cv_text(content, mime_type)
    
    if not is_professional_cv(cv_text):
        raise HTTPException(status_code=400, detail="Irrelevant content. CV must be professional.")

    res = supabase.table("applicants").insert({
        "project_id": x_project_id,
        "name": name,
        "email": email,
        "cv_text": cv_text,
        "cv_hash": cv_hash,
        "status": "processing"
    }).execute()
    
    applicant = res.data[0]
    background_tasks.add_task(process_ai_score, applicant["id"], name, email, cv_text)
    return applicant

@router.post("/applicants/{applicant_id}/convert", response_model=dict)
def convert_to_employee(applicant_id: str, user_id: str = Depends(get_current_user)):
    """
    Manually convert an approved applicant to an active employee.
    HARIS Philosophy: Human-in-the-loop Final Action.
    """
    # 1. Fetch Applicant
    app_res = supabase.table("applicants").select("*").eq("id", applicant_id).execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
    
    applicant = app_res.data[0]
    
    # 2. Verify Status
    if applicant["status"] != "approved":
        raise HTTPException(status_code=400, detail="Only approved applicants can be converted to employees")
        
    # 3. Check if already exists in employees (by email)
    emp_check = supabase.table("employees").select("id").eq("email", applicant["email"]).execute()
    if emp_check.data:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    # 4. Create Employee Record
    new_employee = {
        "name": applicant["name"],
        "email": applicant["email"],
        "role": "New Hire (Junior)", # Default role, can be updated later
        "department": "Unassigned",
        "leave_remaining": 12, # Policy Default
        "status": "active",
        "join_date": datetime.datetime.now().date().isoformat()
    }
    
    res = supabase.table("employees").insert(new_employee).execute()
    
    if not res.data:
         raise HTTPException(status_code=500, detail="Failed to create employee record")
         
    # 5. Update Applicant Status to 'hired' to prevent double conversion
    supabase.table("applicants").update({"status": "hired"}).eq("id", applicant_id).execute()
    
    return {"status": "success", "message": "Candidate successfully hired", "employee_id": res.data[0]["id"]}

@router.post("/applicants/{applicant_id}/verify")
def verify_and_convert_applicant(
    applicant_id: str,
    request: VerifyApplicantRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Verification stage: HR fills complete employee data before final conversion.
    This is the final manual step before creating an employee record.
    """
    # 1. Fetch Applicant
    app_res = supabase.table("applicants").select("*").eq("id", applicant_id).execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Applicant not found")
    
    applicant = app_res.data[0]
    
    # 2. Verify Status (must be interview_approved)
    if applicant["status"] != "interview_approved":
        raise HTTPException(status_code=400, detail="Only interview-approved applicants can be verified")
        
    # 3. Check if already exists in employees (by email, excluding deleted)
    emp_check = supabase.table("employees").select("id").eq("email", applicant["email"]).eq("deleted_at", EPOCH_SENTINEL).execute()
    if emp_check.data:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    # 4. Create Employee Record with HR-provided data
    new_employee = {
        "name": applicant["name"],
        "email": applicant["email"],
        "role": request.role,
        "department": request.department,
        "leave_remaining": request.leave_remaining,
        "status": "active",
        "join_date": request.join_date
    }
    
    res = supabase.table("employees").insert(new_employee).execute()
    
    if not res.data:
         raise HTTPException(status_code=500, detail="Failed to create employee record")
         
    # 5. Update Applicant Status to 'hired' to prevent double conversion
    supabase.table("applicants").update({"status": "hired"}).eq("id", applicant_id).execute()
    
    return {"status": "success", "message": "Candidate verified and hired", "employee_id": res.data[0]["id"]}
