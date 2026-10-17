const express = require('express');
const router = express.Router();
const {
  getCandidatesByJob,
  getAllCandidates,
  getCandidateById,
  updateCandidateStatus,
  downloadCandidateResume,
  deleteCandidate,
  bulkDeleteCandidates
} = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all candidates for logged-in recruiter
router.get('/candidates', protect, getAllCandidates);

// Route to get candidates by jobId
router.get('/jobs/:jobId/candidates', protect, getCandidatesByJob);

// Route for bulk deleting candidates (MUST BE DEFINED BEFORE /candidates/:id)
router.delete('/candidates/bulk', protect, bulkDeleteCandidates);

// Route to download/view candidate original resume (MUST BE DEFINED BEFORE /candidates/:id)
router.get('/candidates/:id/resume', protect, downloadCandidateResume);

// Route to get candidate details + screening result by candidate ID
router.get('/candidates/:id', protect, getCandidateById);

// Route to update candidate status
router.patch('/candidates/:id/status', protect, updateCandidateStatus);

// Route to delete candidate + resume files + screening result
router.delete('/candidates/:id', protect, deleteCandidate);

module.exports = router;
