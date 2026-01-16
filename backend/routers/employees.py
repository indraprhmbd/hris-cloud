import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from database import supabase, EPOCH_SENTINEL
from dependencies import get_current_user
from models import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()

@router.post("/", response_model=Employee)
def create_employee(employee: EmployeeCreate, user_id: str = Depends(get_current_user)):
    """Manual creation of employee record by HR."""
    # Check for duplicate email
    existing = supabase.table("employees")\
        .select("id")\
        .eq("email", employee.email)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    data = employee.dict()
    # Ensure join_date is ISO format if present, else default handled by DB or Pydantic
    if data.get('join_date'):
         data['join_date'] = data['join_date'].isoformat()
    
    res = supabase.table("employees").insert(data).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create employee")
    return res.data[0]

@router.get("/", response_model=List[Employee])
def list_employees(user_id: str = Depends(get_current_user)):
    """List all active employees for HR Dashboard."""
    res = supabase.table("employees")\
        .select("*")\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .order("name")\
        .execute()
    return res.data

@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: str, user_id: str = Depends(get_current_user)):
    res = supabase.table("employees")\
        .select("*")\
        .eq("id", employee_id)\
        .eq("deleted_at", EPOCH_SENTINEL)\
        .execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    return res.data[0]

@router.patch("/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, updates: EmployeeUpdate, user_id: str = Depends(get_current_user)):
    """Manual update of employee data (e.g. leave balance adjustment)."""
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    res = supabase.table("employees").update(update_data).eq("id", employee_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Employee not found or update failed")
    return res.data[0]

@router.delete("/{employee_id}")
def delete_employee(employee_id: str, user_id: str = Depends(get_current_user)):
    """Soft delete employee record."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    res = supabase.table("employees").update({"deleted_at": now}).eq("id", employee_id).execute()
    
    return {"status": "success", "message": "Employee archived"}
