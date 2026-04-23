'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from './Modal';

interface Props {
  onClose: () => void;
  requiresUsername?: boolean;
}

// Inline SVG eye icons — no extra package needed
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

function PwInput({ value, onChange, placeholder, required, minLength, autoComplete }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
  minLength?: number; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <input
        type={show ? 'text' : 'password'}
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
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

export default function ChangePasswordModal({ onClose, requiresUsername }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    old_password: '',
    new_password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    if (form.new_password.length < 6) {
      toast.error('New password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      if (requiresUsername) {
        await authApi.changePassword({
          username: form.username,
          old_password: form.old_password,
          new_password: form.new_password,
          new_password_confirmation: form.confirm,
        });
      } else {
        await authApi.updatePassword({
          current_password: form.old_password,
          new_password: form.new_password,
          new_password_confirmation: form.confirm,
        });
      }
      toast.success('Password changed successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open title="Change Password" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '32px auto', padding: '0 16px' }}>
        {requiresUsername && (
          <div className="mb-3">
            <label className="form-label fw-bold">Email / Username</label>
            <input
              type="email"
              className="form-control"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              required
            />
          </div>
        )}
        <div className="mb-3">
          <label className="form-label fw-bold">Current Password</label>
          <PwInput
            value={form.old_password}
            onChange={v => set('old_password', v)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">New Password</label>
          <PwInput
            value={form.new_password}
            onChange={v => set('new_password', v)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Confirm New Password</label>
          <PwInput
            value={form.confirm}
            onChange={v => set('confirm', v)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button className="btn btn-success w-100" type="submit" disabled={loading}>
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
            : 'Change Password'}
        </button>
      </form>
    </Modal>
  );
}
