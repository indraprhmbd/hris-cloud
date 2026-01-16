"""
CV Validation Module
Validates file types, sizes, and formats before processing.
Rejects invalid files early to prevent wasted processing.
"""

from fastapi import UploadFile, HTTPException
from typing import Tuple
import magic  # python-magic for file type detection

# Configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {
    "application/pdf"
}


class ValidationError(Exception):
    """Custom exception for validation failures"""
    pass


def validate_file_extension(filename: str) -> None:
    """
    Validate file has an allowed extension.
    
    Args:
        filename: Name of the uploaded file
        
    Raises:
        ValidationError: If extension is not allowed
    """
    if not filename:
        raise ValidationError("Filename is required")
    
    # Get extension (case-insensitive)
    ext = None
    for allowed_ext in ALLOWED_EXTENSIONS:
        if filename.lower().endswith(allowed_ext):
            ext = allowed_ext
            break
    
    if not ext:
        raise ValidationError(
            f"Invalid file type. Only PDF and DOCX files are accepted. "
            f"Received: {filename}"
        )


def validate_file_size(content: bytes) -> None:
    """
    Validate file size is within limits.
    
    Args:
        content: File content as bytes
        
    Raises:
        ValidationError: If file is too large
    """
    size = len(content)
    if size > MAX_FILE_SIZE:
        size_mb = size / (1024 * 1024)
        raise ValidationError(
            f"File too large ({size_mb:.1f}MB). Maximum size is 5MB."
        )
    
    if size == 0:
        raise ValidationError("File is empty")


def validate_mime_type(content: bytes) -> str:
    """
    Validate file MIME type matches content (not just extension).
    Prevents renamed files from bypassing validation.
    
    Args:
        content: File content as bytes
        
    Returns:
        Detected MIME type
        
    Raises:
        ValidationError: If MIME type is not allowed
    """
    try:
        mime = magic.from_buffer(content, mime=True)
    except Exception as e:
        raise ValidationError(f"Could not detect file type: {str(e)}")
    
    if mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Invalid file format. File appears to be '{mime}'. "
            f"Only PDF documents are accepted."
        )
    
    return mime


def is_professional_cv(text: str) -> bool:
    """
    Rule-based filtering to decide if a text looks like a professional CV.
    Cost-saving measure before triggering AI.
    """
    if not text:
        return False
        
    # Keywords indicating a professional profile
    professional_keywords = [
        "experience", "education", "skills", "projects", "work", 
        "employment", "summary", "contact", "email", "phone",
        "developer", "engineer", "specialist", "manager", "lead"
    ]
    
    text_lower = text.lower()
    match_count = sum(1 for word in professional_keywords if word in text_lower)
    
    # Requirement: At least 3 professional keywords must be present
    return match_count >= 3


def validate_cv_file(file: UploadFile, content: bytes) -> Tuple[str, None]:
    """
    Complete file validation pipeline.
    
    Args:
        file: FastAPI UploadFile object
        content: File content as bytes
        
    Returns:
        Tuple of (mime_type, None) if validation passes
        
    Raises:
        HTTPException: If any validation fails (400 Bad Request)
    """
    try:
        # Step 1: Extension check
        validate_file_extension(file.filename)
        
        # Step 2: Size check
        validate_file_size(content)
        
        # Step 3: MIME type check (prevents spoofing)
        mime_type = validate_mime_type(content)
        
        return mime_type, None
        
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid CV file",
                "message": str(e),
                "hint": "Please upload a valid PDF resume (max 5MB)"
            }
        )
