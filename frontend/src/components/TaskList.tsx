'use client';

import { Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_user?: { full_name: string; email: string };
}

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, currentStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onStatusChange, onDeleteTask }: TaskListProps) {
  return (
    <section className="md:col-span-2 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Tasks ({tasks.length})</h2>

      {tasks.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          No tasks yet. Create one on the left to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            // Case-insensitive comparison ke liye lowercase banayein
            const statusLower = (task.status || '').toLowerCase();
            const priorityLower = (task.priority || '').toLowerCase();

            return (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(task.id, statusLower)}
                      className="text-gray-400 hover:text-blue-600 transition flex items-center justify-center p-0.5 cursor-pointer"
                    >
                      {statusLower === 'done' ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : statusLower === 'in_progress' || statusLower === 'in progress' ? (
                        <Clock className="text-amber-500" size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <h3
                      className={`font-semibold text-sm ${
                        statusLower === 'done' ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </h3>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        priorityLower === 'high'
                          ? 'bg-red-100 text-red-700'
                          : priorityLower === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-600 pl-7">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-400 pl-7 pt-1">
                    {task.assigned_user && (
                      <span>
                        Assigned to:{' '}
                        <strong className="text-gray-600">
                          {task.assigned_user.full_name || task.assigned_user.email}
                        </strong>
                      </span>
                    )}
                    <span>
                      Status: <strong className="text-gray-600 capitalize">{task.status}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}