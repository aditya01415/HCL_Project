const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const getBaseURL = () => process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
  Check AI FastAPI service health status
 */
const checkAIHealth = async () => {
  try {
    const response = await axios.get(`${getBaseURL()}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('AI Service Health Check Failed:', error.message);
    return { status: 'error', service: 'AI Resume Screening Service', error: error.message };
  }
};

/**
  Parse resume document via FastAPI /parse-resume
 */
const parseResume = async (filePath) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), path.basename(filePath));

    const response = await axios.post(`${getBaseURL()}/parse-resume`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('AI parseResume Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to parse resume with AI service.');
  }
};

/**
  Parse job description text via FastAPI /parse-job
 */
const parseJob = async (jobDescription) => {
  try {
    const response = await axios.post(
      `${getBaseURL()}/parse-job`,
      { job_description: jobDescription },
      { timeout: 15000 }
    );
    return response.data;
  } catch (error) {
    console.error('AI parseJob Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to parse job description with AI service.');
  }
};

/**
  Calculate match score from raw text via FastAPI /match-text
 */
const matchText = async (resumeText, jobDescription) => {
  try {
    const response = await axios.post(
      `${getBaseURL()}/match-text`,
      { resume_text: resumeText, job_description: jobDescription },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error('AI matchText Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to match text with AI service.');
  }
};

/**
  Match uploaded resume file against job description via FastAPI /match-resume
 */
const matchResume = async (filePath, jobDescription) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), path.basename(filePath));
    form.append('job_description', jobDescription);

    const response = await axios.post(`${getBaseURL()}/match-resume`, form, {
      headers: form.getHeaders(),
      timeout: 45000
    });
    return response.data;
  } catch (error) {
    console.error('AI matchResume Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to match resume with AI service.');
  }
};

module.exports = {
  checkAIHealth,
  parseResume,
  parseJob,
  matchText,
  matchResume
};
