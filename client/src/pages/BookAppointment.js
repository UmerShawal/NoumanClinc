// src/pages/BookAppointment.js

import { useState } from 'react';
import { apiFetch } from '../api/api';
import 'animate.css';

export default function BookAppointment() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    disease: '',
    datetime: ''
  });
  const [alert, setAlert] = useState({ type:'', message:'' });

  // form fields update karne ka handler
  const handleField = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // form submit handler
  const submit = async e => {
    e.preventDefault();
    setAlert({ type:'', message:'' });

    if (!form.datetime) {
      return setAlert({ type:'warning', message: 'Date & time select karo.' });
    }

    try {
      // datetime-local value ko ISO string mein convert karo
      const payload = {
        ...form,
        datetime: new Date(form.datetime).toISOString()
      };

      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setAlert({ type:'success', message: 'Appointment book ho gaya!' });
      // form reset
      setForm({ name:'', phone:'', area:'', disease:'', datetime:'' });
    } catch (err) {
      setAlert({ type:'danger', message: err.message });
    }
  };

  // iframe ke liye sirf ENV se URL lo
  const embedUrl = process.env.REACT_APP_GOOGLE_CALENDAR_EMBED_URL;

  return (
    <div
      className="container py-5"
      style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}
    >
      <div
        className="card shadow mx-auto animate__animated animate__fadeInUp"
        style={{ maxWidth: '800px' }}
      >
        <div className="card-body">
          <h2 className="text-center mb-4">Book Appointment</h2>

          {/* alert message */}
          {alert.message && (
            <div className={`alert alert-${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          {/* booking form */}
          <form onSubmit={submit} className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleField}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleField}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Area</label>
              <input
                name="area"
                type="text"
                required
                value={form.area}
                onChange={handleField}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Disease</label>
              <input
                name="disease"
                type="text"
                required
                value={form.disease}
                onChange={handleField}
                className="form-control"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Date & Time</label>
              <input
                name="datetime"
                type="datetime-local"
                required
                value={form.datetime}
                onChange={handleField}
                className="form-control"
              />
            </div>
            <div className="col-12 text-center">
              <button type="submit" className="btn btn-success px-5">
                Book
              </button>
            </div>
          </form>

          {/* embed Google Calendar */}
          <h5 className="mb-3">Clinic Calendar</h5>
          <div style={{ position:'relative', paddingBottom:'75%', height:0 }}>
            <iframe
              title="Nouman Clinic Calendar"
              src={embedUrl}
              style={{
                position:'absolute',
                top:0, left:0,
                width:'100%', height:'100%', border:0
              }}
              frameBorder="0"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
