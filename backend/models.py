from pydantic import BaseModel
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
    org_id: UUID
    name: str
    template_id: str

class Project(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    template_id: str
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
    created_at: datetime

class ApplicantUpdate(BaseModel):
    status: str
