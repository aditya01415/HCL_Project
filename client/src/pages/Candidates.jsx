import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getJobById, runScreening } from '../services/jobService';
import { getCandidatesByJob, deleteCandidates } from '../services/candidateService';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Search, Filter, Zap, Upload, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';

const Candidates = () => {
  const { jobId } = useParams();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(
    location.state?.successMessage || location.state?.toastMessage || null
  );

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [skillSearch, setSkillSearch] = useState('');

  const fetchJobAndCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const jobRes = await getJobById(jobId);
      setJob(jobRes.data);

      const candRes = await getCandidatesByJob(jobId);
      const loaded = candRes.data || [];
      setCandidates(loaded);
      setFilteredCandidates(loaded);
    } catch (err) {
      console.error('Error fetching candidate rankings:', err);
      setError(err.response?.data?.message || 'Failed to load candidate rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndCandidates();
  }, [jobId]);

  // Apply filters
  useEffect(() => {
    let result = candidates;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.resumeOriginalName && c.resumeOriginalName.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.screeningStatus === statusFilter);
    }

    if (minScoreFilter > 0) {
      result = result.filter(
        (c) => c.screeningStatus !== 'pending' && c.screeningResult && Number(c.screeningResult.finalScore) >= minScoreFilter
      );
    }

    if (skillSearch) {
      const skillTerm = skillSearch.toLowerCase();
      result = result.filter(
        (c) => c.skills && c.skills.some((s) => s.toLowerCase().includes(skillTerm))
      );
    }

    setFilteredCandidates(result);
  }, [searchTerm, statusFilter, minScoreFilter, skillSearch, candidates]);

  // Check selection state for visible filtered candidates
  const visibleIds = filteredCandidates.map((c) => c._id);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const handleSelectCandidate = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setDeleting(true);
      setError(null);
      setUploadSuccessMsg(null);
      console.log('[BULK DELETE FRONTEND] selectedIds =', selectedIds);
      const res = await deleteCandidates(selectedIds);
      if (res.success) {
        setUploadSuccessMsg(res.message || `${res.deleted} candidate(s) deleted successfully.`);
        setSelectedIds([]);
        setShowDeleteModal(false);
        await fetchJobAndCandidates();
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError(err.response?.data?.message || 'Unable to delete selected candidates. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleRunScreening = async () => {
    if (candidates.length === 0) {
      alert('Please upload resumes first.');
      return;
    }

    try {
      setScreeningLoading(true);
      setError(null);
      const res = await runScreening(jobId);
      if (res.success) {
        setUploadSuccessMsg(`AI Screening completed successfully for ${res.count} candidate(s)!`);
        await fetchJobAndCandidates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Screening failed.');
    } finally {
      setScreeningLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading candidate rankings and match scores..." />;
  }

  const allScreened = candidates.length > 0 && candidates.every((c) => c.screeningStatus !== 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/jobs/${jobId}`}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Candidate Rankings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Position: <span className="font-semibold text-slate-800 dark:text-slate-200">{job?.title}</span> ({candidates.length} total candidates)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${jobId}/upload`}
            className="inline-flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Upload Resumes
          </Link>

          <button
            onClick={handleRunScreening}
            disabled={screeningLoading || candidates.length === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs space-x-1.5 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{screeningLoading ? 'Screening...' : allScreened ? 'Re-run AI Screening' : 'Run AI Screening'}</span>
          </button>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button
            onClick={() => setUploadSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white dark:bg-slate-800 border border-slate-800 dark:border-slate-700 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-600 dark:bg-indigo-500/80 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs">
              {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white underline transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? `Deleting ${selectedIds.length}...` : 'Delete Selected'}</span>
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Candidate Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name or email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Skill Filter */}
          <div>
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Filter by specific skill (e.g. React)..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Screening Statuses</option>
              <option value="pending">Pending</option>
              <option value="screened">Screened</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Min Score:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="w-full accent-indigo-600 dark:accent-indigo-400"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8">{minScoreFilter}%</span>
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      <CandidateTable
        candidates={filteredCandidates}
        selectedIds={selectedIds}
        onSelectCandidate={handleSelectCandidate}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Selected Resumes?"
        message={`You are about to permanently delete ${selectedIds.length} candidate profile${selectedIds.length > 1 ? 's' : ''}, uploaded resumes, and associated screening results. This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText={deleting ? 'Deleting...' : `Delete ${selectedIds.length} Candidate${selectedIds.length > 1 ? 's' : ''}`}
        danger={true}
      />
    </div>
  );
};

export default Candidates;

