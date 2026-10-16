'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { Layers, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        API.get('/api/tasks'),
        API.get('/api/users'),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleCreateTask = async (taskPayload: any) => {
    await API.post('/api/tasks', taskPayload);
    loadData();
  };

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'todo'
        ? 'in_progress'
        : currentStatus === 'in_progress'
        ? 'done'
        : 'todo';
    await API.patch(`/api/tasks/${taskId}`, { status: nextStatus });
    loadData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await API.delete(`/api/tasks/${taskId}`);
    setTasks(tasks.filter((t: any) => t.id !== taskId));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          Authenticating session...
        </div>
      </main>
    );
  }

  // Modern SaaS Login View
  if (!user) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-[#0a0c10] px-4 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
            <Layers size={24} />
          </div>

          <h1 className="text-xl font-semibold text-white tracking-tight">TaskFlow Workspace</h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
            High-velocity project tracking with role assignment and pipeline analytics.
          </p>

          <div className="my-6 pt-6 border-t border-slate-800/80">
            <button
              onClick={() =>
                supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { 
                redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/` 
           },
         })
       }
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.3 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.27c-.24-.73-.38-1.5-.38-2.27s.14-1.54.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight size={13} className="text-slate-400 ml-auto" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> Supabase Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-amber-500" /> Realtime Sync
            </span>
          </div>
        </div>
      </main>
    );
  }

  // Modern Dashboard View
  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-900 pb-16">
      <Navbar user={user} onLogout={() => supabase.auth.signOut()} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <TaskForm users={users} onCreateTask={handleCreateTask} />
          </div>
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </main>
  );
}