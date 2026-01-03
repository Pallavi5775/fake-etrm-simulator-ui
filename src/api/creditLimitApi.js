// src/api/creditLimitApi.js
import httpClient from './httpClient';

export const getCreditLimits = () => httpClient.get('/credit-limits');
export const createCreditLimit = (data) => httpClient.post('/credit-limits', data);
export const updateCreditLimit = (id, data) => httpClient.put(`/credit-limits/${id}`, data);
export const deleteCreditLimit = (id) => httpClient.delete(`/credit-limits/${id}`);
