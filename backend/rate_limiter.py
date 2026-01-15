"""
Rate Limiting Middleware
Prevents cost attacks and abuse on CV upload endpoint.
"""

from fastapi import Request, HTTPException
from typing import Dict
import time
from collections import defaultdict

# In-memory rate limit store (use Redis in production)
rate_limit_store: Dict[str, list] = defaultdict(list)

# Configuration
RATE_LIMIT_PER_IP = 10  # requests per hour
RATE_LIMIT_PER_PROJECT = 100  # requests per hour
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def check_rate_limit(key: str, limit: int, window: int = RATE_LIMIT_WINDOW) -> bool:
    """
    Check if request is within rate limit.
    
    Args:
        key: Unique identifier (IP or project_id)
        limit: Maximum requests allowed
        window: Time window in seconds
        
    Returns:
        True if within limit, False if exceeded
    """
    now = time.time()
    
    # Clean old entries
    rate_limit_store[key] = [
        timestamp for timestamp in rate_limit_store[key]
        if now - timestamp < window
    ]
    
    # Check limit
    if len(rate_limit_store[key]) >= limit:
        return False
    
    # Record this request
    rate_limit_store[key].append(now)
    return True


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware for FastAPI.
    Only applies to /apply endpoint.
    """
    if request.url.path == "/apply":
        # Check IP-based rate limit
        client_ip = get_client_ip(request)
        ip_key = f"ip:{client_ip}"
        
        if not check_rate_limit(ip_key, RATE_LIMIT_PER_IP):
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {RATE_LIMIT_PER_IP} applications per hour from your IP",
                    "retry_after": 3600
                }
            )
        
        # Check project-based rate limit (if project_id in headers)
        project_id = request.headers.get("x-project-id")
        if project_id:
            project_key = f"project:{project_id}"
            if not check_rate_limit(project_key, RATE_LIMIT_PER_PROJECT):
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "message": f"Maximum {RATE_LIMIT_PER_PROJECT} applications per hour for this project",
                        "retry_after": 3600
                    }
                )
    
    response = await call_next(request)
    return response
