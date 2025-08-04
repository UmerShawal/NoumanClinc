// client/src/api/api.js

// 1) Dev vs Prod ke liye base URL set karo
const getBase = () => {
  if (process.env.NODE_ENV === 'development') {
    // local backend ke liye ENV var, warna default localhost
    return (
      process.env.REACT_APP_DEV_API_URL?.replace(/\/+$/, '') ||
      'http://localhost:3000'
    );
  }
  // production me relative path use karo taake Vercel rewrites chalein
  return process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
};

const BASE = getBase();
console.log('▶️ Using API_BASE =', BASE);

// 2) Token helpers
export function setToken(token) {
  localStorage.setItem('token', token);
}
export function getToken() {
  return localStorage.getItem('token');
}
export function removeToken() {
  localStorage.removeItem('token');
}

// 3) apiFetch function
export async function apiFetch(path, options = {}) {
  // agar full URL diya ho to usi ko use karo
  const isAbsolute = /^https?:\/\//i.test(path);
  const cleanPath = path.replace(/^\/+/, '');
  const url = isAbsolute ? path : `${BASE}/${cleanPath}`;

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
    // agar auth error ho to token remove kar do
    if (res.status === 401 || res.status === 403) removeToken();
    throw new Error(data.message || `Request to ${url} failed with status ${res.status}`);
  }

  return data;
}
