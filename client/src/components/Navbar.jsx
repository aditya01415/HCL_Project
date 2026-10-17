import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, LogOut, Building, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/jobs') return 'Job Postings';
    if (pathname === '/jobs/create') return 'Create New Job';
    if (pathname.startsWith('/jobs/') && pathname.endsWith('/upload')) return 'Upload Resumes';
    if (pathname.startsWith('/jobs/') && pathname.endsWith('/candidates')) return 'Candidate Rankings';
    if (pathname.startsWith('/jobs/')) return 'Job Details';
    if (pathname.startsWith('/candidates/')) return 'Candidate Profile';
    if (pathname === '/shortlisted') return 'Shortlisted Candidates';
    if (pathname === '/profile') return 'Recruiter Profile';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs transition-colors duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{getPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {user?.company && (
          <span className="hidden sm:flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <Building className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
            {user.company}
          </span>
        )}

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600" />
          )}
        </button>

        <div className="flex items-center space-x-2">
          <Link
            to="/profile"
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-800">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold hidden md:inline">{user?.name}</span>
          </Link>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
