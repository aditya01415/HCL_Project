/**
 * Format score number to 1 decimal place
 */
export const formatScore = (score) => {
  if (score === undefined || score === null || isNaN(score)) return '0.0';
  return Number(score).toFixed(1);
};

/**
 * Get visual score emphasis badge style based on job-match score percentage
 * 80+ -> Strong visual emphasis
 * 60-79 -> Medium visual emphasis
 * Below 60 -> Neutral/low emphasis
 */
export const getScoreBadgeStyle = (score) => {
  const num = Number(score || 0);
  if (num >= 80) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs';
  }
  if (num >= 60) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
};

/**
 * Get status badge class
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'shortlisted':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    case 'screened':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'review':
    case 'under review':
      return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    case 'rejected':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'pending':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};
