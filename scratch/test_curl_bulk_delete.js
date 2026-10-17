const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const Candidate = require(path.resolve(__dirname, '../server/models/Candidate'));
const Job = require(path.resolve(__dirname, '../server/models/Job'));
const User = require(path.resolve(__dirname, '../server/models/User'));

async function testCurlBulkDelete() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    // Find recruiter
    const recruiter = await User.findOne({});
    if (!recruiter) {
      console.error('No recruiter found.');
      process.exit(1);
    }

    const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET || 'super_secret_jwt_key_resume_screening_2026', { expiresIn: '1d' });

    let job = await Job.findOne({ recruiterId: recruiter._id });
    if (!job) {
      job = await Job.create({
        title: 'Test Job for HTTP Bulk Delete',
        description: 'Test job description',
        recruiterId: recruiter._id,
        status: 'open'
      });
    }

    // Create 2 test candidates
    const cand1 = await Candidate.create({
      name: 'Curl Candidate 1',
      email: `curl1_${Date.now()}@example.com`,
      jobId: job._id,
      recruiterId: recruiter._id,
      resumePath: path.resolve(__dirname, `curl1_${Date.now()}.pdf`),
      resumeStoredName: `curl1_${Date.now()}.pdf`,
      resumeOriginalName: 'curl1.pdf',
      screeningStatus: 'pending'
    });

    const cand2 = await Candidate.create({
      name: 'Curl Candidate 2',
      email: `curl2_${Date.now()}@example.com`,
      jobId: job._id,
      recruiterId: recruiter._id,
      resumePath: path.resolve(__dirname, `curl2_${Date.now()}.pdf`),
      resumeStoredName: `curl2_${Date.now()}.pdf`,
      resumeOriginalName: 'curl2.pdf',
      screeningStatus: 'pending'
    });

    console.log(`Created candidates for CURL test: ${cand1._id}, ${cand2._id}`);

    // Call DELETE /api/candidates/bulk over HTTP
    const bulkRes = await axios.delete('http://127.0.0.1:5005/api/candidates/bulk', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        candidateIds: [cand1._id.toString(), cand2._id.toString()]
      }
    });

    console.log('HTTP DELETE /api/candidates/bulk Response Status:', bulkRes.status);
    console.log('HTTP DELETE /api/candidates/bulk Response Data:', bulkRes.data);

    if (bulkRes.status === 200 && bulkRes.data.success && bulkRes.data.deleted === 2) {
      console.log('✅ LIVE HTTP BULK DELETE TEST SUCCEEDED 100%!');
    } else {
      console.error('❌ LIVE HTTP BULK DELETE TEST FAILED!', bulkRes.data);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('HTTP Test Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testCurlBulkDelete();
