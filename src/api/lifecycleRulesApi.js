import axios from "axios";

const API = "http://localhost:8080/api/config/lifecycle-rules";

export const getRules = () => axios.get(API);

export const createRule = (data) => axios.post(API, data);

export const toggleRule = (id) =>
  axios.put(`${API}/${id}/toggle`);
