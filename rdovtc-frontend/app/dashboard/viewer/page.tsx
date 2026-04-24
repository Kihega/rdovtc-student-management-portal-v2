'use client';
import { useState, useEffect, useCallback } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import AppShell from '@/components/AppShell';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { studentsApi, branchesApi, coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'overview',  icon: '📊', label: 'Overview'       },
  { id: 'students',  icon: '🎓', label: 'All Students'    },
  { id: 'branches',  icon: '🏫', label: 'Branches'        },
  { id: 'password',  icon: '🔒', label: 'Change Password' },
];

export default function ViewerDashboard() {
  return (
    <ProtectedPage role={['Executive director', 'VET Coordinator']}>
      <ViewerContent />
    </ProtectedPage>
  );
}

function ViewerContent() {
  const { user } = useAuth();
  const [tab,      setTab]      = useState('overview');
  const [showPw,   setShowPw]   = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [search,   setSearch]   = useState('');
  const [filterB,  setFilterB]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([studentsApi.list(), branchesApi.list()]);
      setStudents(s.data);
      setBranches(b.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTab = (t: string) => {
    if (t === 'password') { setShowPw(true); return; }
    setTab(t);
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.course_name?.toLowerCase().includes(q);
    const matchBranch = !filterB || s.branch_name === filterB;
    return matchSearch && matchBranch;
  });

  const byBranch = branches.map(b => ({
    ...b,
    count: students.filter(s => s.branch_name === b.branch_name).length,
    male:  students.filter(s => s.branch_name === b.branch_name && s.gender === 'Male').length,
    female:students.filter(s => s.branch_name === b.branch_name && s.gender === 'Female').length,
  }));

  const roleLabel = user?.role === 'Executive director' ? 'Executive Director' : 'VET Coordinator';

  return (
    <AppShell activeTab={tab} setActiveTab={handleTab} navItems={NAV}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && !loading && (
        <>
          <h1 className="page-title">{roleLabel} Dashboard</h1>
          <p className="page-sub">Read-only view across all branches · {user?.username}</p>

          <div className="stat-grid">
            <div className="stat-card"><div className="num">{students.length}</div><div className="lbl">Total Students</div></div>
            <div className="stat-card"><div className="num">{branches.length}</div><div className="lbl">Branches</div></div>
            <div className="stat-card"><div className="num">{students.filter(s=>s.gender==='Male').length}</div><div className="lbl">Male Students</div></div>
            <div className="stat-card"><div className="num">{students.filter(s=>s.gender==='Female').length}</div><div className="lbl">Female Students</div></div>
          </div>

          <div className="panel">
            <div className="panel-head">🏫 Students by Branch</div>
            <div className="panel-body tbl-wrap">
              <table>
                <thead>
                  <tr><th>Branch</th><th>Total</th><th>Male</th><th>Female</th></tr>
                </thead>
                <tbody>
                  {byBranch.map(b => (
                    <tr key={b.id}>
                      <td>🏫 {b.branch_name}</td>
                      <td><strong>{b.count}</strong></td>
                      <td>{b.male}</td>
                      <td>{b.female}</td>
                    </tr>
                  ))}
                  {branches.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No branches</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Students */}
      {tab === 'students' && !loading && (
        <>
          <h1 className="page-title">All Students</h1>
          <p className="page-sub">{filtered.length} of {students.length} student(s)</p>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <input
              className="form-control"
              style={{ flex: '1 1 200px', maxWidth: 300 }}
              placeholder="Search by name or course…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              style={{ flex: '1 1 160px', maxWidth: 220 }}
              value={filterB}
              onChange={e => setFilterB(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
            </select>
            {(search || filterB) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setFilterB(''); }}>
                Clear
              </button>
            )}
          </div>

          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Name</th><th>Gender</th><th>Course</th><th>Branch</th><th>Year</th></tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                      <td>{s.first_name} {s.last_name}</td>
                      <td>{s.gender}</td>
                      <td>{s.course_name}</td>
                      <td>{s.branch_name}</td>
                      <td>Year {s.year_of_study}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                      {search || filterB ? 'No matching students' : 'No students yet'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Branches */}
      {tab === 'branches' && !loading && (
        <>
          <h1 className="page-title">Branches</h1>
          <p className="page-sub">{branches.length} branch(es) — view only</p>
          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>Branch Name</th><th>Students</th><th>Male</th><th>Female</th></tr></thead>
                <tbody>
                  {byBranch.map((b, i) => (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                      <td>🏫 {b.branch_name}</td>
                      <td><strong>{b.count}</strong></td>
                      <td>{b.male}</td>
                      <td>{b.female}</td>
                    </tr>
                  ))}
                  {branches.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No branches</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showPw && <ChangePasswordModal onClose={() => setShowPw(false)} />}
    </AppShell>
  );
}
