import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, runScreening } from '../services/jobService';
import { getCandidatesByJob } from '../services/candidateService';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Upload,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchJobAndCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobRes = await getJobById(jobId);
      setJob(jobRes.data);

      const candRes = await getCandidatesByJob(jobId);
      setCandidates(candRes.data || []);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndCandidates();
  }, [jobId]);

  const handleRunScreening = async () => {
    if (candidates.length === 0) {
      alert('Please upload resumes before running AI screening.');
      return;
    }

    try {
      setScreeningLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await runScreening(jobId);

      if (res.success) {
        setSuccessMsg(`AI Screening completed successfully for ${res.count} candidate(s)!`);
        await fetchJobAndCandidates();
      }
    } catch (err) {
      console.error('Screening error:', err);
      setError(err.response?.data?.message || 'AI Screening failed.');
    } finally {
      setScreeningLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching job profile & candidate pool..." />;
  }

  if (!job) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        Job posting not found.
      </div>
    );
  }

  const screenedCount = candidates.filter((c) => c.screeningStatus === 'screened').length;
  const shortlistedCount = candidates.filter((c) => c.screeningStatus === 'shortlisted').length;
  const reviewCount = candidates.filter((c) => c.screeningStatus === 'review').length;
  const rejectedCount = candidates.filter((c) => c.screeningStatus === 'rejected').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/jobs"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {job.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Created on {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/jobs/${job._id}/edit`}
            className="inline-flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Edit Job
          </Link>

          <Link
            to={`/jobs/${job._id}/upload`}
            className="inline-flex items-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors space-x-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Upload Resumes</span>
          </Link>

          <button
            onClick={handleRunScreening}
            disabled={screeningLoading || candidates.length === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed space-x-1.5"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>
              {screeningLoading
                ? 'AI is analyzing candidate resumes...'
                : candidates.length > 0 && candidates.every((c) => c.screeningStatus !== 'pending')
                ? 'Re-run AI Screening'
                : 'Run AI Screening'}
            </span>
          </button>

          <Link
            to={`/jobs/${job._id}/candidates`}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs space-x-1.5"
          >
            <Users className="w-4 h-4" />
            <span>View Candidates ({candidates.length})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Total Uploaded</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{candidates.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
          <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Screened</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">{screenedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Shortlisted</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{shortlistedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Review</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">{reviewCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Rejected</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-0.5">{rejectedCount}</p>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors duration-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Job Description
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Required Skills
            </h4>
            {job.requiredSkills && job.requiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s, i) => (
                  <SkillBadge key={i} skill={s} variant="default" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">No specific required skills listed.</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Preferred Skills
            </h4>
            {job.preferredSkills && job.preferredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {job.preferredSkills.map((s, i) => (
                  <SkillBadge key={i} skill={s} variant="neutral" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">No preferred skills listed.</p>
            )}
          </div>
        </div>

        {job.education && job.education.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center">
              <GraduationCap className="w-4 h-4 mr-1 text-slate-400 dark:text-slate-500" />
              Education Requirements
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.education.map((e, i) => (
                <SkillBadge key={i} skill={e} variant="neutral" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
