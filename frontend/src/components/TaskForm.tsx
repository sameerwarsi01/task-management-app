'use client';

import { useState } from 'react';
import { Plus, Sparkles, User, Tag } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface TaskFormProps {
  users: Profile[];
  onCreateTask: (task: { title: string; description: string; priority: string; assigned_to: string | null }) => Promise<void>;
}

export default function TaskForm({ users, onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onCreateTask({
      title,
      description,
      priority,
      assigned_to: assignedTo || null,
    });
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setLoading(false);
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] h-fit">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Create Issue</h2>
          <p className="text-xs text-slate-500">Plan and assign workspace task</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Sparkles size={14} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement OAuth 2.0 PKCE flow"
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, acceptance criteria or context..."
            rows={3}
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <Tag size={12} className="text-slate-400" /> Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <User size={12} className="text-slate-400" /> Assignee
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all truncate"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Plus size={15} />
          <span>{loading ? 'Creating Task...' : 'Create Task'}</span>
        </button>
      </form>
    </section>
  );
}