// client/src/api/api.js

// Dev vs Prod base URL uthane ka logic
const getBase = () => {
  if (process.env.NODE_ENV === 'development') {
    // local backend
    return process.env.REACT_APP_DEV_API_URL.replace(/\/+$/, '');
  }
  // production backend
  return process.env.REACT_APP_API_URL.replace(/\/+$/, '');
};

const BASE = getBase();
console.log('▶️ Using API_BASE =', BASE);

// Token helpers
export function setToken(token) {
  localStorage.setItem('token', token);
}
export function getToken() {
  return localStorage.getItem('token');
}
export function removeToken() {
  localStorage.removeItem('token');
}

// apiFetch implementation
export async function apiFetch(path, options = {}) {
  // remove leading slash, then join
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${BASE}/${cleanPath}`;
  console.log('👉 apiFetch ->', url, options);

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const res = await fetch(url, { headers, ...options });
  const text = await res.text();
  console.log('👈 Response text:', text.substring(0, 200));

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text}`);
  }

  if (!res.ok) {
    // optionally clear token on 401/403
    if (res.status === 401 || res.status === 403) removeToken();
    throw new Error(data.message || `Request to ${url} failed with status ${res.status}`);
  }

  return data;
}
