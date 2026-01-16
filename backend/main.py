from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from rate_limiter import rate_limit_middleware
from routers import recruitment, policy, employees, admin_policy

load_dotenv()

app = FastAPI(
    title="HRIS Cloud API",
    description="AI-Powered HRIS Hackathon MVP",
    version="2.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "https://hris-cloud.vercel.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.middleware("http")(rate_limit_middleware)

# Root Endpoint
@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "service": "HRIS Cloud",
        "version": "2.0.0",
        "docs": "/docs"
    }

# Include Routers
app.include_router(recruitment.router, tags=["Recruitment"])
app.include_router(employees.router, prefix="/employees", tags=["Employee Data"])
app.include_router(admin_policy.router, prefix="/admin/policy", tags=["HR Policy Mgmt"])
app.include_router(policy.router, prefix="/policy", tags=["Employee Policy Q&A"])
