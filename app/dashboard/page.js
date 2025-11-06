'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout role={user.role}>
        <div className={styles.dashboard}>
          <h1>Dashboard</h1>
          <div className={styles.welcome}>
            <h2>Welcome, {user.email}!</h2>
            <p>Your role: {user.role}</p>
          </div>
          
          <div className={styles.infoSection}>
            <p>
              {user.role === 'lecturer' 
                ? 'You can manage your lecture schedules from the "Manage Schedules" section.' 
                : user.role === 'super_admin' 
                ? 'You can create accounts for lecturers and students.' 
                : 'You have administrative privileges to manage the entire system.'}
            </p>
            <p>
              Students can view all schedules on the <a href="/">public schedules page</a> without logging in.
            </p>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Schedules</h3>
              <p>View and manage lecture schedules</p>
            </div>
            
            {user.role === 'super_admin' && (
              <div className={styles.statCard}>
                <h3>User Accounts</h3>
                <p>Create accounts for lecturers and students</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}