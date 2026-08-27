import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

// Trim trailing slashes
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// Ensure /api/v1 suffix is present
const baseURL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
