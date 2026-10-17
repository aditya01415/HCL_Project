const Job = require('../models/Job');
const aiService = require('../services/aiService');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, preferredSkills, minimumExperience, education, location, status } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('Title and description are required');
    }

    let parsedJob = {};
    try {
      // Automatically parse skills, experience, and education from description if not provided
      parsedJob = await aiService.parseJob(description);
    } catch (err) {
      console.warn('AI parseJob warning during job creation:', err.message);
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      description,
      requiredSkills: requiredSkills && requiredSkills.length ? requiredSkills : (parsedJob.required_skills || []),
      preferredSkills: preferredSkills && preferredSkills.length ? preferredSkills : (parsedJob.preferred_skills || []),
      minimumExperience: minimumExperience !== undefined ? minimumExperience : (parsedJob.minimum_experience || 0),
      education: education && education.length ? education : (parsedJob.education || []),
      location: location || 'Remote',
      status: status || 'open'
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for logged-in recruiter
// @route   GET /api/jobs
// @access  Private (Recruiter)
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private (Recruiter)
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this job');
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job by ID
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this job');
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job by ID
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this job');
    }

    await job.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};
