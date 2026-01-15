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
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
            f"Only PDF and DOCX documents are accepted."
        )
    
    return mime


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
                "hint": "Please upload a valid PDF or DOCX resume (max 5MB)"
            }
        )
