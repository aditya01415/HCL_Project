const express = require('express');
const router = express.Router();
const { uploadAndParseResumes } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route to upload and parse resumes for a job
router.post('/jobs/:jobId/resumes', protect, upload.any(), uploadAndParseResumes);

module.exports = router;
