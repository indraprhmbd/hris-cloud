from database import supabase

try:
    res = supabase.table("templates").select("*").execute()
    print("Templates found:", res.data)
    if not any(t['id'] == 'recruitment-ai-v1' for t in res.data):
        print("MISSING_TEMPLATE: 'recruitment-ai-v1' is missing.")
except Exception as e:
    print(f"Error checking templates: {e}")
