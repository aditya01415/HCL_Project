import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllCandidates, deleteCandidates } from '../services/candidateService';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { Users, Search, Info, CheckCircle2, Trash2 } from 'lucide-react';

const AllCandidates = () => {
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || location.state?.successMessage || null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCandidates();
      const loaded = res.data || [];
      setCandidates(loaded);
      setFilteredCandidates(loaded);
    } catch (err) {
      console.error('Error fetching all candidates:', err);
      setError(err.response?.data?.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Unique job titles for filter dropdown
  const uniqueJobs = Array.from(new Set(candidates.map((c) => c.jobTitle).filter(Boolean)));

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

    if (jobFilter !== 'all') {
      result = result.filter((c) => c.jobTitle === jobFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.screeningStatus === statusFilter);
    }

    if (minScoreFilter > 0) {
      result = result.filter(
        (c) => c.screeningResult && Number(c.screeningResult.finalScore) >= minScoreFilter
      );
    }

    setFilteredCandidates(result);
  }, [searchTerm, jobFilter, statusFilter, minScoreFilter, candidates]);

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
      setToastMsg(null);
      console.log('[BULK DELETE FRONTEND] selectedIds =', selectedIds);
      const res = await deleteCandidates(selectedIds);
      if (res.success) {
        setToastMsg(res.message || `${res.deleted} candidate(s) deleted successfully.`);
        setSelectedIds([]);
        setShowDeleteModal(false);
        await fetchCandidates();
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError(err.response?.data?.message || 'Unable to delete selected candidates. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching all recruiter candidate profiles..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Candidates</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of candidates across all job postings ({candidates.length} candidates)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {toastMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Decision Support AI Responsibility Note */}
      <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl flex items-center space-x-2.5 text-xs text-indigo-900 dark:text-indigo-200">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          AI match scores are decision-support signals based on job-related criteria. Final hiring decisions remain with the recruiter.
        </span>
      </div>

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

          {/* Job Filter */}
          <div>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((jTitle, idx) => (
                <option key={idx} value={jTitle}>
                  {jTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="screened">Screened</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="review">Under Review</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
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
        showJobColumn={true}
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

export default AllCandidates;
