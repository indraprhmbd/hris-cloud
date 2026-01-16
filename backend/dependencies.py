import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from cryptography.hazmat.primitives import serialization

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Get Supabase JWT secret from environment
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            # Fallback to unverified for local dev ONLY
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            # Proper verification with secret
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256", "HS384", "HS512", "ES256", "ES384", "ES512", "RS256", "RS384", "RS512"],
                options={"verify_aud": False, "verify_signature": True},
                leeway=120
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid Token: No sub claim")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")
