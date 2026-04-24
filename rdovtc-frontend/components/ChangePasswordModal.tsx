'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Props { onClose: () => void; }

function PwField({ label, value, onChange, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="pw-wrap">
        <input
          type={show ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={e => onChange(e.target.value)}
          required minLength={6}
          autoComplete={autoComplete}
        />
        <button type="button" className="pw-eye" onClick={() => setShow(v => !v)} tabIndex={-1}>
          {show
            ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordModal({ onClose }: Props) {
  const { user } = useAuth();
  const [cur,  setCur]  = useState('');
  const [nw,   setNw]   = useState('');
  const [conf, setConf] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nw !== conf) { toast.error('New passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.updatePassword({
        current_password: cur,
        new_password: nw,
        new_password_confirmation: conf,
      });
      toast.success('Password changed!');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Change Password</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 16 }}>{user?.username}</p>
        <form onSubmit={submit}>
          <PwField label="Current Password" value={cur} onChange={setCur} autoComplete="current-password" />
          <PwField label="New Password"     value={nw}  onChange={setNw}  autoComplete="new-password" />
          <PwField label="Confirm Password" value={conf} onChange={setConf} autoComplete="new-password" />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
