from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user
from services.policy_service import answer_policy_question

router = APIRouter()

@router.get("/chat")
def chat_with_policy(query: str, user_id: str = Depends(get_current_user), employee_id: str = None):
    """
    Employee Chat.
    Accepts optional 'employee_id' to simulate logged-in user context (Hackathon Demo Mode).
    """
    emp_context = None
    if employee_id:
        from database import supabase, EPOCH_SENTINEL
        res = supabase.table("employees").select("*").eq("id", employee_id).eq("deleted_at", EPOCH_SENTINEL).execute()
        if res.data:
            emp_context = res.data[0]

    return answer_policy_question(user_id, query, employee_context=emp_context)
