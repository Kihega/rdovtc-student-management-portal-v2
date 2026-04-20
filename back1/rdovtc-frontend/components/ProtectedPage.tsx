'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface Props {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export default function ProtectedPage({ allowedRoles, children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/'); return; }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their correct dashboard
      const role = user.role.toLowerCase();
      if (role === 'admin') router.replace('/dashboard/admin');
      else if (role === 'principal/tc') router.replace('/dashboard/principal');
      else router.replace('/dashboard/viewer');
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" style={{ width: 56, height: 56 }} />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
