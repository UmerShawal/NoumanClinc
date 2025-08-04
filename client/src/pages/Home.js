import 'animate.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1
        className="animate__animated animate__fadeInDown display-4 mb-4"
        style={{ fontWeight: '700' }}
      >
        Welcome to Nouman Clinic
      </h1>
      <div className="mb-3">
        <Link to="/login" className="btn btn-primary btn-lg me-2">
          Login
        </Link>
        <Link to="/register" className="btn btn-outline-primary btn-lg">
          New Register
        </Link>
      </div>
    </div>
  );
}
