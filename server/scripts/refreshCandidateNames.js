const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Candidate = require('../models/Candidate');
const aiService = require('../services/aiService');
const { cleanCandidateName } = require('../utils/nameCleaner');

const refreshCandidateNames = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const candidates = await Candidate.find({});
    console.log(`[MIGRATION] Found ${candidates.length} total candidates to refresh.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const candidate of candidates) {
      const oldName = candidate.name;
      let newParsedName = null;
      let parsed = null;

      if (candidate.resumePath && fs.existsSync(candidate.resumePath)) {
        try {
          parsed = await aiService.parseResume(candidate.resumePath);
          if (parsed && parsed.name) {
            newParsedName = parsed.name;
          }
        } catch (err) {
          console.warn(`[MIGRATION WARN] Failed re-parsing ${candidate._id}:`, err.message);
        }
      }

      const computedName = cleanCandidateName(newParsedName, candidate.resumeOriginalName, candidate.email);

      let isUpdated = false;

      // Update name if computedName is cleaner than oldName or contains noise words
      if (computedName && computedName !== oldName && computedName !== 'Unknown Candidate') {
        candidate.name = computedName;
        isUpdated = true;
      }

      // Populate new structured fields if missing from candidate document
      if (parsed) {
        if (parsed.location && !candidate.location) { candidate.location = parsed.location; isUpdated = true; }
        if (parsed.summary && !candidate.summary) { candidate.summary = parsed.summary; isUpdated = true; }
        if (parsed.categorized_skills && (!candidate.categorizedSkills || !Object.keys(candidate.categorizedSkills).length)) {
          candidate.categorizedSkills = parsed.categorized_skills;
          isUpdated = true;
        }
        if (parsed.experience && parsed.experience.length && (!candidate.experience || !candidate.experience.length)) {
          candidate.experience = parsed.experience;
          isUpdated = true;
        }
        if (parsed.projects && parsed.projects.length && (!candidate.projects || !candidate.projects.length)) {
          candidate.projects = parsed.projects;
          isUpdated = true;
        }
        if (parsed.certifications && parsed.certifications.length && (!candidate.certifications || !candidate.certifications.length)) {
          candidate.certifications = parsed.certifications;
          isUpdated = true;
        }
        if (parsed.achievements && parsed.achievements.length && (!candidate.achievements || !candidate.achievements.length)) {
          candidate.achievements = parsed.achievements;
          isUpdated = true;
        }
      }

      if (isUpdated) {
        await candidate.save();
        console.log(`[MIGRATION UPDATED] ID: ${candidate._id} | Old Name: '${oldName}' -> New Name: '${candidate.name}'`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('============================================================');
    console.log(`MIGRATION COMPLETE: ${updatedCount} candidate(s) updated, ${skippedCount} skipped.`);
    console.log('============================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error running candidate refresh migration:', error.message);
    process.exit(1);
  }
};

refreshCandidateNames();
