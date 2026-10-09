'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

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
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Checking session...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Management App</h1>
          <p className="text-gray-500 mb-6 text-sm">Organize work and collaborate seamlessly</p>
          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/` },
              })
            }
            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar user={user} onLogout={() => supabase.auth.signOut()} />
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskForm users={users} onCreateTask={handleCreateTask} />
        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </main>
  );
}