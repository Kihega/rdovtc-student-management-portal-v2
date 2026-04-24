'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.username?.[0] ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Top bar */}
      <div className="app-header">
        <span className="brand">🎓 RDO VTC Student Record Management</span>
      </div>

      {/* Centre card */}
      <div className="login-hero">
        <div className="login-box">
          <h2>Sign In</h2>
          <p className="subtitle">Enter your credentials to access the system</p>

          {/* Info strip */}
          <div style={{
            background: '#e6f4ea', border: '1px solid #a8d5b5',
            borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: '.82rem'
          }}>
            <strong>Test accounts:</strong><br />
            admin@rdovtc.com · Admin@2025<br />
            director@rdovtc.com · Director@2025<br />
            vet@rdovtc.com · Vet@2025<br />
            principal@rdovtc.com · Principal@2025
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="user@rdovtc.com"
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  <EyeIcon open={!showPw} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" />  Signing in…</> : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <div className="app-footer">© 2025 RDO-VTC&apos;s — All Rights Reserved</div>
    </div>
  );
}
