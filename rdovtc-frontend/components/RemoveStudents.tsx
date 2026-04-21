'use client';
import { useState, useEffect } from 'react';
import { studentsApi, branchesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface Branch { id: number; branch_name: string; }
interface Student {
  id: number; first_name: string; middle_name: string; surname: string;
  course: string; registration_number: string; branch_name: string;
}
interface Props { lockedBranch?: string; }

const YEARS = Array.from({ length: 12 }, (_, i) => 2020 + i);

export default function RemoveStudents({ lockedBranch }: Props) {
  const { user } = useAuth();
  const isPrincipal = user?.role === 'Principal/TC';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters]   = useState({ branch: lockedBranch || '', year: '' });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirm, setConfirm]   = useState<Student | null>(null);

  useEffect(() => {
    if (!isPrincipal) branchesApi.list().then(r => setBranches(r.data));
  }, [isPrincipal]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.branch) params.branch = filters.branch;
      if (filters.year)   params.year   = filters.year;
      const { data } = await studentsApi.list(params);
      setStudents(data);
      setSearched(true);
    } catch { toast.error('Failed to load students.'); }
    finally { setLoading(false); }
  };

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(confirm.id);
    try {
      await studentsApi.delete(confirm.id);
      toast.success('Student removed.');
      setStudents(prev => prev.filter(s => s.id !== confirm.id));
      setConfirm(null);
    } catch { toast.error('Failed to remove student.'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="students-wrapper">
      <div className="filter-box">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">Branch</label>
              {isPrincipal ? (
                <input className="form-control" value={lockedBranch} readOnly style={{ background: '#f0f0f0' }} />
              ) : (
                <select className="form-select" value={filters.branch}
                  onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
                  <option value="">-- All Branches --</option>
                  {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
                </select>
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Year</label>
              <select className="form-select" value={filters.year}
                onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}>
                <option value="">-- All Years --</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn w-100 text-white fw-bold" type="submit"
                style={{ background: '#006400' }} disabled={loading}>
                {loading ? 'Loading…' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {searched && students.length === 0 && (
        <div className="alert alert-warning">No students found.</div>
      )}

      {students.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover students-table">
            <thead>
              <tr><th>#</th><th>Full Name</th><th>Course</th><th>Reg. No.</th><th>Branch</th><th>Action</th></tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{[s.first_name, s.middle_name, s.surname].filter(Boolean).join(' ')}</td>
                  <td>{s.course}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.registration_number}</td>
                  <td>{s.branch_name}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirm(s)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirm && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: 420 }}>
            <p className="popup-error">
              ⚠️ Remove <strong>{[confirm.first_name, confirm.middle_name, confirm.surname].filter(Boolean).join(' ')}</strong>?
            </p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Reg: {confirm.registration_number}<br />
              This action cannot be undone.
            </p>
            <div className="d-flex gap-3 justify-content-center mt-3">
              <button className="btn btn-danger" onClick={doDelete} disabled={deleting !== null}>
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
