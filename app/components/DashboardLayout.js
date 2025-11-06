'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children, role }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode the token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch (err) {
      console.error('Error decoding token:', err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h2>Lecture Reminder</h2>
        <ul>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/">Public Schedules</Link>
          </li>
          
          {/* Lecturer can manage courses, enrollments, and schedules */}
          {user.role === 'lecturer' && (
            <>
              <li>
                <Link href="/courses">Manage Courses</Link>
              </li>
              <li>
                <Link href="/enrollments">Manage Enrollments</Link>
              </li>
              <li>
                <Link href="/schedules">Manage Schedules</Link>
              </li>
              <li>
                <Link href="/notifications">Notification Preferences</Link>
              </li>
            </>
          )}
          
          {/* Super admin can create user accounts */}
          {user.role === 'super_admin' && (
            <li>
              <Link href="/users">Create User Accounts</Link>
            </li>
          )}
        </ul>
        <div className={styles.userSection}>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}