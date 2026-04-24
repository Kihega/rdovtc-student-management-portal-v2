'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedPage({ role, children }: {
  role?: string | string[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/'); return; }
    if (role) {
      const allowed = Array.isArray(role) ? role : [role];
      if (!allowed.includes(user.role)) {
        if (user.role === 'Admin')             router.replace('/dashboard/admin');
        else if (user.role === 'Principal/TC') router.replace('/dashboard/principal');
        else                                   router.replace('/dashboard/viewer');
      }
    }
  }, [user, loading, role, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return <>{children}</>;
}
