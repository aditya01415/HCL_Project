import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCandidates } from '../services/candidateService';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Award, Users } from 'lucide-react';

const Shortlisted = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        setLoading(true);
        setError(null);

        const candRes = await getAllCandidates();
        const loaded = candRes.data || [];
        const shortlisted = loaded.filter((c) => c.screeningStatus === 'shortlisted');

        setShortlistedCandidates(shortlisted);
      } catch (err) {
        console.error('Error fetching shortlisted candidates:', err);
        setError(err.response?.data?.message || 'Failed to load shortlisted candidates.');
      } finally {
        setLoading(false);
      }
    };

    fetchShortlisted();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching shortlisted candidates across all jobs..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
          <Star className="w-6 h-6 fill-amber-500 dark:fill-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Shortlisted Candidates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Top candidates shortlisted by recruiter decisions ({shortlistedCandidates.length} shortlisted)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Candidate Table */}
      {shortlistedCandidates.length > 0 ? (
        <CandidateTable candidates={shortlistedCandidates} showJobColumn={true} />
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-4 transition-colors duration-200">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Shortlisted Candidates Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Screen candidates for your job postings and click <strong>Shortlist</strong> on top candidates to add them here.
            </p>
          </div>
          <Link
            to="/candidates"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>View Candidates</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Shortlisted;
