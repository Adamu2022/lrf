'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './courses.module.css';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
  });

  useEffect(() => {
    // Fetch courses if user is a lecturer
    if (user && user.role === 'lecturer') {
      fetchCourses();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title) {
      setError('Course title is required');
      return false;
    }
    
    if (!formData.code) {
      setError('Course code is required');
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

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      code: course.code,
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
      
      if (editingCourseId) {
        // Update existing course
        const response = await fetch(`http://localhost:3001/api/courses/${editingCourseId}`, {
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
          const updatedCourse = await response.json();
          setCourses(courses.map(course => 
            course.id === editingCourseId ? updatedCourse : course
          ));
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to update course');
          return;
        }
      } else {
        // Create new course
        const response = await fetch('http://localhost:3001/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const newCourse = await response.json();
          setCourses([...courses, newCourse]);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to create course');
          return;
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        code: '',
      });
      setShowForm(false);
      setEditingCourseId(null);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error saving course:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setCourses(courses.filter(course => course.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete course');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error deleting course:', err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role !== 'lecturer') {
    return (
      <ProtectedRoute allowedRoles={['lecturer']}>
        <DashboardLayout role={user.role}>
          <div className={styles.unauthorized}>
            <h1>Unauthorized</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['lecturer']}>
      <DashboardLayout role={user.role}>
        <div className={styles.courses}>
          <div className={styles.header}>
            <h1>Courses</h1>
            <button 
              className={styles.addButton}
              onClick={() => {
                setShowForm(!showForm);
                setEditingCourseId(null);
                setFormData({
                  title: '',
                  code: '',
                });
              }}
            >
              {showForm ? 'Cancel' : 'Add Course'}
            </button>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {showForm && (
            <div className={styles.formContainer}>
              <h2>{editingCourseId ? 'Edit Course' : 'Add New Course'}</h2>
              <form onSubmit={handleSubmit} className={styles.courseForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Course Title:</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="code">Course Code:</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  {editingCourseId ? 'Update Course' : 'Create Course'}
                </button>
              </form>
            </div>
          )}
          
          {loading ? (
            <div>Loading courses...</div>
          ) : (
            <div className={styles.courseList}>
              {courses.length === 0 ? (
                <p>No courses found.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    <h3>{course.title}</h3>
                    <p><strong>Code:</strong> {course.code}</p>
                    <div className={styles.buttonGroup}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditClick(course)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </button>
                    </div>
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