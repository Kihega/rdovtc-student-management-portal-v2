'use client';
import { useState, useEffect } from 'react';
import { usersApi, branchesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Branch { id: number; branch_name: string; }
interface Props { onSuccess?: () => void; }

const ROLES = ['Admin', 'Executive director', 'VET Coordinator', 'Principal/TC'];

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
  </svg>
);
const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
  </svg>
);

function PwInput({ value, onChange, required, minLength }: {
  value: string; onChange: (v: string) => void;
  required?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <input
        type={show ? 'text' : 'password'}
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow(v => !v)}
        tabIndex={-1}
        style={{ background: '#fff' }}
      >
        {show ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

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
          <PwInput value={form.password} onChange={v => set('password', v)} required minLength={6} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Confirm Password *</label>
          <PwInput value={form.password_confirmation} onChange={v => set('password_confirmation', v)} required minLength={6} />
        </div>

        <button className="btn w-100 text-white fw-bold" type="submit"
          style={{ background: '#006400' }} disabled={loading}>
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Registering…</>
            : 'Register User'}
        </button>
      </form>
    </div>
  );
}
