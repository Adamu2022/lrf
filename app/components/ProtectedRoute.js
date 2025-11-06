'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}