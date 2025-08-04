import { useEffect, useState } from 'react';
import { apiFetch } from '../api/api';
import 'animate.css';

export default function MyAppointments() {
  const [list, setList] = useState([]);

  useEffect(() => {
    apiFetch('/appointments/mine')
      .then(data => setList(data))
      .catch(() => {});
  }, []);

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow animate__animated animate__fadeIn">
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">My Appointments</h2>

          {list.length ? (
            <ul className="list-group">
              {list.map(a => (
                <li
                  key={a._id}
                  className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
                >
                  {new Date(a.datetime).toLocaleString()}
                  <span
                    className={`badge ${
                      a.status === 'booked' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
