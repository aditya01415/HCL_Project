import React from 'react';
import { Link } from 'react-router-dom';
import { getStatusBadgeClass, getScoreBadgeStyle } from '../utils/formatScore';
import { cleanCandidateName } from '../utils/cleanName';
import SkillBadge from './SkillBadge';
import { Eye, ArrowUpRight } from 'lucide-react';

const CandidateTable = ({
  candidates = [],
  showJobColumn = false,
  selectedIds = [],
  onSelectCandidate,
  onSelectAll,
  isAllSelected = false
}) => {
  const showSelection = typeof onSelectCandidate === 'function';

  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
        No candidates found matching criteria.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {showSelection && (
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                    title="Select All Visible Candidates"
                  />
                </th>
              )}
              <th className="py-3.5 px-4 w-12 text-center">Rank</th>
              <th className="py-3.5 px-4">Candidate</th>
              {showJobColumn && <th className="py-3.5 px-4">Job Title</th>}
              <th className="py-3.5 px-4">Top Skills</th>
              <th className="py-3.5 px-4 text-center">Experience</th>
              <th className="py-3.5 px-4 text-center">Semantic Match</th>
              <th className="py-3.5 px-4 text-center">Skill Match</th>
              <th className="py-3.5 px-4 text-center">Final Match Score</th>
              <th className="py-3.5 px-4 text-center">AI Recommendation</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
            {candidates.map((cand, idx) => {
              const res = cand.screeningResult;
              const isScreened = cand.screeningStatus !== 'pending' && res !== null && res !== undefined;
              const isSelected = selectedIds.includes(cand._id);

              const finalScoreText = isScreened ? `${Number(res.finalScore).toFixed(1)}%` : 'N/A';
              const semanticScoreText = isScreened ? `${Number(res.semanticScore).toFixed(1)}%` : '—';
              const skillScoreText = isScreened ? `${Number(res.skillScore).toFixed(1)}%` : '—';
              const displayName = cleanCandidateName(cand);

              const badgeStyle = isScreened
                ? getScoreBadgeStyle(res.finalScore)
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium';

              const recType = isScreened
                ? res.recommendation || (res.finalScore >= 80 ? 'strong_match' : res.finalScore >= 60 ? 'review' : 'low_match')
                : null;

              let recBadge = null;
              if (recType === 'strong_match') {
                recBadge = (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Strong Match
                  </span>
                );
              } else if (recType === 'review') {
                recBadge = (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Review
                  </span>
                );
              } else if (recType === 'low_match') {
                recBadge = (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Low Match
                  </span>
                );
              } else {
                recBadge = <span className="font-mono text-xs text-slate-400 dark:text-slate-500">—</span>;
              }

              return (
                <tr
                  key={cand._id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {showSelection && (
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectCandidate(cand._id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400 dark:text-slate-500 text-sm">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/candidates/${cand._id}`}
                      className="font-semibold text-slate-900 dark:text-slate-100 text-[14.5px] hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center space-x-1"
                    >
                      <span>{displayName}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {cand.email && <span className="font-medium text-slate-600 dark:text-slate-300">{cand.email}</span>}
                      {cand.email && cand.resumeOriginalName && <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>}
                      {cand.resumeOriginalName && <span className="font-mono text-slate-400 dark:text-slate-500">{cand.resumeOriginalName}</span>}
                    </div>
                  </td>

                  {showJobColumn && (
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {cand.jobTitle || 'Job Position'}
                      </span>
                    </td>
                  )}

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cand.skills && cand.skills.length > 0 ? (
                        cand.skills.slice(0, 3).map((s, i) => (
                          <SkillBadge key={i} skill={s} size="sm" variant="neutral" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">No skills</span>
                      )}
                      {cand.skills && cand.skills.length > 3 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">+{cand.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300 text-xs">
                    {cand.yearsExperience !== null && cand.yearsExperience !== undefined
                      ? `${cand.yearsExperience} yrs`
                      : 'Not detected'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {semanticScoreText}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {skillScoreText}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border ${badgeStyle}`}
                    >
                      {finalScoreText}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {recBadge}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(
                        cand.screeningStatus
                      )}`}
                    >
                      {cand.screeningStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/candidates/${cand._id}`}
                      className="inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View Profile
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
