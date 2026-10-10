import os
import threading
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
VERIFIED_TEST_EMAIL = "sameerwarsibgp786@gmail.com"

def send_email_async(to_email, subject, html_content):
    def _send():
        if not RESEND_API_KEY:
            print("[Email Service] Warning: RESEND_API_KEY missing in environment")
            return
        try:
            resend.api_key = RESEND_API_KEY
            
            # Resend sandbox mode handling
            recipient = to_email if to_email == VERIFIED_TEST_EMAIL else VERIFIED_TEST_EMAIL
            
            notice_header = ""
            if recipient != to_email:
                notice_header = f"""
                <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 10px; margin-bottom: 15px; font-size: 13px; color: #374151;">
                    <strong>[Sandbox Environment Notice]</strong><br/>
                    Intended Recipient: <code>{to_email}</code><br/>
                    <em>Delivered to verified sandbox admin to comply with Resend unverified domain policies.</em>
                </div>
                """

            params = {
                "from": "TaskFlow <onboarding@resend.dev>",
                "to": [recipient],
                "subject": f"[{to_email}] {subject}" if recipient != to_email else subject,
                "html": notice_header + html_content,
            }
            
            response = resend.Emails.send(params)
            print(f"[Email Service] Notification sent successfully for recipient {to_email}: {response}")
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

def send_task_completed_email(to_email, task_title, completed_by_name):
    subject = f"Task Completed: {task_title}"
    body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #16a34a;">Task Marked as Completed!</h2>
        <p>Great news! The task <strong>{task_title}</strong> has been marked as completed by <strong>{completed_by_name}</strong>.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin: 12px 0;">
            <h3 style="margin: 0; color: #15803d;">✔ {task_title}</h3>
            <p style="margin: 4px 0 0 0; color: #166534; font-size: 14px;">Status: Completed</p>
        </div>
        <p>Visit your dashboard to review the updates.</p>
    </div>
    """
    send_email_async(to_email, subject, body)