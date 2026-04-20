'use client';
import { useState, useEffect } from 'react';
import { usersApi, branchesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Branch { id: number; branch_name: string; }
interface Props { onSuccess?: () => void; }

const ROLES = ['Admin', 'Executive director', 'VET Coordinator', 'Principal/TC'];

export default function RegisterUserForm({ onSuccess }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    username: '', password: '', password_confirmation: '',
    role: '', branch_name: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { branchesApi.list().then(r => setBranches(r.data)); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await usersApi.create(form);
      toast.success('User registered successfully!');
      setForm({ username: '', password: '', password_confirmation: '', role: '', branch_name: '', phone: '' });
      onSuccess?.();
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      if (errs) {
        const first = Object.values(errs)[0] as string[];
        toast.error(first[0]);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to register user.');
      }
    } finally {
      setLoading(false);
    }
  };

  const needsBranch = form.role === 'Principal/TC';

  return (
    <div style={{ maxWidth: 480, margin: '32px auto', padding: '0 16px' }}>
      <h5 className="fw-bold text-green mb-4">Register New User</h5>
      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label className="form-label fw-bold">Email (Username) *</label>
          <input type="email" className="form-control" required
            value={form.username} onChange={e => set('username', e.target.value)}
            placeholder="user@example.com" />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Role *</label>
          <select className="form-select" required value={form.role}
            onChange={e => { set('role', e.target.value); set('branch_name', ''); }}>
            <option value="">-- Select Role --</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {needsBranch && (
          <div className="mb-3">
            <label className="form-label fw-bold">Branch *</label>
            <select className="form-select" required={needsBranch} value={form.branch_name}
              onChange={e => set('branch_name', e.target.value)}>
              <option value="">-- Select Branch --</option>
              {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-bold">Phone *</label>
          <input type="tel" className="form-control" required
            value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+255XXXXXXXXX" />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Password *</label>
          <input type="password" className="form-control" required minLength={6}
            value={form.password} onChange={e => set('password', e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Confirm Password *</label>
          <input type="password" className="form-control" required minLength={6}
            value={form.password_confirmation}
            onChange={e => set('password_confirmation', e.target.value)} />
        </div>

        <button className="btn w-100 text-white fw-bold" type="submit"
          style={{ background: '#006400' }} disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Registering…</> : 'Register User'}
        </button>
      </form>
    </div>
  );
}
