// client/src/api/api.js

// 1) Dev vs Prod ke liye base URL set karo
const isDev = process.env.NODE_ENV === 'development';

// Optional: alag dev URL agar chahiye:
// REACT_APP_DEV_API_URL=http://localhost:3000
const DEV_URL  = process.env.REACT_APP_DEV_API_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

// Production me agar aapne REACT_APP_API_URL set kiya ho (backend domain),
// warna '' (relative) istemal hoga, taake Vercel rewrites chal sakein.
const PROD_URL = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';

const BASE = isDev ? DEV_URL : PROD_URL;
console.log('▶️ Using API_BASE =', BASE || '(relative)');

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
  // Agar full URL pass hua ho, to usi use karo:
  const isAbsolute = /^https?:\/\//i.test(path);

  // Nahi to BASE ke saath join karo:
  const cleanPath = path.replace(/^\/+/, '');
  const url = isAbsolute
    ? path
    : `${BASE}${BASE && !cleanPath.startsWith('/') ? '/' : ''}${cleanPath}`;

  console.log('👉 apiFetch ->', url, options);

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  try {
    const res = await fetch(url, { headers, ...options });
    const text = await res.text();
    console.log('👈 Response text:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from ${url}: ${text}`);
    }

    if (!res.ok) {
      // 401/403 pe token clear kar do
      if (res.status === 401 || res.status === 403) {
        removeToken();
      }
      throw new Error(data.message || `Request to ${url} failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error('❌ apiFetch error:', err);
    throw err;
  }
}
