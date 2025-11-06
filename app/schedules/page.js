'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './schedules.module.css';

export default function SchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseCode: '',
    date: '',
    time: '',
    venue: '',
  });

  useEffect(() => {
    if (user) {
      // Fetch schedules
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = 'http://localhost:3001/api/schedules';
      
      // If user is a lecturer, fetch only their schedules
      if (user.role === 'lecturer') {
        url = `http://localhost:3001/api/schedules/lecturer/${user.id}`;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.courseTitle) {
      setError('Course title is required');
      return false;
    }
    
    if (!formData.courseCode) {
      setError('Course code is required');
      return false;
    }
    
    if (!formData.date) {
      setError('Date is required');
      return false;
    }
    
    if (!formData.time) {
      setError('Time is required');
      return false;
    }
    
    if (!formData.venue) {
      setError('Venue is required');
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

  const handleEditClick = (schedule) => {
    setEditingScheduleId(schedule.id);
    setFormData({
      courseTitle: schedule.courseTitle,
      courseCode: schedule.courseCode,
      date: schedule.date,
      time: schedule.time,
      venue: schedule.venue,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingScheduleId) {
        // Update existing schedule
        const response = await fetch(`http://localhost:3001/api/schedules/${editingScheduleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
          }),
        });
        
        if (response.ok) {
          const updatedSchedule = await response.json();
          setSchedules(schedules.map(schedule => 
            schedule.id === editingScheduleId ? updatedSchedule : schedule
          ));
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to update schedule');
          return;
        }
      } else {
        // Create new schedule
        const response = await fetch('http://localhost:3001/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            lecturerId: user.id,
          }),
        });
        
        if (response.ok) {
          const newSchedule = await response.json();
          setSchedules([...schedules, newSchedule]);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to create schedule');
          return;
        }
      }
      
      // Reset form
      setFormData({
        courseTitle: '',
        courseCode: '',
        date: '',
        time: '',
        venue: '',
      });
      setShowForm(false);
      setEditingScheduleId(null);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error saving schedule:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setSchedules(schedules.filter(schedule => schedule.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete schedule');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error deleting schedule:', err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Only lecturers and super_admins can access this page
  if (user.role !== 'lecturer' && user.role !== 'super_admin') {
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
    <ProtectedRoute allowedRoles={['super_admin', 'lecturer']}>
      <DashboardLayout role={user.role}>
        <div className={styles.schedules}>
          <div className={styles.header}>
            <h1>Schedules</h1>
            {user.role === 'lecturer' && (
              <button 
                className={styles.addButton}
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingScheduleId(null);
                  setFormData({
                    courseTitle: '',
                    courseCode: '',
                    date: '',
                    time: '',
                    venue: '',
                  });
                }}
              >
                {showForm ? 'Cancel' : 'Add Schedule'}
              </button>
            )}
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {showForm && user.role === 'lecturer' && (
            <div className={styles.formContainer}>
              <h2>{editingScheduleId ? 'Edit Schedule' : 'Add New Schedule'}</h2>
              <form onSubmit={handleSubmit} className={styles.scheduleForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="courseTitle">Course Title:</label>
                  <input
                    type="text"
                    id="courseTitle"
                    name="courseTitle"
                    value={formData.courseTitle}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="courseCode">Course Code:</label>
                  <input
                    type="text"
                    id="courseCode"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="time">Time:</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="venue">Venue:</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  {editingScheduleId ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </form>
            </div>
          )}
          
          {loading ? (
            <div>Loading schedules...</div>
          ) : (
            <div className={styles.scheduleList}>
              {schedules.length === 0 ? (
                <p>No schedules found.</p>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className={styles.scheduleCard}>
                    <h3>{schedule.courseTitle} ({schedule.courseCode})</h3>
                    <p><strong>Lecturer:</strong> {schedule.lecturer?.firstName} {schedule.lecturer?.lastName}</p>
                    <p><strong>Date:</strong> {schedule.date}</p>
                    <p><strong>Time:</strong> {schedule.time}</p>
                    <p><strong>Venue:</strong> {schedule.venue}</p>
                    {user.role === 'lecturer' && schedule.lecturer?.id === user.id && (
                      <div className={styles.buttonGroup}>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick(schedule)}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDelete(schedule.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}