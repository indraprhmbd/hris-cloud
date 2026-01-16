-- Migration script to update old applicant statuses to new flow
-- Run this to fix existing applicants

-- Old status: 'pending' or 'approved' -> New: 'processing' (awaiting AI or ready for review)
UPDATE applicants 
SET status = 'processing' 
WHERE status IN ('pending', 'approved') 
  AND status != 'hired' 
  AND status != 'rejected';

-- If you want to preserve 'approved' as 'interview_approved' instead:
-- UPDATE applicants 
-- SET status = 'interview_approved' 
-- WHERE status = 'approved';

-- Verify the migration
SELECT status, COUNT(*) as count 
FROM applicants 
GROUP BY status;
