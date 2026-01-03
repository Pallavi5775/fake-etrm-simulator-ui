import httpClient from './httpClient';

export const getRiskLimitMetadata = () => httpClient.get('/reference-data/risk-limit-metadata');
