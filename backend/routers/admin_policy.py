import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import supabase
from dependencies import get_current_user
from services.policy_service import POLICY_DIR

router = APIRouter()

@router.post("/upload")
async def upload_policy_document(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """
    HR uploads a PDF policy document.
    File is saved to local storage (for MVP) which the RAG service reads.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if not os.path.exists(POLICY_DIR):
        os.makedirs(POLICY_DIR)
        
    file_path = os.path.join(POLICY_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    return {"status": "success", "filename": file.filename, "message": "Policy uploaded and ready for indexing"}

@router.get("/files")
def list_policy_files(user_id: str = Depends(get_current_user)):
    """List uploaded policy files."""
    if not os.path.exists(POLICY_DIR):
        return []
        
    files = []
    for filename in os.listdir(POLICY_DIR):
        if filename.endswith(".pdf"):
            files.append(filename)
    return files

@router.delete("/files/{filename}")
def delete_policy_file(filename: str, user_id: str = Depends(get_current_user)):
    """Delete a policy file."""
    # Basic path safety check
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    file_path = os.path.join(POLICY_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"status": "success", "message": "File deleted"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

@router.get("/logs")
def get_policy_logs(user_id: str = Depends(get_current_user), limit: int = 50):
    """View Q&A logs for audit."""
    res = supabase.table("policy_logs")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return res.data
