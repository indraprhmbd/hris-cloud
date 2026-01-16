from database import supabase
from agent import score_candidate

def process_ai_score(applicant_id: str, name: str, email: str, cv_text: str):
    """Background task to score candidates using AI Agent."""
    result = score_candidate(name, email, cv_text)
    
    # Update score and reasoning
    supabase.table("applicants").update({
        "ai_score": result["score"],
        "ai_reasoning": result["reasoning"],
        "status": "screened" if result["score"] >= 50 else "rejected"
    }).eq("id", applicant_id).execute()
