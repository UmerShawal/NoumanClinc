// client/src/pages/Register.js
import { useState, useContext } from 'react';
import { apiFetch } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setAlert({ type: '', message: '' });
    console.log('🔄 Registering user with', form);
    try {
      const { message } = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      console.log('✅ Register success:', message);
      setAlert({ type: 'success', message });

      // auto‑login
      const { token } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      console.log('🔑 Login token:', token);
      login(token);

      navigate('/book');
    } catch (err) {
      console.error('❌ Error in register:', err);
      setAlert({ type: 'danger', message: err.message });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Register</h2>
          {alert.message && (
            <div className={`alert alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                name="name"
                placeholder="Name"
                onChange={handle}
                value={form.name}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handle}
                value={form.email}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handle}
                value={form.password}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
