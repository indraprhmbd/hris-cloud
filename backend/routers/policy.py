from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user
from services.policy_service import answer_policy_question

router = APIRouter()

@router.get("/chat")
def chat_with_policy(query: str, user_id: str = Depends(get_current_user)):
    """
    Employee Chat endpoint.
    Retrieves answers from company policy PDFs.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
        
    return answer_policy_question(user_id, query)
