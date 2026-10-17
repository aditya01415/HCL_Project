import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Eye, Edit3, Trash2, CheckCircle, Lock } from 'lucide-react';
import SkillBadge from './SkillBadge';

const JobCard = ({ job, onDelete, onToggleStatus }) => {
  const statusColors = {
    open: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold',
    closed: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold',
    draft: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold'
  };

  const isClosed = job.status === 'closed';

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[17.5px] font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider border ${statusColors[job.status] || statusColors.open}`}>
            {job.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center text-xs text-slate-500 dark:text-slate-400 gap-x-4 gap-y-1 mb-3">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
            {job.location || 'Remote'}
          </span>
          <span className="flex items-center">
            <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
            {job.minimumExperience ? `${job.minimumExperience}+ yrs exp` : '0 min yrs'}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-[14px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {job.requiredSkills.slice(0, 4).map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} size="sm" />
            ))}
            {job.requiredSkills.length > 4 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 self-center font-medium">
                +{job.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View Details
          </Link>
          <span className="text-slate-200 dark:text-slate-700">|</span>
          <Link
            to={`/jobs/${job._id}/edit`}
            className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
          </Link>
        </div>

        <div className="flex items-center space-x-1">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(job._id, isClosed ? 'open' : 'closed')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                isClosed
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isClosed ? 'Re-open Job' : 'Close Job'}
            >
              {isClosed ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(job._id)}
              className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Job"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
