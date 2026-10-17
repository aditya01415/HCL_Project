import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCandidateById, updateCandidateStatus, screenCandidate, deleteCandidate } from '../services/candidateService';
import ScoreBar from '../components/ScoreBar';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { getStatusBadgeClass } from '../utils/formatScore';
import { cleanCandidateName } from '../utils/cleanName';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Star,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Calculator,
  Zap,
  FileText,
  MapPin,
  FolderGit2,
  Award,
  CheckSquare,
  ExternalLink,
  Trash2
} from 'lucide-react';

const CandidateDetails = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [screeningSingle, setScreeningSingle] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState(false);
  const [error, setError] = useState(null);
  const [confirmRejectModal, setConfirmRejectModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCandidateById(candidateId);
      setCandidate(res.data);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.response?.data?.message || 'Failed to load candidate details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      setConfirmRejectModal(false);
      const res = await updateCandidateStatus(candidateId, newStatus);
      if (res.success) {
        setCandidate((prev) => ({ ...prev, screeningStatus: res.data.screeningStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRunSingleScreening = async () => {
    try {
      setScreeningSingle(true);
      setError(null);
      const res = await screenCandidate(candidateId);
      if (res.success) {
        await fetchCandidate();
      }
    } catch (err) {
      console.error('Screening error:', err);
      setError(err.response?.data?.message || 'Failed to run AI screening for candidate.');
    } finally {
      setScreeningSingle(false);
    }
  };

  const handleViewOriginalResume = () => {
    const token = localStorage.getItem('token') || '';
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api';
    const baseUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
    const resumeUrl = `${baseUrl}/candidates/${candidateId}/resume?token=${token}`;
    window.open(resumeUrl, '_blank');
  };

  const handleDeleteCandidate = async () => {
    try {
      setDeletingCandidate(true);
      setConfirmDeleteModal(false);
      setError(null);
      const res = await deleteCandidate(candidateId);
      if (res.success) {
        const redirectUrl = candidate.jobId ? `/jobs/${candidate.jobId}/candidates` : '/candidates';
        navigate(redirectUrl, { state: { toastMessage: 'Resume and candidate deleted successfully.' } });
      }
    } catch (err) {
      console.error('Delete candidate error:', err);
      setError(err.response?.data?.message || 'Unable to delete this resume. Please try again.');
    } finally {
      setDeletingCandidate(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching candidate profile and AI breakdown..." />;
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        Candidate not found.
      </div>
    );
  }

  const isPending = candidate.screeningStatus === 'pending' || !candidate.screeningResult;
  const result = candidate.screeningResult || {};
  const finalScore = isPending ? 'Not Screened' : `${Number(result.finalScore || 0).toFixed(1)}%`;
  const semanticScore = result.semanticScore !== undefined && result.semanticScore !== null ? Number(result.semanticScore) : 0;
  const skillScore = result.skillScore !== undefined && result.skillScore !== null ? Number(result.skillScore) : 0;
  const experienceScore = result.experienceScore !== undefined && result.experienceScore !== null ? Number(result.experienceScore) : 0;
  const educationScore = result.educationScore !== undefined && result.educationScore !== null ? Number(result.educationScore) : 0;

  const displayName = cleanCandidateName(candidate);
  const currentStatus = candidate.screeningStatus?.toLowerCase() || 'pending';

  // Categorized Skills Map
  const categorized = candidate.categorizedSkills || {};
  const categoryLabels = {
    programming_languages: 'Programming Languages',
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Databases',
    cloud: 'Cloud',
    devops: 'DevOps',
    tools: 'Tools & Utilities',
    machine_learning: 'Machine Learning & AI'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <Link
            to={candidate.jobId ? `/jobs/${candidate.jobId}/candidates` : '/jobs'}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{displayName}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(
                  candidate.screeningStatus
                )}`}
              >
                {candidate.screeningStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Original File: <span className="font-mono text-slate-700 dark:text-slate-300">{candidate.resumeOriginalName}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Original Resume Button */}
          <button
            onClick={handleViewOriginalResume}
            className="inline-flex items-center px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors space-x-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-300" />
            <span>View Original Resume</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {/* Run AI Screening Button */}
          <button
            onClick={handleRunSingleScreening}
            disabled={screeningSingle}
            className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors space-x-1.5 shadow-2xs disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{screeningSingle ? 'Screening...' : isPending ? 'Run AI Screening' : 'Re-run AI Screening'}</span>
          </button>

          {/* Recruiter Manual Status Action Buttons */}
          <button
            onClick={() => handleStatusChange('shortlisted')}
            disabled={updating || currentStatus === 'shortlisted'}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors space-x-1.5 border shadow-2xs ${
              currentStatus === 'shortlisted'
                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>{currentStatus === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          <button
            onClick={() => handleStatusChange('review')}
            disabled={updating || currentStatus === 'review' || currentStatus === 'under review'}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors space-x-1.5 border shadow-2xs ${
              currentStatus === 'review' || currentStatus === 'under review'
                ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{currentStatus === 'review' || currentStatus === 'under review' ? 'Under Review' : 'Under Review'}</span>
          </button>

          <button
            onClick={() => setConfirmRejectModal(true)}
            disabled={updating || currentStatus === 'rejected'}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors space-x-1.5 border shadow-2xs ${
              currentStatus === 'rejected'
                ? 'bg-rose-700 text-white border-rose-800 ring-2 ring-rose-300'
                : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{currentStatus === 'rejected' ? 'Rejected' : 'Reject'}</span>
          </button>

          {/* Delete Resume Action Button (Red / Danger style) */}
          <button
            onClick={() => setConfirmDeleteModal(true)}
            disabled={deletingCandidate}
            className="inline-flex items-center px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition-colors space-x-1.5 shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{deletingCandidate ? 'Deleting...' : 'Delete Resume'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Pending Banner Message if Not Screened Yet */}
      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold text-sm">This candidate has not been screened yet.</span>
          </div>
          <button
            onClick={handleRunSingleScreening}
            disabled={screeningSingle}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 shadow-2xs flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{screeningSingle ? 'Screening...' : 'Run AI Screening'}</span>
          </button>
        </div>
      )}

      {/* Decision Support AI Responsibility Note */}
      <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex items-center space-x-2.5 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          AI match scores are decision-support signals based on job-related criteria. Final hiring decisions remain with the recruiter.
        </span>
      </div>

      {/* SECTION 1 — AI MATCH OVERVIEW */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-xl text-white flex flex-col md:flex-row items-center justify-between shadow-md gap-6">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
            Final Match Score
          </p>
          <div className="text-4xl font-extrabold text-white">{finalScore}</div>

          {/* AI Recommendation Badge */}
          <div>
            <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block mb-1">
              AI Recommendation
            </span>
            {isPending ? (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Not Screened
              </span>
            ) : (result.recommendation || (result.finalScore >= 80 ? 'strong_match' : result.finalScore >= 60 ? 'review' : 'low_match')) === 'strong_match' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-500 text-white shadow-2xs">
                Strong Match
              </span>
            ) : (result.recommendation || (result.finalScore >= 80 ? 'strong_match' : result.finalScore >= 60 ? 'review' : 'low_match')) === 'review' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-white shadow-2xs">
                Review
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-slate-700 text-slate-200">
                Low Match
              </span>
            )}
          </div>
          
          {/* Formula Explanation Callout */}
          <div className="pt-1 text-[11px] text-slate-300 space-y-1">
            <p className="font-semibold text-indigo-200 flex items-center justify-center md:justify-start">
              <Calculator className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Final Score Formula
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300 font-mono text-[10.5px]">
              <span>40% Semantic Match</span>
              <span>35% Skill Match</span>
              <span>15% Experience Match</span>
              <span>10% Education Match</span>
            </div>
          </div>
        </div>

        {/* 4 Score Component Bars */}
        <div className="w-full md:w-80 bg-slate-800/80 p-4 rounded-lg border border-slate-700/60 space-y-2.5">
          <ScoreBar label="Semantic Match (40%)" score={semanticScore} isPending={isPending} />
          <ScoreBar label="Skill Match (35%)" score={skillScore} isPending={isPending} />
          <ScoreBar label="Experience Match (15%)" score={experienceScore} isPending={isPending} />
          <ScoreBar label="Education Match (10%)" score={educationScore} isPending={isPending} />
        </div>
      </div>

      {/* Skill Alignment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Required Skills */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 space-y-2">
          <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Matched Required Skills ({isPending ? 'N/A' : (result.matchedSkills || []).length})
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isPending ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">Screening pending</p>
            ) : result.matchedSkills && result.matchedSkills.length > 0 ? (
              result.matchedSkills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} variant="success" size="sm" />
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">No matching required skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Required Skills */}
        <div className="bg-rose-50/60 dark:bg-rose-950/40 p-5 rounded-xl border border-rose-100 dark:border-rose-900/60 space-y-2">
          <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center">
            <XCircle className="w-4 h-4 mr-1.5 text-rose-600 dark:text-rose-400" />
            Missing Required Skills ({isPending ? 'N/A' : (result.missingSkills || []).length})
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isPending ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">Screening pending</p>
            ) : result.missingSkills && result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} variant="danger" size="sm" />
              ))
            ) : (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">All required skills matched!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 2 — CONTACT INFORMATION & METADATA */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Contact Information
          </h3>

          <div className="space-y-3.5 text-xs">
            {candidate.email && (
              <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{candidate.email}</span>
              </div>
            )}

            {candidate.phone && (
              <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{candidate.phone}</span>
              </div>
            )}

            {candidate.location && (
              <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{candidate.location}</span>
              </div>
            )}

            {candidate.github && (
              <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-slate-700 dark:text-slate-400 shrink-0" />
                <a
                  href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate"
                >
                  {candidate.github}
                </a>
              </div>
            )}

            {candidate.linkedin && (
              <div className="flex items-center space-x-2.5 text-slate-700 dark:text-slate-300">
                <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <a
                  href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate"
                >
                  {candidate.linkedin}
                </a>
              </div>
            )}

            {!candidate.email && !candidate.phone && !candidate.location && !candidate.github && !candidate.linkedin && (
              <p className="text-slate-400 dark:text-slate-500 italic">No contact details provided.</p>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 pt-2">
            Experience & Education Summary
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start space-x-2.5 text-slate-700 dark:text-slate-300">
              <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold text-slate-900 dark:text-slate-100">Total Experience:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {candidate.totalExperienceYears !== null && candidate.totalExperienceYears !== undefined
                    ? `${candidate.totalExperienceYears} Years`
                    : candidate.yearsExperience !== null && candidate.yearsExperience !== undefined
                    ? `${candidate.yearsExperience} Years`
                    : 'Not explicitly detected'}
                </span>
              </div>
            </div>

            {candidate.certifications && candidate.certifications.length > 0 && (
              <div className="flex items-start space-x-2.5 text-slate-700 dark:text-slate-300 pt-1">
                <CheckSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-900 dark:text-slate-100">Certifications ({candidate.certifications.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {candidate.certifications.map((cert, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded text-[11px] font-medium border border-indigo-100 dark:border-indigo-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Column: Summary, Categorized Skills, Experience, Education, Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 3 — PROFESSIONAL SUMMARY */}
          {candidate.summary && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center text-indigo-900 dark:text-indigo-300">
                <FileText className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Professional Summary
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-medium bg-slate-50/70 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* SECTION 4 — CATEGORIZED SKILLS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors duration-200">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Technical Skills & Categorization
            </h3>

            {Object.keys(categorized).some((key) => categorized[key] && categorized[key].length > 0) ? (
              <div className="space-y-3">
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const skillsInCat = categorized[key];
                  if (!skillsInCat || skillsInCat.length === 0) return null;
                  return (
                    <div key={key} className="space-y-1.5">
                      <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsInCat.map((s, i) => (
                          <SkillBadge key={i} skill={s} variant="neutral" size="sm" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : candidate.skills && candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((s, i) => (
                  <SkillBadge key={i} skill={s} variant="neutral" size="sm" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No technical skills detected.</p>
            )}
          </div>

          {/* SECTION 5 — WORK EXPERIENCE TIMELINE */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <Briefcase className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Work Experience
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6 my-2">
                {candidate.experience.map((exp, i) => (
                  <div key={i} className="relative space-y-1.5">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-indigo-600 dark:bg-indigo-500 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-950" />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {exp.job_title || 'Position'} {exp.company ? `at ${exp.company}` : ''}
                      </h4>
                      {(exp.start_date || exp.end_date) && (
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                          {exp.start_date || ''} {exp.end_date ? `– ${exp.end_date}` : ''} {exp.duration ? `(${exp.duration})` : ''}
                        </span>
                      )}
                    </div>
                    {exp.location && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{exp.location}</p>
                    )}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 font-normal">
                        {exp.responsibilities.map((resp, j) => (
                          <li key={j}>{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6 — STRUCTURED EDUCATION */}
          {candidate.education && candidate.education.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <GraduationCap className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Education
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.education.map((edu, i) => {
                  const isObj = typeof edu === 'object' && edu !== null;
                  return (
                    <div key={i} className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {isObj ? edu.degree || 'Degree' : edu}
                      </h4>
                      {isObj && edu.specialization && (
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{edu.specialization}</p>
                      )}
                      {isObj && edu.institution && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{edu.institution}</p>
                      )}
                      {isObj && (edu.graduation_year || edu.grade) && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          {edu.graduation_year ? `Passed: ${edu.graduation_year}` : ''} {edu.grade ? `| Grade: ${edu.grade}` : ''}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 7 — PROJECTS */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <FolderGit2 className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Projects
              </h3>

              <div className="space-y-4">
                {candidate.projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-slate-50/70 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{proj.name || 'Project'}</h4>
                    {proj.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{proj.description}</p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((tech, j) => (
                          <span key={j} className="px-2 py-0.5 bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10.5px] font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8 & 9 — ACHIEVEMENTS */}
          {candidate.achievements && candidate.achievements.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <Award className="w-4 h-4 mr-2 text-amber-500" />
                Achievements & Awards
              </h3>

              <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pt-1 font-medium">
                {candidate.achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Reject Modal */}
      <ConfirmModal
        isOpen={confirmRejectModal}
        title="Reject Candidate"
        message={`Are you sure you want to mark candidate '${displayName}' as rejected?`}
        confirmText="Confirm Rejection"
        danger={true}
        onConfirm={() => handleStatusChange('rejected')}
        onCancel={() => setConfirmRejectModal(false)}
      />

      {/* Confirm Delete Resume Modal */}
      <ConfirmModal
        isOpen={confirmDeleteModal}
        title="Delete Resume?"
        message="This will permanently delete this candidate's uploaded resume, candidate profile, and associated screening result. This action cannot be undone."
        confirmText="Delete Resume"
        danger={true}
        onConfirm={handleDeleteCandidate}
        onCancel={() => setConfirmDeleteModal(false)}
      />
    </div>
  );
};

export default CandidateDetails;
