'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:3001/api/schedules');
      
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

  return (
    <div className={styles.container}>
      {/* Header with login button */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>LRS</h1>
          <nav className={styles.nav}>
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Lecture Schedules</h1>
        <p className={styles.description}>View all upcoming lecture schedules</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        {loading ? (
          <div>Loading schedules...</div>
        ) : (
          <div className={styles.schedulesGrid}>
            {schedules.length === 0 ? (
              <p>No schedules found.</p>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className={styles.scheduleCard}>
                  <h2>{schedule.courseTitle} ({schedule.courseCode})</h2>
                  <p><strong>Lecturer:</strong> {schedule.lecturer?.firstName} {schedule.lecturer?.lastName}</p>
                  <p><strong>Date:</strong> {schedule.date}</p>
                  <p><strong>Time:</strong> {schedule.time}</p>
                  <p><strong>Venue:</strong> {schedule.venue}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}