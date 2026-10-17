import API from './api';

export const getJobs = async () => {
  const response = await API.get('/jobs');
  return response.data;
};

export const getJobById = async (id) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await API.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await API.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await API.delete(`/jobs/${id}`);
  return response.data;
};

export const uploadResumes = async (jobId, formData) => {
  const response = await API.post(`/jobs/${jobId}/resumes`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const runScreening = async (jobId) => {
  const response = await API.post(`/jobs/${jobId}/screen`);
  return response.data;
};
