import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobDetails from './pages/JobDetails';
import UploadResumes from './pages/UploadResumes';
import Candidates from './pages/Candidates';
import AllCandidates from './pages/AllCandidates';
import CandidateDetails from './pages/CandidateDetails';
import Shortlisted from './pages/Shortlisted';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Recruiter Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/create" element={<CreateJob />} />
                <Route path="/jobs/:jobId/edit" element={<EditJob />} />
                <Route path="/jobs/:jobId" element={<JobDetails />} />
                <Route path="/jobs/:jobId/upload" element={<UploadResumes />} />
                <Route path="/jobs/:jobId/candidates" element={<Candidates />} />
                <Route path="/candidates" element={<AllCandidates />} />
                <Route path="/candidates/:candidateId" element={<CandidateDetails />} />
                <Route path="/shortlisted" element={<Shortlisted />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
