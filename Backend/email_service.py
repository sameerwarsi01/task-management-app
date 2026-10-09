import os
import threading
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

def send_email_async(to_email, subject, html_content):
    def _send():
        if not RESEND_API_KEY:
            print("[Email Service] Warning: RESEND_API_KEY missing in environment variables")
            return
        try:
            resend.api_key = RESEND_API_KEY
            params = {
                "from": "TaskFlow <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            resend.Emails.send(params)
            print(f"[Email Service] Notification sent successfully to {to_email}")
        except Exception as e:
            print(f"[Email Service Error] Failed to send email via Resend: {e}")

    threading.Thread(target=_send).start()

def send_task_assigned_email(to_email, task_title, creator_name):
    subject = f"New Task Assigned: {task_title}"
    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>You have been assigned a new task!</h2>
        <p><strong>{creator_name}</strong> assigned you to work on:</p>
        <div style="background: #f4f4f4; padding: 12px; border-radius: 6px; margin: 12px 0;">
            <h3 style="margin: 0; color: #111;">{task_title}</h3>
        </div>
        <p>Log in to your TaskFlow dashboard to view details and update progress.</p>
    </div>
    """
    send_email_async(to_email, subject, body)