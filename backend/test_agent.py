from agent import score_candidate
import os
from dotenv import load_dotenv

load_dotenv()

print("Testing AI Agent...")
print(f"API KEY Present: {bool(os.environ.get('GROQ_API_KEY'))}")

try:
    result = score_candidate(
        "Test Candidate", 
        "test@example.com", 
        "Senior Software Engineer. Python, React, FastAPI, SQL. System Design expert. 10 years experience."
    )
    print("Result:", result)
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
