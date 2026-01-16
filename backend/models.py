from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class OrganizationCreate(BaseModel):
    name: str

class Organization(BaseModel):
    id: UUID
    name: str
    created_at: datetime

class ProjectCreate(BaseModel):
    org_id: Optional[UUID] = None
    name: str
    template_id: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    is_active: Optional[bool] = None

class Project(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    template_id: str
    is_active: bool = True
    description: Optional[str]
    requirements: Optional[str]
    benefits: Optional[str]
    org_name: Optional[str] = None
    created_at: datetime

class APIKey(BaseModel):
    id: UUID
    project_id: UUID
    key_value: str
    created_at: datetime

class ApplicantCreate(BaseModel):
    name: str
    email: str
    cv_text: str

class Applicant(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    email: str
    cv_text: str
    ai_score: Optional[int]
    ai_reasoning: Optional[str]
    status: str
    experience_years: Optional[int] = None
    key_skills: Optional[str] = None
    cv_valid: bool = True
    project_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: Optional[str] = None
    join_date: Optional[datetime] = None
    leave_remaining: int = 12
    status: str = "active"

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    leave_remaining: Optional[int] = None
    status: Optional[str] = None

class Employee(EmployeeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class ApplicantUpdate(BaseModel):
    status: str

class VerifyApplicantRequest(BaseModel):
    department: str
    role: str
    join_date: str
    leave_remaining: int = 12
