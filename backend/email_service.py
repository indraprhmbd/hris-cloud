import os
import resend
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_decision_email(to_email: str, candidate_name: str, status: str, project_name: str):
    if not RESEND_API_KEY:
        print(f"[MOCK EMAIL] To: {to_email}, Status: {status} (No API Key)")
        return

    subject = ""
    html_content = ""

    if status == "approved":
        subject = f"Good News regarding your application for {project_name}"
        html_content = f"""
        <h1>Congratulations, {candidate_name}!</h1>
        <p>We are pleased to inform you that your application for <strong>{project_name}</strong> has been <strong>approved</strong> for the next stage.</p>
        <p>Our team will contact you shortly to schedule an interview.</p>
        <br>
        <p>Best regards,<br>Recruitment Team</p>
        """
    elif status == "rejected":
        subject = f"Update on your application for {project_name}"
        html_content = f"""
        <p>Dear {candidate_name},</p>
        <p>Thank you for your interest in the <strong>{project_name}</strong> position.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>We wish you the best in your job search.</p>
        <br>
        <p>Best regards,<br>Recruitment Team</p>
        """
    else:
        return

    try:
        r = resend.Emails.send({
            "from": "Acme HR <onboarding@resend.dev>",
            "to": to_email,
            "subject": subject,
            "html": html_content
        })
        print(f"Email sent to {to_email}: {r}")
    except Exception as e:
        print(f"Failed to send email: {e}")
