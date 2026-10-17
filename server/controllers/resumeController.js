const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const aiService = require('../services/aiService');
const { screenCandidate } = require('../services/screeningService');
const { cleanCandidateName } = require('../utils/nameCleaner');

// @desc    Upload and parse one or multiple resumes for a job with automatic AI screening
// @route   POST /api/jobs/:jobId/resumes
// @access  Private (Recruiter)
const uploadAndParseResumes = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to upload resumes for this job');
    }

    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      res.status(400);
      throw new Error('No resume files uploaded');
    }

    const processedCandidates = [];
    let screenedCount = 0;
    let failedCount = 0;

    for (const file of files) {
      let parsed = {
        name: null,
        email: null,
        phone: null,
        location: null,
        github: null,
        linkedin: null,
        summary: null,
        skills: [],
        categorized_skills: {},
        experience: [],
        total_experience_years: null,
        education: [],
        projects: [],
        certifications: [],
        achievements: [],
        years_experience: null
      };

      try {
        parsed = await aiService.parseResume(file.path);
      } catch (err) {
        console.warn(`Warning parsing resume file ${file.originalname}:`, err.message);
      }

      const candidateName = cleanCandidateName(parsed.name, file.originalname, parsed.email);
      const totalYears = parsed.total_experience_years !== undefined ? parsed.total_experience_years : parsed.years_experience;

      const candidate = await Candidate.create({
        jobId: job._id,
        recruiterId: req.user._id,
        name: candidateName,
        email: parsed.email || null,
        phone: parsed.phone || null,
        location: parsed.location || null,
        github: parsed.github || null,
        linkedin: parsed.linkedin || null,
        summary: parsed.summary || null,
        skills: parsed.skills || [],
        categorizedSkills: parsed.categorized_skills || {},
        experience: parsed.experience || [],
        totalExperienceYears: totalYears,
        yearsExperience: totalYears,
        education: parsed.education || [],
        projects: parsed.projects || [],
        certifications: parsed.certifications || [],
        achievements: parsed.achievements || [],
        resumeOriginalName: file.originalname,
        resumeStoredName: file.filename,
        resumePath: file.path,
        screeningStatus: 'pending'
      });

      console.log(`[UPLOAD] Candidate created: ${candidate._id} (${candidateName})`);

      // Automatically run AI screening for this candidate
      const outcome = await screenCandidate(candidate, job);

      const candidateObj = outcome.candidate.toObject ? outcome.candidate.toObject() : outcome.candidate;

      if (outcome.success && outcome.screeningResult) {
        screenedCount++;
        candidateObj.screeningResult = outcome.screeningResult;
      } else {
        failedCount++;
        candidateObj.screeningResult = null;
        candidateObj.screeningError = outcome.error || 'AI screening failed during upload';
      }

      processedCandidates.push(candidateObj);
    }

    res.status(201).json({
      success: true,
      uploaded: files.length,
      screened: screenedCount,
      failed: failedCount,
      count: processedCandidates.length,
      candidates: processedCandidates,
      data: processedCandidates
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndParseResumes
};
