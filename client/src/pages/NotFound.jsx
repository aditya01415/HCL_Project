import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md shadow-2xs space-y-4">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-base font-bold text-slate-700">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The page or candidate profile you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
