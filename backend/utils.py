import hashlib

def calculate_cv_hash(content: bytes) -> str:
    """
    Calculate SHA-256 hash of file content.
    Used for deduplication to prevent redundant AI processing.
    """
    return hashlib.sha256(content).hexdigest()
