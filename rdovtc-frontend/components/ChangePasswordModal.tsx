'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from './Modal';

interface Props {
  onClose: () => void;
  requiresUsername?: boolean; // true = "forgot password" flow (no token)
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
          <label className="form-label fw-bold">
            {requiresUsername ? 'Current Password' : 'Current Password'}
          </label>
          <input
            type="password"
            className="form-control"
            value={form.old_password}
            onChange={(e) => set('old_password', e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">New Password</label>
          <input
            type="password"
            className="form-control"
            value={form.new_password}
            onChange={(e) => set('new_password', e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button className="btn btn-success w-100" type="submit" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Change Password'}
        </button>
      </form>
    </Modal>
  );
}
