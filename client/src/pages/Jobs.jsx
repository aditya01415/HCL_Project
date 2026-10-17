import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, deleteJob, updateJob } from '../services/jobService';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Search, Briefcase } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getJobs();
      const loaded = res.data || [];
      setJobs(loaded);
      setFilteredJobs(loaded);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          (j.location && j.location.toLowerCase().includes(term)) ||
          (j.requiredSkills && j.requiredSkills.some((s) => s.toLowerCase().includes(term))) ||
          (j.preferredSkills && j.preferredSkills.some((s) => s.toLowerCase().includes(term)))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }

    setFilteredJobs(result);
  }, [searchTerm, statusFilter, jobs]);

  const handleToggleStatus = async (id, newStatus) => {
    try {
      await updateJob(id, { status: newStatus });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteJob(deleteId);
      setDeleteId(null);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching recruiter jobs..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Job Postings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage recruitment job descriptions and candidate pipelines</p>
        </div>
        <Link
          to="/jobs/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Job</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 rounded-xl">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center transition-colors duration-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title or skills..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={(id) => setDeleteId(id)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Job Postings Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter.'
                : 'Get started by creating your first job posting description.'}
            </p>
          </div>
          <Link
            to="/jobs/create"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Create Job Posting
          </Link>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting? This action cannot be undone."
        confirmText="Delete Job"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Jobs;
