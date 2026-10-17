import React from 'react';

const ScoreBar = ({ label, score = 0, maxScore = 100, showValue = true, isPending = false, valueText = null }) => {
  if (isPending) {
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-xs font-medium text-slate-300">
          <span>{label}</span>
          {showValue && <span className="font-mono font-semibold text-slate-400">—</span>}
        </div>
        <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
          <div className="h-full bg-slate-600/40 w-0" />
        </div>
      </div>
    );
  }

  const numericScore = Number(score || 0);
  const percentage = Math.min(Math.max(numericScore, 0), maxScore);
  
  let colorStyle = 'bg-indigo-600';
  if (percentage >= 70) colorStyle = 'bg-emerald-500';
  else if (percentage >= 40) colorStyle = 'bg-amber-500';
  else colorStyle = 'bg-rose-500';

  const displayText = valueText !== null ? valueText : `${percentage.toFixed(1)}%`;

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-xs font-medium text-slate-200">
        <span>{label}</span>
        {showValue && <span className="font-mono font-semibold">{displayText}</span>}
      </div>
      <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${colorStyle}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;

