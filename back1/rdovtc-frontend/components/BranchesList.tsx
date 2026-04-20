'use client';
import { useEffect, useState } from 'react';
import { branchesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Branch { id: number; branch_name: string; }
interface Props { adminMode?: boolean; onChanged?: () => void; }

export default function BranchesList({ adminMode, onChanged }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    branchesApi.list()
      .then(r => setBranches(r.data))
      .catch(() => toast.error('Failed to load branches.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(confirm.id);
    try {
      await branchesApi.delete(confirm.id);
      toast.success('Branch removed.');
      setConfirm(null);
      load();
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove branch.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center p-4"><div className="spinner-border text-success" /></div>;

  return (
    <div className="list-card">
      <h5 className="fw-bold text-green mb-4">
        Registered Branches ({branches.length})
      </h5>

      {branches.length === 0 ? (
        <p className="text-muted">No branches registered yet.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead style={{ background: '#006400', color: 'white' }}>
            <tr>
              <th>#</th>
              <th>Branch Name</th>
              {adminMode && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {branches.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.branch_name}</td>
                {adminMode && (
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirm(b)}>
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Confirmation */}
      {confirm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p className="popup-error">
              ⚠️ Remove branch <strong>{confirm.branch_name}</strong>?
            </p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              All related course assignments will be removed too.
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
