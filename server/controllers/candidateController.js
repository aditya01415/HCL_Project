const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ScreeningResult = require('../models/ScreeningResult');

// Helper function to safely delete candidate DB records and physical resume files
const deleteCandidateResources = async (candidate) => {
  // 1. Delete associated ScreeningResult documents
  await ScreeningResult.deleteMany({ candidateId: candidate._id });

  // Safe file unlink helper
  const safeUnlink = (filePath) => {
    if (!filePath) return;
    try {
      const resolvedPath = path.resolve(filePath);
      if (fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
        console.log(`[DELETE RESUME] Deleted file: ${resolvedPath}`);
      }
    } catch (err) {
      console.warn(`[DELETE RESUME WARN] Could not delete physical file ${filePath}: ${err.message}`);
    }
  };

  // 2. Unlink original resume file & preview PDF
  safeUnlink(candidate.resumePath);
  safeUnlink(candidate.previewPdfPath);

  // 3. Delete candidate document from database
  await Candidate.deleteOne({ _id: candidate._id });
};

// @desc    Get all candidates for a job (sorted by final score if screened)
// @route   GET /api/jobs/:jobId/candidates
// @access  Private (Recruiter)
const getCandidatesByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view candidates for this job');
    }

    const candidates = await Candidate.find({ jobId }).lean();
    const candidateIds = candidates.map((c) => c._id);
    const screeningResults = await ScreeningResult.find({ candidateId: { $in: candidateIds } }).lean();

    const resultMap = {};
    screeningResults.forEach((sr) => {
      resultMap[sr.candidateId.toString()] = sr;
    });

    const candidatesWithResults = candidates.map((c) => ({
      ...c,
      screeningResult: resultMap[c._id.toString()] || null
    }));

    // Sort screened candidates by finalScore descending, pending candidates placed after screened candidates
    candidatesWithResults.sort((a, b) => {
      const isScreenedA = a.screeningStatus !== 'pending' && a.screeningResult !== null;
      const isScreenedB = b.screeningStatus !== 'pending' && b.screeningResult !== null;

      if (isScreenedA && !isScreenedB) return -1;
      if (!isScreenedA && isScreenedB) return 1;

      if (isScreenedA && isScreenedB) {
        return b.screeningResult.finalScore - a.screeningResult.finalScore;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: candidatesWithResults.length,
      data: candidatesWithResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate by ID with screening result
// @route   GET /api/candidates/:id
// @access  Private (Recruiter)
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).lean();

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this candidate');
    }

    const screeningResult = await ScreeningResult.findOne({ candidateId: candidate._id }).lean();

    res.json({
      success: true,
      data: {
        ...candidate,
        screeningResult: screeningResult || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate screening status
// @route   PATCH /api/candidates/:id/status
// @access  Private (Recruiter)
const updateCandidateStatus = async (req, res, next) => {
  try {
    const { status: screeningStatus } = req.body;
    const allowedStatuses = ['pending', 'screened', 'shortlisted', 'rejected', 'review'];

    if (!screeningStatus || !allowedStatuses.includes(screeningStatus)) {
      res.status(400);
      throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`);
    }

    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this candidate');
    }

    candidate.screeningStatus = screeningStatus;
    await candidate.save();

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates across all jobs owned by recruiter
// @route   GET /api/candidates
// @access  Private (Recruiter)
const getAllCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ recruiterId: req.user._id }).lean();
    const candidateIds = candidates.map((c) => c._id);
    const jobIds = [...new Set(candidates.map((c) => c.jobId.toString()))];

    const [screeningResults, jobs] = await Promise.all([
      ScreeningResult.find({ candidateId: { $in: candidateIds } }).lean(),
      Job.find({ _id: { $in: jobIds } }).select('title status').lean()
    ]);

    const resultMap = {};
    screeningResults.forEach((sr) => {
      resultMap[sr.candidateId.toString()] = sr;
    });

    const jobMap = {};
    jobs.forEach((j) => {
      jobMap[j._id.toString()] = j;
    });

    const candidatesWithDetails = candidates.map((c) => ({
      ...c,
      jobTitle: jobMap[c.jobId.toString()] ? jobMap[c.jobId.toString()].title : 'Unknown Job',
      jobStatus: jobMap[c.jobId.toString()] ? jobMap[c.jobId.toString()].status : 'unknown',
      screeningResult: resultMap[c._id.toString()] || null
    }));

    // Sort screened candidates by finalScore descending, pending candidates placed after screened candidates
    candidatesWithDetails.sort((a, b) => {
      const isScreenedA = a.screeningStatus !== 'pending' && a.screeningResult !== null;
      const isScreenedB = b.screeningStatus !== 'pending' && b.screeningResult !== null;

      if (isScreenedA && !isScreenedB) return -1;
      if (!isScreenedA && isScreenedB) return 1;

      if (isScreenedA && isScreenedB) {
        return b.screeningResult.finalScore - a.screeningResult.finalScore;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: candidatesWithDetails.length,
      data: candidatesWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / view original candidate resume file
// @route   GET /api/candidates/:id/resume
// @access  Private (Recruiter)
const downloadCandidateResume = async (req, res, next) => {
  try {
    console.log(`[RESUME ROUTE] GET /api/candidates/${req.params.id}/resume requested`);

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this candidate resume');
    }

    // Resolve file path safely and prevent path traversal
    const resolvedPath = path.resolve(candidate.resumePath);

    if (!fs.existsSync(resolvedPath)) {
      res.status(404);
      throw new Error('Resume file not found on server');
    }

    const originalName = candidate.resumeOriginalName || 'resume.pdf';
    const ext = path.extname(originalName).toLowerCase() || path.extname(resolvedPath).toLowerCase();

    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
    } else if (ext === '.docx' || ext === '.doc') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
    }

    return res.sendFile(resolvedPath);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single candidate, associated resume files, and screening results
// @route   DELETE /api/candidates/:id
// @access  Private (Recruiter)
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this candidate');
    }

    await deleteCandidateResources(candidate);

    res.json({
      success: true,
      message: 'Candidate and resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete candidates, associated resume files, and screening results
// @route   DELETE /api/candidates/bulk
// @access  Private (Recruiter)
const bulkDeleteCandidates = async (req, res, next) => {
  try {
    const { candidateIds } = req.body || {};

    console.log('[BULK DELETE] request received');
    console.log('[BULK DELETE] body:', req.body);
    console.log('[BULK DELETE] candidateIds:', candidateIds);
    console.log('[BULK DELETE] recruiter:', req.user?._id);

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'candidateIds must be a non-empty array'
      });
    }

    const validCandidateIds = candidateIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validCandidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid candidate ObjectIds provided'
      });
    }

    // Query candidates matching valid IDs AND belonging to the logged-in recruiter
    const candidates = await Candidate.find({
      _id: { $in: validCandidateIds },
      recruiterId: req.user._id
    });

    console.log('[BULK DELETE] owned candidates found:', candidates.length);

    const ownedCandidateIds = candidates.map((c) => c._id);
    const requested = candidateIds.length;

    if (ownedCandidateIds.length === 0) {
      return res.json({
        success: true,
        requested,
        deleted: 0,
        skipped: requested,
        failed: requested,
        message: '0 candidates deleted. Candidates may not exist or belong to another recruiter.'
      });
    }

    // 1. Delete associated screening results in one batch
    const screeningDeleteResult = await ScreeningResult.deleteMany({
      candidateId: { $in: ownedCandidateIds }
    });
    console.log('[BULK DELETE] screening results deleted:', screeningDeleteResult.deletedCount);

    // 2. Unlink physical resume files and preview PDFs safely
    for (const candidate of candidates) {
      if (candidate.resumePath) {
        try {
          const resolvedPath = path.resolve(candidate.resumePath);
          if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
            console.log(`[BULK DELETE] Unlinked resume file: ${resolvedPath}`);
          }
        } catch (fileErr) {
          console.warn(`[BULK DELETE WARN] Could not delete resume file ${candidate.resumePath}: ${fileErr.message}`);
        }
      }

      if (candidate.previewPdfPath) {
        try {
          const resolvedPath = path.resolve(candidate.previewPdfPath);
          if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
            console.log(`[BULK DELETE] Unlinked preview PDF file: ${resolvedPath}`);
          }
        } catch (fileErr) {
          console.warn(`[BULK DELETE WARN] Could not delete preview PDF file ${candidate.previewPdfPath}: ${fileErr.message}`);
        }
      }
    }

    // 3. Delete Candidate documents in one batch
    const candidateDeleteResult = await Candidate.deleteMany({
      _id: { $in: ownedCandidateIds },
      recruiterId: req.user._id
    });

    const deleted = candidateDeleteResult.deletedCount || 0;
    const skipped = requested - deleted;
    const failed = skipped;

    console.log('[BULK DELETE] candidates deleted:', deleted);

    let message = '';
    if (deleted === requested) {
      message = `${deleted} candidate${deleted > 1 ? 's' : ''} deleted successfully`;
    } else {
      message = `${deleted} of ${requested} candidate${requested > 1 ? 's' : ''} deleted`;
    }

    return res.json({
      success: true,
      requested,
      deleted,
      skipped,
      failed,
      message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidatesByJob,
  getAllCandidates,
  getCandidateById,
  updateCandidateStatus,
  downloadCandidateResume,
  deleteCandidate,
  bulkDeleteCandidates
};
