import httpClient from "./httpClient";

export const getPortfolios = () => httpClient.get("/portfolios");
