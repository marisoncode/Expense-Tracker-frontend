import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

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
  timeout: 30000,
});

// --- High Performance Client-Side Cache & In-Flight Request Deduplication ---
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<AxiosResponse<any>>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function clearApiCache() {
  cache.clear();
  inFlightRequests.clear();
}

// Invalidate cache on mutations (POST, PUT, DELETE)
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
      clearApiCache();
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Cached GET request helper with automatic in-flight deduplication.
 * If data is in cache and fresh, returns cached response in 0ms.
 * If multiple components request the same URL simultaneously, deduplicates into a single HTTP call.
 */
export async function cachedGet<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  forceRefresh = false
): Promise<T> {
  const fullUrl = `${apiClient.defaults.baseURL}${url}`;
  const now = Date.now();

  if (!forceRefresh) {
    const cached = cache.get(fullUrl);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  // Deduplicate concurrent in-flight requests
  if (inFlightRequests.has(fullUrl)) {
    const existing = await inFlightRequests.get(fullUrl)!;
    return existing.data as T;
  }

  const fetchPromise = apiClient.get<T>(url, config);
  inFlightRequests.set(fullUrl, fetchPromise);

  try {
    const response = await fetchPromise;
    cache.set(fullUrl, {
      data: response.data,
      timestamp: Date.now(),
    });
    return response.data;
  } finally {
    inFlightRequests.delete(fullUrl);
  }
}

