import httpClient from './httpClient';

export const getCommodities = () => httpClient.get('/commodities');
export const getCommodityById = (id) => httpClient.get(`/commodities/${id}`);
export const createCommodity = (data) => httpClient.post('/commodities', data);
