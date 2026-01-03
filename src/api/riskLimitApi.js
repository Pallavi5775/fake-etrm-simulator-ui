import httpClient from './httpClient';

// Get all active limits
export const getRiskLimits = () => httpClient.get('/risk/limits');
// Create a new limit
export const createRiskLimit = (data) => httpClient.post('/risk/limits', data);
// Check limits and get breaches
export const checkRiskLimits = (payload) => httpClient.post('/risk/limits/check', payload);
// Get all active breaches
export const getActiveBreaches = () => httpClient.get('/risk/breaches/active');
// Get critical breaches
export const getCriticalBreaches = () => httpClient.get('/risk/breaches/critical');
// Resolve a breach
export const resolveBreach = (breachId, data) => httpClient.post(`/risk/breaches/${breachId}/resolve`, data);
