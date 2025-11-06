'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './users.module.css';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
  });

  useEffect(() => {
    if (user) {
      // Super admin can only create accounts, not view/manage existing ones
      setUsers([]);
      setLoading(false);
    }
  }, [user]);

  const validateForm = () => {
    if (!formData.firstName) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          role: 'student',
        });
        setShowForm(false);
        // Show success message
        setError('User created successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error creating user:', err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Only super_admin can access this page
  if (user.role !== 'super_admin') {
    return (
      <DashboardLayout role={user.role}>
        <div className={styles.unauthorized}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <DashboardLayout role={user.role}>
        <div className={styles.users}>
          <div className={styles.header}>
            <h1>Create User Accounts</h1>
            <button 
              className={styles.addButton}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add User'}
            </button>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {showForm && (
            <div className={styles.formContainer}>
              <h2>Add New User</h2>
              <form onSubmit={handleSubmit} className={styles.userForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone:</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role:</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                  </select>
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  Create User
                </button>
              </form>
            </div>
          )}
          
          {/* Super admin can only create accounts, not manage existing ones */}
          <div className={styles.info}>
            <p>Note: As a Super Admin, you can only create accounts for Lecturers and Students.</p>
            <p>User management features have been restricted.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}