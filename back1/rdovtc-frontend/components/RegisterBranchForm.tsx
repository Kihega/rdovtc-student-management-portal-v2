'use client';
import { useState, useEffect } from 'react';
import { branchesApi, coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Course { id: number; course_code: string; course_name: string; }
interface Props { onSuccess?: () => void; }

export default function RegisterBranchForm({ onSuccess }: Props) {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [branchName, setBranchName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { coursesApi.list().then(r => setAllCourses(r.data)); }, []);

  const toggleCourse = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) { toast.error('Branch name is required.'); return; }
    setLoading(true);
    try {
      await branchesApi.create({ branch_name: branchName.trim(), course_ids: selectedIds });
      toast.success('Branch registered successfully!');
      setBranchName('');
      setSelectedIds([]);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create branch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '32px auto', padding: '0 16px' }}>
      <h5 className="fw-bold text-green mb-4">Register New Branch</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label fw-bold">Branch Name *</label>
          <input type="text" className="form-control" required
            placeholder="e.g. VTC-Mbeya"
            value={branchName} onChange={e => setBranchName(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">Assign Courses (optional)</label>
          <div className="border rounded p-3" style={{ maxHeight: 280, overflowY: 'auto' }}>
            {allCourses.map(c => (
              <div key={c.id} className="form-check mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`course-${c.id}`}
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleCourse(c.id)}
                />
                <label className="form-check-label" htmlFor={`course-${c.id}`}>
                  <span className="badge bg-secondary me-2" style={{ fontSize: '0.7rem' }}>{c.course_code}</span>
                  {c.course_name}
                </label>
              </div>
            ))}
          </div>
          <small className="text-muted">{selectedIds.length} course(s) selected</small>
        </div>

        <button className="btn w-100 text-white fw-bold" type="submit"
          style={{ background: '#006400' }} disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Register Branch'}
        </button>
      </form>
    </div>
  );
}
