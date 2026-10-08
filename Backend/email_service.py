import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import threading

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_email_async(to_email, subject, html_content):
    def _send():
        if not GMAIL_USER or not GMAIL_APP_PASSWORD:
            print("[Email Service] Warning: Gmail credentials missing in .env")
            return
        try:
            msg = MIMEMultipart()
            msg["From"] = f"TaskFlow App <{GMAIL_USER}>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_USER, to_email, msg.as_string())
            print(f"[Email Service] Notification sent to {to_email}")
        except Exception as e:
            print(f"[Email Service Error] Failed to send email: {e}")

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