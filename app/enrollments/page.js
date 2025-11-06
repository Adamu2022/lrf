'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './enrollments.module.css';

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
  });

  useEffect(() => {
    // Fetch enrollments if user is a lecturer
    if (user && user.role === 'lecturer') {
      fetchEnrollments();
      fetchUsers();
      fetchCourses();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch enrollments');
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

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
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
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

  const handleEditClick = (enrollment) => {
    setEditingEnrollmentId(enrollment.id);
    setFormData({
      studentId: enrollment.student?.id.toString(),
      courseId: enrollment.course?.id.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingEnrollmentId) {
        // Update existing enrollment
        const response = await fetch(`http://localhost:3001/api/enrollments/${editingEnrollmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: parseInt(formData.studentId),
            courseId: parseInt(formData.courseId),
          }),
        });
        
        if (response.ok) {
          const updatedEnrollment = await response.json();
          setEnrollments(enrollments.map(enrollment => 
            enrollment.id === editingEnrollmentId ? updatedEnrollment : enrollment
          ));
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to update enrollment');
          return;
        }
      } else {
        // Create new enrollment
        const response = await fetch('http://localhost:3001/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: parseInt(formData.studentId),
            courseId: parseInt(formData.courseId),
          }),
        });
        
        if (response.ok) {
          const newEnrollment = await response.json();
          setEnrollments([...enrollments, newEnrollment]);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to create enrollment');
          return;
        }
      }
      
      // Reset form
      setFormData({
        studentId: '',
        courseId: '',
      });
      setShowForm(false);
      setEditingEnrollmentId(null);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error saving enrollment:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/enrollments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setEnrollments(enrollments.filter(enrollment => enrollment.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete enrollment');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error deleting enrollment:', err);
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

  const students = users.filter(u => u.role === 'student');
  const lecturers = users.filter(u => u.role === 'lecturer');

  return (
    <ProtectedRoute allowedRoles={['lecturer']}>
      <DashboardLayout role={user.role}>
        <div className={styles.enrollments}>
          <div className={styles.header}>
            <h1>Enrollments</h1>
            <button 
              className={styles.addButton}
              onClick={() => {
                setShowForm(!showForm);
                setEditingEnrollmentId(null);
                setFormData({
                  studentId: '',
                  courseId: '',
                });
              }}
            >
              {showForm ? 'Cancel' : 'Add Enrollment'}
            </button>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {showForm && (
            <div className={styles.formContainer}>
              <h2>{editingEnrollmentId ? 'Edit Enrollment' : 'Add New Enrollment'}</h2>
              <form onSubmit={handleSubmit} className={styles.enrollmentForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="studentId">Student:</label>
                  <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="courseId">Course:</label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  {editingEnrollmentId ? 'Update Enrollment' : 'Create Enrollment'}
                </button>
              </form>
            </div>
          )}
          
          {loading ? (
            <div>Loading enrollments...</div>
          ) : (
            <div className={styles.enrollmentList}>
              {enrollments.length === 0 ? (
                <p>No enrollments found.</p>
              ) : (
                enrollments.map((enrollment) => (
                  <div key={enrollment.id} className={styles.enrollmentCard}>
                    <h3>{enrollment.course?.title} ({enrollment.course?.code})</h3>
                    <p><strong>Student:</strong> {enrollment.student?.firstName} {enrollment.student?.lastName}</p>
                    <p><strong>Email:</strong> {enrollment.student?.email}</p>
                    <div className={styles.buttonGroup}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditClick(enrollment)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(enrollment.id)}
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