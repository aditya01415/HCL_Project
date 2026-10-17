const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const candidateControllerPath = path.resolve(__dirname, '../server/controllers/candidateController');
const { bulkDeleteCandidates } = require(candidateControllerPath);

const Candidate = require(path.resolve(__dirname, '../server/models/Candidate'));
const ScreeningResult = require(path.resolve(__dirname, '../server/models/ScreeningResult'));
const Job = require(path.resolve(__dirname, '../server/models/Job'));
const User = require(path.resolve(__dirname, '../server/models/User'));

async function testEdgeCases() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-resume-screening';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for testing edge cases...');

    const recruiter = await User.findOne({});
    const otherRecruiterId = new mongoose.Types.ObjectId();

    let job = await Job.findOne({ recruiterId: recruiter._id });

    // 1. Create candidate belonging to LOGGED-IN recruiter (file exists)
    const file1 = path.resolve(__dirname, `test_file1_${Date.now()}.pdf`);
    fs.writeFileSync(file1, 'file 1 content');
    const cand1 = await Candidate.create({
      name: 'Owned Candidate 1',
      email: `owned_${Date.now()}@example.com`,
      jobId: job._id,
      recruiterId: recruiter._id,
      resumePath: file1,
      resumeStoredName: `test_file1_${Date.now()}.pdf`,
      resumeOriginalName: 'test_file1.pdf',
      screeningStatus: 'screened'
    });

    // 2. Create candidate belonging to LOGGED-IN recruiter BUT file is MISSING from disk
    const missingFile = path.resolve(__dirname, `missing_file_${Date.now()}.pdf`);
    const cand2 = await Candidate.create({
      name: 'Owned Candidate Missing File',
      email: `missing_${Date.now()}@example.com`,
      jobId: job._id,
      recruiterId: recruiter._id,
      resumePath: missingFile,
      resumeStoredName: `missing_file_${Date.now()}.pdf`,
      resumeOriginalName: 'missing_file.pdf',
      screeningStatus: 'screened'
    });

    // 3. Create candidate belonging to OTHER recruiter (should NOT be deleted!)
    const file3 = path.resolve(__dirname, `other_recruiter_file_${Date.now()}.pdf`);
    fs.writeFileSync(file3, 'other recruiter file content');
    const cand3 = await Candidate.create({
      name: 'Other Recruiter Candidate',
      email: `other_${Date.now()}@example.com`,
      jobId: job._id,
      recruiterId: otherRecruiterId,
      resumePath: file3,
      resumeStoredName: `other_recruiter_file_${Date.now()}.pdf`,
      resumeOriginalName: 'other_recruiter_file.pdf',
      screeningStatus: 'screened'
    });

    console.log('Created 3 edge-case candidates:');
    console.log(`cand1 (owned, file exists): ${cand1._id}`);
    console.log(`cand2 (owned, file missing): ${cand2._id}`);
    console.log(`cand3 (OTHER recruiter): ${cand3._id}`);

    const req = {
      user: { _id: recruiter._id },
      body: {
        candidateIds: [cand1._id.toString(), cand2._id.toString(), cand3._id.toString()]
      }
    };

    let responseData = null;
    const res = {
      status(code) { return this; },
      json(data) { responseData = data; return this; }
    };
    const next = (err) => console.error(err);

    await bulkDeleteCandidates(req, res, next);

    console.log('Bulk Delete Edge Case Response:', responseData);

    // Verify response
    if (responseData.requested === 3 && responseData.deleted === 2 && responseData.failed === 1) {
      console.log('✅ TEST PASSED: 2 owned candidates deleted, 1 other recruiter candidate safely skipped.');
    } else {
      console.error('❌ TEST FAILED: Ownership check did not skip unauthorized ID correctly.', responseData);
    }

    // Verify cand3 still exists in DB and its physical file still exists
    const cand3InDb = await Candidate.findById(cand3._id);
    const cand3FileExists = fs.existsSync(file3);
    console.log(`cand3 still in DB: ${!!cand3InDb} (expected true)`);
    console.log(`cand3 physical file exists: ${cand3FileExists} (expected true)`);

    // Cleanup cand3
    if (cand3InDb) await Candidate.deleteOne({ _id: cand3._id });
    if (cand3FileExists) fs.unlinkSync(file3);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Edge case error:', err);
    process.exit(1);
  }
}

testEdgeCases();
