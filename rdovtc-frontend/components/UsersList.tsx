'use client';
import { useEffect, useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface User {
  id: number; username: string; role: string;
  branch_name: string | null; phone: string; created_at: string;
}
interface Props { onChanged?: () => void; }

const ROLE_COLORS: Record<string, string> = {
  'Admin': 'bg-danger',
  'Executive director': 'bg-primary',
  'VET Coordinator': 'bg-info text-dark',
  'Principal/TC': 'bg-success',
};

export default function UsersList({ onChanged }: Props) {
  const { user: me } = useAuth();
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    usersApi.list()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(confirm.id);
    try {
      await usersApi.delete(confirm.id);
      toast.success('User removed.');
      setConfirm(null);
      load();
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove user.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center p-4"><div className="spinner-border text-success" /></div>;

  return (
    <div className="list-card">
      <h5 className="fw-bold text-green mb-4">System Users ({users.length})</h5>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead style={{ background: '#006400', color: 'white' }}>
            <tr>
              <th>#</th><th>Email</th><th>Role</th><th>Branch</th><th>Phone</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td style={{ fontSize: '0.9rem' }}>{u.username}</td>
                <td>
                  <span className={`badge ${ROLE_COLORS[u.role] || 'bg-secondary'} badge-role`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.branch_name || '—'}</td>
                <td>{u.phone}</td>
                <td>
                  {u.id === me?.id ? (
                    <span className="badge bg-secondary">You</span>
                  ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirm(u)}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p className="popup-error">
              ⚠️ Remove user <strong>{confirm.username}</strong>?
            </p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Their account and all tokens will be deleted.
            </p>
            <div className="d-flex gap-3 justify-content-center mt-3">
              <button className="btn btn-danger" onClick={doDelete} disabled={!!deleting}>
                {deleting ? 'Removing…' : 'Yes, Remove'}
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
