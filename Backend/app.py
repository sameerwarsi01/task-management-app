import os
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from email_service import send_task_assigned_email

load_dotenv(dotenv_path="../.env")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE Credentials missing from .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def authenticate_user(req):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        return None

# Helper to send email in background so the UI never freezes
def async_send_email(email, title, creator_name):
    def run():
        try:
            send_task_assigned_email(email, title, creator_name)
        except Exception as e:
            print(f"[Warning] Failed to send email: {e}")
    threading.Thread(target=run, daemon=True).start()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Backend is running"}), 200

# 1. Fetch all registered users
@app.route("/api/users", methods=["GET"])
def get_users():
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    response = supabase.table("profiles").select("id, full_name, email, avatar_url").execute()
    return jsonify(response.data), 200   

# 2. Get all tasks
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    response = supabase.table("tasks").select(
        "*, assigned_user:profiles!tasks_assigned_to_fkey(full_name, email), creator:profiles!tasks_created_by_fkey(full_name, email)"
    ).order("created_at", desc=True).execute()
    return jsonify(response.data), 200

# 3. Create a new task & notify assignee
@app.route("/api/tasks", methods=["POST"])
def create_task():
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    title = data.get("title")
    description = data.get("description", "")
    priority = (data.get("priority") or "medium").lower()
    raw_assigned = data.get("assigned_to")

    assigned_to = raw_assigned if raw_assigned and str(raw_assigned).strip() != "" else None

    if not title:
        return jsonify({"error": "Title is required"}), 400

    try:
        # Step A: Ensure logged-in user profile exists in 'profiles' table
        user_meta = user.user_metadata or {}
        full_name = user_meta.get("full_name") or user_meta.get("name") or user.email
        avatar_url = user_meta.get("avatar_url") or ""

        supabase.table("profiles").upsert({
            "id": user.id,
            "full_name": full_name,
            "email": user.email,
            "avatar_url": avatar_url
        }).execute()

        # Step B: Insert task
        task_payload = {
            "title": title,
            "description": description,
            "priority": priority,
            "created_by": user.id,
            "assigned_to": assigned_to,
            "status": "todo"
        }

        insert_res = supabase.table("tasks").insert(task_payload).execute()
        new_task = insert_res.data[0] if insert_res.data else None

    except Exception as db_err:
        print(f"\n==========================================")
        print(f"[Supabase DB Error Details]: {db_err}")
        print(f"==========================================\n")
        return jsonify({"error": str(db_err)}), 500

    # Step C: Non-blocking email sending
    if assigned_to:
        try:
            assignee_res = supabase.table("profiles").select("email").eq("id", assigned_to).single().execute()
            creator_res = supabase.table("profiles").select("full_name").eq("id", user.id).single().execute()
            
            assignee_email = assignee_res.data.get("email") if assignee_res.data else None
            creator_name = creator_res.data.get("full_name") if creator_res.data else "A team member"

            if assignee_email:
                async_send_email(assignee_email, title, creator_name)
        except Exception as mail_err:
            print(f"[Warning] Email sending skipped/failed: {mail_err}")

    return jsonify(new_task), 201

# Update Route
@app.route("/api/tasks/<task_id>", methods=["PATCH"])
def update_task(task_id):
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    updates = request.json or {}
    if "status" in updates:
        updates["status"] = updates["status"].lower()
    if "priority" in updates:
        updates["priority"] = updates["priority"].lower()

    response = supabase.table("tasks").update(updates).eq("id", task_id).execute()
    return jsonify(response.data), 200

# 5. Delete a task
@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    supabase.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted successfully"}), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)