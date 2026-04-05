
import { BASE_URL } from "../constant/config";

let authToken = null;

// call this after login to set globally
export const setAuthToken = (token) => {
  authToken = token;
};

// token param added as 4th argument — if passed it overrides global authToken
export const apiRequest = async (endpoint, method = "GET", body, token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const activeToken = token || authToken; // use passed token, fallback to global

  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || "Something went wrong");
  }
};