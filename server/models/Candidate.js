const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      default: 'Unknown Candidate'
    },
    email: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    },
    github: {
      type: String,
      default: null
    },
    linkedin: {
      type: String,
      default: null
    },
    summary: {
      type: String,
      default: null
    },
    skills: {
      type: [String],
      default: []
    },
    categorizedSkills: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        programming_languages: [],
        frontend: [],
        backend: [],
        databases: [],
        cloud: [],
        devops: [],
        tools: [],
        machine_learning: []
      }
    },
    experience: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    totalExperienceYears: {
      type: Number,
      default: null
    },
    yearsExperience: {
      type: Number,
      default: null
    },
    education: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    projects: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    certifications: {
      type: [String],
      default: []
    },
    achievements: {
      type: [String],
      default: []
    },
    resumeOriginalName: {
      type: String,
      required: true
    },
    resumeStoredName: {
      type: String,
      required: true
    },
    resumePath: {
      type: String,
      required: true
    },
    screeningStatus: {
      type: String,
      enum: ['pending', 'screened', 'shortlisted', 'rejected', 'review'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Candidate', candidateSchema);
