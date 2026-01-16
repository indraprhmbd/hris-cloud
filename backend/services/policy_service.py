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

def answer_policy_question(user_id: str, query: str) -> Dict:
    """
    RAG-style question answering.
    1. Extracts context from local PDFs.
    2. Uses LLM to answer based ONLY on that context.
    3. Logs the interaction for HR.
    """
    context = extract_text_from_policies()
    
    if not context:
        return {
            "answer": "Maaf, saat ini dokumen kebijakan belum tersedia di sistem. Silakan hubungi HR.",
            "reasoning": "No policy documents found in the backend 'policies/' folder."
        }
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an HR Policy Assistant. Use the provided POLICY CONTEXT to answer the user question. "
                   "If the answer is not in the context, say you don't know and advise contacting HR. "
                   "Be professional and concise. Provide reasoning for your answer. "
                   "Output MUST be strict JSON with keys: 'answer' and 'reasoning'."),
        ("user", f"POLICY CONTEXT:\n{context}\n\nUSER QUESTION: {query}")
    ])
    
    try:
        # We use a simple chain here
        chain = prompt | llm
        response = chain.invoke({})
        
        # Simple parsing if it's not JSON (Llama 3 is usually good at JSON if told)
        # For simplicity in MVP, we can use JsonOutputParser but let's keep it robust
        import json
        try:
            res_json = json.loads(response.content)
        except:
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
            "answer": "Sistem sedang mengalami gangguan saat memproses pertanyaan Anda.",
            "reasoning": str(e)
        }
