const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { screenCandidate } = require('../services/screeningService');

// @desc    Run AI screening on all candidates for a job
// @route   POST /api/jobs/:jobId/screen
// @access  Private (Recruiter)
const runJobScreening = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to screen candidates for this job');
    }

    const candidates = await Candidate.find({ jobId });

    if (!candidates || candidates.length === 0) {
      res.status(400);
      throw new Error('No candidates found for this job to screen.');
    }

    const results = [];

    for (const candidate of candidates) {
      const outcome = await screenCandidate(candidate, job);
      results.push({
        candidate: outcome.candidate,
        screeningResult: outcome.screeningResult,
        success: outcome.success,
        error: outcome.error
      });
    }

    // Sort screened candidates by finalScore descending, pending at end
    results.sort((a, b) => {
      const scoreA = a.screeningResult ? a.screeningResult.finalScore : -1;
      const scoreB = b.screeningResult ? b.screeningResult.finalScore : -1;
      return scoreB - scoreA;
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI screening on a single candidate
// @route   POST /api/candidates/:candidateId/screen
// @access  Private (Recruiter)
const screenSingleCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    const job = await Job.findById(candidate.jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job associated with candidate not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to screen this candidate');
    }

    const outcome = await screenCandidate(candidate, job);

    if (!outcome.success) {
      res.status(500);
      throw new Error(outcome.error || 'AI screening failed for candidate.');
    }

    res.json({
      success: true,
      data: {
        candidate: outcome.candidate,
        screeningResult: outcome.screeningResult
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runJobScreening,
  screenSingleCandidate
};

