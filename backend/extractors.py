"""
CV Text Extraction Module
Extracts text from PDF and DOCX files.
Validates text quality before sending to AI.
"""

import io
import re
from typing import Tuple
from pypdf import PdfReader
from fastapi import HTTPException


# Quality thresholds
MIN_TEXT_LENGTH = 500  # Minimum characters for valid CV
MAX_TEXT_LENGTH = 50000  # Maximum to prevent token abuse
MAX_GARBAGE_RATIO = 0.3  # Max 30% non-alphanumeric characters


class ExtractionError(Exception):
    """Custom exception for extraction failures"""
    pass


def extract_text_from_pdf(content: bytes) -> str:
    """
    Extract text from PDF file.
    
    Args:
        content: PDF file content as bytes
        
    Returns:
        Extracted text
        
    Raises:
        ExtractionError: If extraction fails
    """
    try:
        reader = PdfReader(io.BytesIO(content))
        
        # Check if PDF is encrypted
        if reader.is_encrypted:
            raise ExtractionError("PDF is password-protected and cannot be processed")
        
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        
        return "\n".join(text_parts)
        
    except ExtractionError:
        raise
    except Exception as e:
        raise ExtractionError(f"Failed to extract text from PDF: {str(e)}")


def validate_text_quality(text: str) -> Tuple[bool, str]:
    """
    Validate extracted text quality.
    
    Args:
        text: Extracted text
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check if empty
    if not text or not text.strip():
        return False, "CV appears to be empty or contains no readable text"
    
    # Check minimum length
    if len(text) < MIN_TEXT_LENGTH:
        return False, f"CV text too short ({len(text)} characters). Minimum {MIN_TEXT_LENGTH} characters required. This may be a scanned image or corrupted file."
    
    # Check maximum length (prevent token abuse)
    if len(text) > MAX_TEXT_LENGTH:
        return False, f"CV text too long ({len(text)} characters). Maximum {MAX_TEXT_LENGTH} characters allowed."
    
    # Check for garbage/non-readable content
    alphanumeric_count = sum(c.isalnum() or c.isspace() for c in text)
    total_count = len(text)
    garbage_ratio = 1 - (alphanumeric_count / total_count)
    
    if garbage_ratio > MAX_GARBAGE_RATIO:
        return False, f"CV contains too many unreadable characters ({garbage_ratio*100:.0f}%). This may be a scanned image or corrupted file."
    
    # Check if it looks like a scanned image (common OCR artifacts)
    ocr_artifacts = ['|||', '___', '...', '~~~']
    artifact_count = sum(text.count(artifact) for artifact in ocr_artifacts)
    if artifact_count > 10:
        return False, "CV appears to be a scanned image. Please upload a text-based PDF or DOCX file."
    
    return True, ""


def extract_and_validate_cv_text(content: bytes, mime_type: str) -> str:
    """
    Complete text extraction and validation pipeline.
    
    Args:
        content: File content as bytes
        mime_type: MIME type of the file
        
    Returns:
        Extracted and validated text
        
    Raises:
        HTTPException: If extraction or validation fails
    """
    try:
        # Extract text from PDF
        if mime_type == "application/pdf":
            text = extract_text_from_pdf(content)
        else:
            raise ExtractionError(f"Unsupported MIME type: {mime_type}. PDF only allowed.")
        
        # Validate text quality
        is_valid, error_message = validate_text_quality(text)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid CV - Not Machine Readable",
                    "message": error_message,
                    "hint": "Please ensure your CV is a text-based PDF or DOCX file, not a scanned image."
                }
            )
        
        return text.strip()
        
    except HTTPException:
        raise
    except ExtractionError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "CV Extraction Failed",
                "message": str(e),
                "hint": "Please ensure your file is a valid, unencrypted PDF or DOCX document."
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Processing Error",
                "message": f"Unexpected error during CV processing: {str(e)}"
            }
        )
