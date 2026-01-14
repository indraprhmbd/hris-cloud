import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Define the output structure
class Assessment(BaseModel):
    score: int = Field(description="Score between 0 and 100")
    reasoning: str = Field(description="Concise explanation for the score")

# Initialize LLM
# We use Groq as requested by user
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.1-8b-instant", 
    api_key=os.environ.get("GROQ_API_KEY") # Ensure this env var matches what user set
)

# Create Prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert AI Technical Recruiter. Your job is to screen candidates for a Generic Senior Software Engineer role. "
               "Look for mentions of: Python, JavaScript, React, FastAPI, SQL, System Design. "
               "Be strict but fair. "
               "Output MUST be strict JSON with keys: 'score' (integer 0-100) and 'reasoning' (string)."),
    ("user", "Candidate Name: {name}\nEmail: {email}\n\nCV Content:\n{cv_text}")
])

parser = JsonOutputParser(pydantic_object=Assessment)

chain = prompt | llm | parser

def score_candidate(name: str, email: str, cv_text: str):
    try:
        if not cv_text or len(cv_text) < 50:
            return {"score": 0, "reasoning": "CV content too short or empty."}
            
        result = chain.invoke({"name": name, "email": email, "cv_text": cv_text})
        return result
    except Exception as e:
        print(f"AI Error: {e}")
        return {"score": 0, "reasoning": "AI scoring failed due to error."}
