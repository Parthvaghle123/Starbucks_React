import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      // If admin is already logged in, redirect to dashboard
      navigate('/admin/dashboard', { replace: true });
    } else {
      // If not logged in, redirect to admin login
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Show a simple loading state while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Redirecting to admin panel...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;
