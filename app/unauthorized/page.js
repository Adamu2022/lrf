'use client';

import { useAuth } from '../components/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import styles from './unauthorized.module.css';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <div className={styles.unauthorized}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    </DashboardLayout>
  );
}