import React from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, Zap, Shield, Award, ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <FileSearch className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">SmartShortlist</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-2xs"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI-Powered Resume Screening Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Automate Candidate Shortlisting with{" "}
          <span className="text-indigo-400">Semantic AI</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Shortlist top talent 10x faster. Parse resumes, evaluate candidate skill fit, and calculate semantic similarity using sentence transformers and machine learning.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Start Screening Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700"
          >
            Recruiter Login
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-12 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-3">
            <Zap className="w-8 h-8 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">FastAPI & Sentence-BERT</h3>
            <p className="text-sm text-slate-400">
              Instant semantic text embeddings and multi-factor match scoring across experience, skills, and education.
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Recruiter Control</h3>
            <p className="text-sm text-slate-400">
              No automatic rejections. Human-in-the-loop candidate status decisions with transparent AI breakdown.
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-3">
            <Award className="w-8 h-8 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">PDF & DOCX Support</h3>
            <p className="text-sm text-slate-400">
              Seamless drag-and-drop resume upload and automatic entity extraction for skills, contact info, and experience.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 text-center border-t border-slate-800 text-xs text-slate-500">
        AI-Based Resume Screening & Candidate Shortlisting System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;
