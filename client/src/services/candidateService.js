import API from './api';

export const getAllCandidates = async () => {
  const response = await API.get('/candidates');
  return response.data;
};

export const getCandidatesByJob = async (jobId) => {
  const response = await API.get(`/jobs/${jobId}/candidates`);
  return response.data;
};

export const getCandidateById = async (id) => {
  const response = await API.get(`/candidates/${id}`);
  return response.data;
};

export const updateCandidateStatus = async (id, status) => {
  const response = await API.patch(`/candidates/${id}/status`, { status });
  return response.data;
};

export const screenCandidate = async (id) => {
  const response = await API.post(`/candidates/${id}/screen`);
  return response.data;
};

export const deleteCandidate = async (id) => {
  const response = await API.delete(`/candidates/${id}`);
  return response.data;
};

export const deleteCandidates = async (candidateIds) => {
  console.log('[BULK DELETE FRONTEND] candidateIds =', candidateIds);
  const response = await API.delete('/candidates/bulk', {
    data: { candidateIds }
  });
  return response.data;
};

