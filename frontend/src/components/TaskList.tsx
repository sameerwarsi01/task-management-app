'use client';

import { useState } from 'react';
import { Trash2, CheckCircle2, Clock, Circle, User } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const filteredTasks = tasks.filter((t) => {
    const s = (t.status || '').toLowerCase();
    if (filter === 'active') return s !== 'done';
    if (filter === 'done') return s === 'done';
    return true;
  });

  const doneCount = tasks.filter((t) => (t.status || '').toLowerCase() === 'done').length;

  return (
    <section className="space-y-4">
      {/* Header controls & filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Task Pipeline</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              {tasks.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {doneCount} of {tasks.length} resolved
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100/90 text-xs font-medium">
          {(['all', 'active', 'done'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task cards list */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-600">No tasks in this view</p>
          <p className="text-xs text-slate-400 mt-1">Add tasks from the left panel to update your pipeline</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const statusLower = (task.status || '').toLowerCase();
            const priorityLower = (task.priority || '').toLowerCase();
            const isDone = statusLower === 'done';
            const isInProgress = statusLower === 'in_progress' || statusLower === 'in progress';

            return (
              <div
                key={task.id}
                className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onStatusChange(task.id, statusLower)}
                    title="Toggle progress status"
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-all cursor-pointer shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="text-emerald-500 drop-shadow-sm" size={19} />
                    ) : isInProgress ? (
                      <Clock className="text-amber-500 animate-pulse" size={19} />
                    ) : (
                      <Circle className="hover:text-slate-700" size={19} />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-xs sm:text-sm font-medium tracking-tight truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Priority chip */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          priorityLower === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : priorityLower === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            priorityLower === 'high'
                              ? 'bg-rose-500'
                              : priorityLower === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {task.priority || 'Normal'}
                      </span>

                      {/* Status chip */}
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 capitalize">
                        {statusLower === 'in_progress' ? 'In Progress' : task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    {task.assigned_user && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                        <User size={12} className="text-slate-400" />
                        <span>
                          Assigned to{' '}
                          <strong className="font-medium text-slate-700">
                            {task.assigned_user.full_name || task.assigned_user.email}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete task button */}
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  title="Delete issue"
                  className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}