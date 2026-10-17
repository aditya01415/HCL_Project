const express = require('express');
const router = express.Router();
const { runJobScreening, screenSingleCandidate } = require('../controllers/screeningController');
const { protect } = require('../middleware/authMiddleware');

// Route to run screening for all candidates of a job
router.post('/jobs/:jobId/screen', protect, runJobScreening);

// Route to run screening for a single candidate
router.post('/candidates/:candidateId/screen', protect, screenSingleCandidate);

module.exports = router;

