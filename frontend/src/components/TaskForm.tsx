'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

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
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fix login redirect bug"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed steps..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-blue-500"
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
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={16} /> {loading ? 'Creating...' : 'Add Task'}
        </button>
      </form>
    </section>
  );
}