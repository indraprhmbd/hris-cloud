"""
Quick script to migrate applicant statuses from old flow to new flow.
Run this to fix existing data without resetting the database.
"""

import os
from supabase import create_client

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def migrate_statuses():
    """
    Migrate old statuses to new recruitment flow statuses:
    - 'pending' or 'approved' -> 'processing' (ready for CV Inbox review)
    - Keep 'rejected' and 'hired' as is
    """
    
    print("🔍 Fetching all applicants...")
    result = supabase.table("applicants").select("id, name, email, status").execute()
    applicants = result.data
    
    print(f"📊 Found {len(applicants)} applicants")
    print("\n📋 Current status distribution:")
    
    # Count statuses
    status_counts = {}
    for app in applicants:
        status = app['status']
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        print(f"   - {status}: {count}")
    
    # Migrate statuses
    print("\n🔄 Starting migration...")
    migrated = 0
    
    for app in applicants:
        old_status = app['status']
        new_status = None
        
        # Map old statuses to new flow
        if old_status in ['pending', 'approved']:
            new_status = 'processing'  # Will appear in CV Inbox
        # Keep 'rejected' and 'hired' as is
        
        if new_status and new_status != old_status:
            supabase.table("applicants").update({
                "status": new_status
            }).eq("id", app['id']).execute()
            
            print(f"   ✓ {app['name']}: {old_status} -> {new_status}")
            migrated += 1
    
    print(f"\n✅ Migration complete! Updated {migrated} applicants")
    
    # Show new distribution
    print("\n📊 New status distribution:")
    result = supabase.table("applicants").select("status").execute()
    new_counts = {}
    for app in result.data:
        status = app['status']
        new_counts[status] = new_counts.get(status, 0) + 1
    
    for status, count in new_counts.items():
        print(f"   - {status}: {count}")

if __name__ == "__main__":
    migrate_statuses()
