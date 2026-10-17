import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      {text && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
