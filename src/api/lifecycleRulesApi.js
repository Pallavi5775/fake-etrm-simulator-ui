import httpClient from "./httpClient";

const API = "/config/lifecycle-rules";

export const getRules = () => httpClient.get(API);
export const createRule = (data) => httpClient.post(API, data);
export const toggleRule = (id) => httpClient.put(`${API}/${id}/toggle`);

export const getEventTypes = () => httpClient.get("/trades/event-types");
export const getTradeStatuses = () => httpClient.get("/trades/statuses");
