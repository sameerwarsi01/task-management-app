import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from email_service import send_task_assigned_email

load_dotenv(dotenv_path="../.env")

app = Flask(__name__)
CORS(app)

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
    
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Backend is running"}), 200

# 1. Fetch all registered users (for assignment dropdown)
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

    response = supabase.table("tasks").select("*, assigned_user:profiles!tasks_assigned_to_fkey(full_name, email), creator:profiles!tasks_created_by_fkey(full_name, email)").order("created_at", desc=True).execute()
    return jsonify(response.data), 200

# 3. Create a new tasks & notify asignee
@app.route("/api/tasks", methods=["POST"])
def create_task():
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    title = data.get("title")
    description = data.get("description", "")
    priority = data.get("priority", "Medium")
    assigned_to = data.get("assigned_to")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    task_payload = {
        "title": title,
        "description": description,
        "priority": priority,
        "created_by": user.id,
        "assigned_to": assigned_to,
        "status": "Todo"
    }

    insert_res = supabase.table("tasks").insert(task_payload).execute()
    new_task = insert_res.data[0] if insert_res.data else None

    # Send email notification if task is assigned to someone else
    if assigned_to:
        assignee_res = supabase.table("profiles").select("email").eq("id", assigned_to).single().execute()
        creator_res = supabase.table("profiles").select("full_name").eq("id", user.id).single().execute()
        
        assignee_email = assignee_res.data.get("email") if assignee_res.data else None
        creator_name = creator_res.data.get("full_name") if creator_res.data else "A team member"

        if assignee_email:
            send_task_assigned_email(assignee_email, title, creator_name)

    return jsonify(new_task), 201

# 4. Update task (status, priority, etc.)
@app.route("/api/tasks/<task_id>", methods=["PATCH"])
def update_task(task_id):
    user = authenticate_user(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    updates = request.json
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
    app.run(port=5000, debug=True)        