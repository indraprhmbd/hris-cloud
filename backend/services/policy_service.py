import os
from typing import List, Dict
from pypdf import PdfReader
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from database import supabase

# Initialize LLM
llm = ChatGroq(
    temperature=0,
    model_name="llama-3.1-8b-instant",
    api_key=os.environ.get("GROQ_API_KEY")
)

POLICY_DIR = "policies"

def extract_text_from_policies() -> str:
    """Read all PDFs in the policies folder and combine text."""
    combined_text = ""
    if not os.path.exists(POLICY_DIR):
        return ""
        
    for filename in os.listdir(POLICY_DIR):
        if filename.endswith(".pdf"):
            try:
                path = os.path.join(POLICY_DIR, filename)
                reader = PdfReader(path)
                for page in reader.pages:
                    combined_text += page.extract_text() + "\n"
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    return combined_text

def answer_policy_question(user_id: str, query: str, employee_context: Dict = None) -> Dict:
    """
    RAG-style question answering with Employee Context injection.
    HARIS Philosophy: AI is a checker/drafter, NOT an executor.
    """
    policy_text = extract_text_from_policies()
    
    if not policy_text:
        return {
            "answer": "Maaf, belum ada dokumen kebijakan yang diunggah oleh HR.",
            "reasoning": "No policy documents found in the backend."
        }
    
    # Context Injection
    emp_info = "Status: Unknown Employee"
    if employee_context:
        emp_info = (
            f"Employee Name: {employee_context.get('name')}\n"
            f"Role: {employee_context.get('role')}\n"
            f"Leave Remaining: {employee_context.get('leave_remaining')} days\n"
            f"Join Date: {employee_context.get('join_date')}"
        )

    system_prompt = (
        "You are HARIS, an AI Policy Assistant. "
        "Your role is to READ policy documents and employee data to answer questions. "
        "YOU MUST NOT EXECUTE ANY ACTIONS. YOU CANNOT APPROVE, REJECT, OR SUBMIT REQUESTS. "
        "If the user asks to take leave, check their 'Leave Remaining' vs the Policy rules, "
        "then generated a DRAFT response or explain why they can/cannot. "
        "ALWAYS cite the specific policy section in your reasoning.\n\n"
        f"--- EMPLOYEE DATA (READ-ONLY) ---\n{emp_info}\n\n"
        f"--- POLICY DOCUMENTS ---\n{policy_text}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", f"USER QUESTION: {query}")
    ])
    
    try:
        # We use a simple chain here
        chain = prompt | llm
        response = chain.invoke({})
        
        # Consistent JSON parsing
        import json
        try:
            res_content = response.content
            # Try to find JSON block if mixed with text
            if "```json" in res_content:
                res_content = res_content.split("```json")[1].split("```")[0].strip()
            elif "{" in res_content:
                start = res_content.find("{")
                end = res_content.rfind("}") + 1
                res_content = res_content[start:end]
                
            res_json = json.loads(res_content)
        except:
            # Fallback if LLM outputs plain text
            res_json = {"answer": response.content, "reasoning": "Direct LLM response"}
            
        # Log to Supabase
        supabase.table("policy_logs").insert({
            "user_id": user_id,
            "query": query,
            "answer": res_json.get("answer"),
            "reasoning": res_json.get("reasoning")
        }).execute()
        
        return res_json
        
    except Exception as e:
        print(f"Policy AI Error: {e}")
        return {
            "answer": "Maaf, HARIS sedang mengalami gangguan.",
            "reasoning": str(e)
        }
