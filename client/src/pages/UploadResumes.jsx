import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, uploadResumes } from '../services/jobService';
import ResumeUploader from '../components/ResumeUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const UploadResumes = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getJobById(jobId);
        setJob(res.data);
      } catch (err) {
        setError('Failed to fetch job description details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    try {
      setUploading(true);
      setError(null);
      const res = await uploadResumes(jobId, formData);
      if (res.success) {
        const total = res.uploaded || files.length;
        const screened = res.screened !== undefined ? res.screened : total;
        const failed = res.failed || 0;
        
        let message = '';
        if (failed > 0 && screened === 0) {
          message = `${total} resume${total > 1 ? 's' : ''} uploaded successfully, but AI screening failed.`;
        } else if (failed > 0) {
          message = `${screened} of ${total} resume${total > 1 ? 's' : ''} uploaded and screened successfully. (${failed} failed screening)`;
        } else {
          message = `${screened} resume${screened > 1 ? 's' : ''} uploaded and screened successfully.`;
        }

        // Redirect to candidate rankings page with success message
        navigate(`/jobs/${jobId}/candidates`, {
          state: { successMessage: message }
        });
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload and parse resumes.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing resume upload workspace..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          to={`/jobs/${jobId}`}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Upload Candidate Resumes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For position: <span className="font-semibold text-slate-800 dark:text-slate-200">{job?.title}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box Component */}
      <ResumeUploader onUpload={handleUpload} loading={uploading} />
    </div>
  );
};

export default UploadResumes;
