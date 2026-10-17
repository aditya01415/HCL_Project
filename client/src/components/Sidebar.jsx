import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Star, User, LogOut, FileSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Shortlisted', path: '/shortlisted', icon: Star },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-200">
      <div>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-2xs">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">SmartShortlist</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Resume Screening</p>
          </div>
        </div>

        <nav className="p-4 space-y-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-[14.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="truncate mr-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'Recruiter'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.company || user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
