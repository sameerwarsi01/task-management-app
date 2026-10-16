'use client';

import { LogOut, Layers } from "lucide-react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  const avatar = user.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Layers size={18} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900 tracking-tight">TaskFlow</span>
            <span className="text-[10px] font-mono tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              v1.2
            </span>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-semibold flex items-center justify-center">
                {name[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-slate-700 max-w-[140px] truncate">
              {name}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg border border-transparent hover:border-rose-200/60 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}