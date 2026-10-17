const mongoose = require('mongoose');

const screeningResultSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      unique: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    finalScore: {
      type: Number,
      default: 0
    },
    semanticScore: {
      type: Number,
      default: 0
    },
    skillScore: {
      type: Number,
      default: 0
    },
    experienceScore: {
      type: Number,
      default: 0
    },
    educationScore: {
      type: Number,
      default: 0
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    candidateSkills: {
      type: [String],
      default: []
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String,
      enum: ['strong_match', 'review', 'low_match'],
      default: 'low_match'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ScreeningResult', screeningResultSchema);
