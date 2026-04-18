'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.username?.[0] ||
        err?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />

      <div className="login-section">
        <div className="login-card">
          <div className="row g-4">
            {/* Left — system description */}
            <div className="col-md-5 left-col">
              <h5 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 16 }}>
                This System is Used for:
              </h5>
              <ul style={{ lineHeight: 2 }}>
                <li>Registering Students for all RDO VTCs.</li>
                <li>Student Records Management.</li>
                <li>Branch &amp; Course Administration.</li>
                <li>Multi-role Access Control.</li>
              </ul>
            </div>

            {/* Right — login form */}
            <div className="col-md-7">
              <h5 style={{ fontWeight: 'bold', marginBottom: 20 }}>Sign In</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username (Email)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
                  <button
                    type="submit"
                    className="btn btn-primary btn-login"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Signing in…
                      </>
                    ) : 'Login'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-white p-0"
                    style={{ textDecoration: 'none' }}
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Forgot / Change Password Modal */}
      {showForgot && (
        <ChangePasswordModal onClose={() => setShowForgot(false)} requiresUsername />
      )}
    </div>
  );
}
