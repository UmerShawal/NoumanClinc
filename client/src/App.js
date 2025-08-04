import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Home            from './pages/Home';
import Register        from './pages/Register';
import Login           from './pages/Login';
import BookAppointment from './pages/BookAppointment';
import MyAppointments  from './pages/MyAppointments';
import AllAppointments from './pages/AllAppointments';

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">Nouman Clinic</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navmenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto align-items-center">
              {/* Hamisha Home dikhayen */}
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>

              {/* Agar user logged out hai */}
              {!user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                </>
              )}

              {/* Jab user logged in ho */}
              {user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/book">Book</Link>
                  </li>

                  {/* Sirf patient ke liye */}
                  {user.role === 'patient' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/mine">My Appointments</Link>
                    </li>
                  )}

                  {/* Sirf admin ke liye */}
                  {user.role === 'admin' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/all">All Appointments</Link>
                    </li>
                  )}

                  {/* Logout button */}
                  <li className="nav-item">
                    <button
                      onClick={logout}
                      className="btn btn-danger btn-sm ms-3"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />
        <Route
          path="/book"
          element={
            <PrivateRoute>
              <BookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/mine"
          element={
            <PrivateRoute>
              <MyAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/all"
          element={
            <PrivateRoute>
              <AllAppointments />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
