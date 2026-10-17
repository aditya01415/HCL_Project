import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/jobService';
import { getAllCandidates, getCandidatesByJob } from '../services/candidateService';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import CandidateTable from '../components/CandidateTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Users, CheckCircle2, Star, Clock, Plus, BarChart2, Zap, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [jobsRes, candidatesRes] = await Promise.allSettled([
          getJobs(),
          getAllCandidates()
        ]);

        const loadedJobs = jobsRes.status === 'fulfilled' && jobsRes.value?.data ? jobsRes.value.data : [];
        let loadedCandidates = candidatesRes.status === 'fulfilled' && candidatesRes.value?.data ? candidatesRes.value.data : [];

        // Fallback: If getAllCandidates was empty/failed but jobs exist, query per-job candidates
        if (loadedCandidates.length === 0 && loadedJobs.length > 0) {
          let fallbackCandidates = [];
          for (const job of loadedJobs) {
            try {
              const candRes = await getCandidatesByJob(job._id);
              if (candRes.data) {
                const withJobTitle = candRes.data.map((c) => ({ ...c, jobTitle: job.title }));
                fallbackCandidates = [...fallbackCandidates, ...withJobTitle];
              }
            } catch (err) {
              console.warn(`Fallback fetch candidates failed for job ${job._id}:`, err.message);
            }
          }
          loadedCandidates = fallbackCandidates;
        }

        setJobs(loadedJobs);
        setCandidates(loadedCandidates);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading recruiter dashboard metrics..." />;
  }

  const totalJobs = jobs.length;
  const totalCandidates = candidates.length;
  const screenedCount = candidates.filter((c) => c.screeningStatus === 'screened').length;
  const shortlistedCount = candidates.filter((c) => c.screeningStatus === 'shortlisted').length;
  const reviewCount = candidates.filter((c) => c.screeningStatus === 'review' || c.screeningStatus === 'under review').length;
  const rejectedCount = candidates.filter((c) => c.screeningStatus === 'rejected').length;

  const pipelineChartData = [
    { name: 'Total', count: totalCandidates, color: '#6366F1' },
    { name: 'Screened', count: screenedCount, color: '#3B82F6' },
    { name: 'Shortlisted', count: shortlistedCount, color: '#10B981' },
    { name: 'Review', count: reviewCount, color: '#F59E0B' },
    { name: 'Rejected', count: rejectedCount, color: '#EF4444' }
  ];

  // Calculate score distribution
  const score80To100 = candidates.filter((c) => c.screeningResult && c.screeningResult.finalScore >= 80).length;
  const score60To79 = candidates.filter((c) => c.screeningResult && c.screeningResult.finalScore >= 60 && c.screeningResult.finalScore < 80).length;
  const score40To59 = candidates.filter((c) => c.screeningResult && c.screeningResult.finalScore >= 40 && c.screeningResult.finalScore < 60).length;
  const score0To39 = candidates.filter((c) => c.screeningResult && c.screeningResult.finalScore < 40).length;

  // Top candidates sorted by finalScore descending
  const topCandidates = [...candidates]
    .filter((c) => c.screeningResult)
    .sort((a, b) => b.screeningResult.finalScore - a.screeningResult.finalScore)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recruiter Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Overview of active job postings and AI screening analytics</p>
        </div>
        <Link
          to="/jobs/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 rounded-xl">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Jobs" value={totalJobs} icon={Briefcase} color="indigo" />
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} color="blue" />
        <StatCard title="Screened" value={screenedCount} icon={CheckCircle2} color="emerald" />
        <StatCard title="Shortlisted" value={shortlistedCount} icon={Star} color="amber" />
        <StatCard title="Under Review" value={reviewCount} icon={Clock} color="rose" />
      </div>

      {/* Analytics Chart & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Candidate Pipeline Analytics</span>
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Real-time status breakdown</span>
          </div>

          {totalCandidates > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No candidate data available for pipeline chart visualization yet.
            </div>
          )}

          {/* Score Distribution Summary */}
          {totalCandidates > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <span className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">80–100% Score</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{score80To100}</span>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <span className="block text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase">60–79% Score</span>
                <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">{score60To79}</span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <span className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase">40–59% Score</span>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">{score40To59}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">0–39% Score</span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">{score0To39}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors duration-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-2">
              <Link
                to="/jobs/create"
                className="block p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                + Create Job Posting
              </Link>
              <Link
                to="/jobs"
                className="block p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                📁 Manage Jobs ({totalJobs})
              </Link>
              <Link
                to="/candidates"
                className="block p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                👥 View Candidates ({totalCandidates})
              </Link>
              <Link
                to="/shortlisted"
                className="block p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                ⭐ View Shortlisted Candidates ({shortlistedCount})
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center flex items-center justify-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI Screening Engine: <strong className="text-emerald-600 dark:text-emerald-400">Active (FastAPI)</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Job Postings</h2>
          <Link to="/jobs" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Jobs &rarr;
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 3).map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">No jobs posted yet.</p>
            <Link
              to="/jobs/create"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Create Your First Job
            </Link>
          </div>
        )}
      </div>

      {/* Top Candidates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Candidates Across All Jobs</h2>
          <Link to="/candidates" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Candidates &rarr;
          </Link>
        </div>
        <CandidateTable candidates={topCandidates.length > 0 ? topCandidates : candidates.slice(0, 5)} showJobColumn={true} />
      </div>
    </div>
  );
};

export default Dashboard;
