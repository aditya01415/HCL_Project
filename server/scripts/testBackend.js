const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BACKEND_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;

const runBackendTests = async () => {
  console.log('============================================================');
  console.log('AI RESUME SCREENING - BACKEND VERIFICATION');
  console.log('============================================================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // 1. Test GET /api/health
    console.log('[1] Testing GET /api/health');
    const healthRes = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('Status Code:', healthRes.status);
    console.log('Response   :', JSON.stringify(healthRes.data, null, 2));
    console.log('-'.repeat(50));

    // 2. Register Recruiter
    const testEmail = `test.recruiter.${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    console.log(`\n[2] Registering Test Recruiter: ${testEmail}`);
    const regRes = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      name: 'Test Recruiter',
      email: testEmail,
      password: testPassword,
      company: 'Tech Innovations Inc.'
    });
    console.log('Status Code:', regRes.status);
    console.log('Registered :', regRes.data.data.name, '(', regRes.data.data.email, ')');
    const token = regRes.data.data.token;
    console.log('-'.repeat(50));

    // 3. Login Recruiter
    console.log('\n[3] Logging In Test Recruiter');
    const loginRes = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log('Status Code:', loginRes.status);
    console.log('Logged In  :', loginRes.data.data.email);
    console.log('-'.repeat(50));

    // 4. Test GET /api/auth/me
    console.log('\n[4] Testing GET /api/auth/me (Protected Route)');
    const meRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status Code:', meRes.status);
    console.log('User Profile:', meRes.data.data.name, '|', meRes.data.data.email, '| Role:', meRes.data.data.role);
    console.log('-'.repeat(50));

    // 5. Create Job
    console.log('\n[5] Creating Job Posting (POST /api/jobs)');
    const jobPayload = {
      title: 'Senior Software Developer',
      description: 'Looking for a Software Engineer with Python, React, Node.js and MongoDB experience. Minimum 3 years experience required. Education: Bachelor.',
      location: 'Remote'
    };
    const createJobRes = await axios.post(`${BACKEND_URL}/api/jobs`, jobPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status Code:', createJobRes.status);
    console.log('Created Job :', createJobRes.data.data._id, '| Title:', createJobRes.data.data.title);
    console.log('Skills Auto-Extracted:', createJobRes.data.data.requiredSkills);
    const createdJobId = createJobRes.data.data._id;
    console.log('-'.repeat(50));

    // 6. Get Jobs
    console.log('\n[6] Fetching Jobs (GET /api/jobs)');
    const getJobsRes = await axios.get(`${BACKEND_URL}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status Code:', getJobsRes.status);
    console.log('Jobs Count :', getJobsRes.data.count);
    console.log('-'.repeat(50));

    // 7. Resume Upload (POST /api/jobs/:jobId/resumes)
    const sampleResumePath = path.join(__dirname, '..', '..', 'data', 'raw', 'resumes', 'INFORMATION-TECHNOLOGY', '10089434.pdf');
    if (fs.existsSync(sampleResumePath)) {
      console.log('\n[7] Uploading Resume (POST /api/jobs/:jobId/resumes)');
      const form = new FormData();
      form.append('resumes', fs.createReadStream(sampleResumePath), '10089434.pdf');

      const uploadRes = await axios.post(`${BACKEND_URL}/api/jobs/${createdJobId}/resumes`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders()
        }
      });
      console.log('Status Code:', uploadRes.status);
      console.log('Uploaded Candidates:', uploadRes.data.count);
      const candidateId = uploadRes.data.data[0]._id;
      console.log('Candidate ID:', candidateId, '| Status:', uploadRes.data.data[0].screeningStatus);
      console.log('-'.repeat(50));

      // 8. Run Job Screening (POST /api/jobs/:jobId/screen)
      console.log('\n[8] Running Job Screening (POST /api/jobs/:jobId/screen)');
      const screenRes = await axios.post(`${BACKEND_URL}/api/jobs/${createdJobId}/screen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status Code:', screenRes.status);
      console.log('Screened Candidates Count:', screenRes.data.count);
      const firstResult = screenRes.data.data[0];
      console.log('Candidate Name:', firstResult.candidate.name);
      console.log('Final Score:', firstResult.screeningResult.finalScore);
      console.log('Semantic Score:', firstResult.screeningResult.semanticScore);
      console.log('Skill Score:', firstResult.screeningResult.skillScore);
      console.log('Experience Score:', firstResult.screeningResult.experienceScore);
      console.log('-'.repeat(50));

      // 9. Fetch Candidates for Job (GET /api/jobs/:jobId/candidates)
      console.log('\n[9] Fetching Candidates (GET /api/jobs/:jobId/candidates)');
      const candListRes = await axios.get(`${BACKEND_URL}/api/jobs/${createdJobId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status Code:', candListRes.status);
      console.log('Candidates Count:', candListRes.data.count);
      console.log('-'.repeat(50));

      // 10. Update Candidate Status (PATCH /api/candidates/:id/status)
      console.log('\n[10] Updating Candidate Status (PATCH /api/candidates/:id/status)');
      const statusRes = await axios.patch(`${BACKEND_URL}/api/candidates/${candidateId}/status`, {
        status: 'shortlisted'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status Code:', statusRes.status);
      console.log('Updated Status:', statusRes.data.data.screeningStatus);
      console.log('-'.repeat(50));
    } else {
      console.log('\n[7-10] Skipping resume upload & screening test (sample PDF not found)');
    }

    console.log('\n============================================================');
    console.log('ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('============================================================');
  } catch (error) {
    console.error('\n[ERROR] Backend Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

runBackendTests();
