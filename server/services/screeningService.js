const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');
const aiService = require('./aiService');

/**
 * Perform AI screening for a single candidate against a job.
 * Updates candidate details if parsed by AI, upserts ScreeningResult,
 * and sets screeningStatus = 'screened'.
 * 
 * @param {Object} candidate - Candidate Mongoose document or object
 * @param {Object} job - Job Mongoose document or object
 * @returns {Promise<{candidate: Object, screeningResult: Object, success: boolean, error?: string}>}
 */
const screenCandidate = async (candidate, job) => {
  let matchData = {
    final_score: 0,
    semantic_score: 0,
    skill_score: 0,
    experience_score: 0,
    education_score: 0,
    matched_skills: [],
    missing_skills: []
  };

  try {
    console.log(`[AUTO SCREEN] Starting screening for candidate: ${candidate._id}`);
    console.log('[AUTO SCREEN] Calling FastAPI');
    const aiResponse = await aiService.matchResume(candidate.resumePath, job.description);
    console.log('[AUTO SCREEN] FastAPI response received');
    
    if (aiResponse && aiResponse.matching) {
      matchData = aiResponse.matching;
    }

    // Update candidate parsed info if enhanced by match-resume response
    if (aiResponse && aiResponse.candidate) {
      const c = aiResponse.candidate;
      if (c.name && (!candidate.name || candidate.name === 'Unknown Candidate' || candidate.name === 'Candidate')) {
        candidate.name = c.name;
      }
      if (c.skills && c.skills.length) candidate.skills = c.skills;
      if (c.categorized_skills) candidate.categorizedSkills = c.categorized_skills;
      if (c.experience && c.experience.length) candidate.experience = c.experience;
      if (c.education && c.education.length) candidate.education = c.education;
      if (c.projects && c.projects.length) candidate.projects = c.projects;
      if (c.certifications && c.certifications.length) candidate.certifications = c.certifications;
      if (c.achievements && c.achievements.length) candidate.achievements = c.achievements;
      if (c.summary && !candidate.summary) candidate.summary = c.summary;
      if (c.location && !candidate.location) candidate.location = c.location;

      const totalY = c.total_experience_years !== undefined ? c.total_experience_years : c.years_experience;
      if (totalY !== undefined && totalY !== null) {
        candidate.totalExperienceYears = totalY;
        candidate.yearsExperience = totalY;
      }

      if (c.email && !candidate.email) candidate.email = c.email;
      if (c.phone && !candidate.phone) candidate.phone = c.phone;
      if (c.github && !candidate.github) candidate.github = c.github;
      if (c.linkedin && !candidate.linkedin) candidate.linkedin = c.linkedin;
    }

    const finalScore = matchData.final_score || 0;
    let recommendation = 'low_match';
    if (finalScore >= 80) {
      recommendation = 'strong_match';
    } else if (finalScore >= 60) {
      recommendation = 'review';
    } else {
      recommendation = 'low_match';
    }

    // Prevent double screening / duplicate records: use findOneAndUpdate with upsert: true
    const screeningResult = await ScreeningResult.findOneAndUpdate(
      { candidateId: candidate._id, jobId: job._id },
      {
        finalScore,
        semanticScore: matchData.semantic_score || 0,
        skillScore: matchData.skill_score || 0,
        experienceScore: matchData.experience_score || 0,
        educationScore: matchData.education_score || 0,
        matchedSkills: matchData.matched_skills || [],
        missingSkills: matchData.missing_skills || [],
        candidateSkills: candidate.skills || [],
        requiredSkills: job.requiredSkills || [],
        recommendation
      },
      { new: true, upsert: true }
    );
    console.log(`[AUTO SCREEN] ScreeningResult saved for candidate: ${candidate._id}`);

    candidate.screeningStatus = 'screened';
    await candidate.save();
    console.log(`[AUTO SCREEN] Candidate status updated to screened: ${candidate._id}`);

    return {
      success: true,
      candidate,
      screeningResult
    };
  } catch (error) {
    console.error(`[AUTO SCREEN ERROR] Failed screening candidate ${candidate._id} (${candidate.name}):`, error.message);
    // Candidate remains screeningStatus = 'pending'
    return {
      success: false,
      candidate,
      screeningResult: null,
      error: error.message
    };
  }
};

module.exports = {
  screenCandidate
};
