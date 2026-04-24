'use client';
import { useState, useEffect, useCallback } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import AppShell from '@/components/AppShell';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { studentsApi, branchesApi, usersApi, coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'overview',  icon: '📊', label: 'Overview'       },
  { id: 'students',  icon: '🎓', label: 'Students'        },
  { id: 'branches',  icon: '🏫', label: 'Branches'        },
  { id: 'users',     icon: '👥', label: 'Users'           },
  { id: 'register',  icon: '➕', label: 'Register Student'},
  { id: 'password',  icon: '🔒', label: 'Change Password' },
];

export default function AdminDashboard() {
  return (
    <ProtectedPage role="Admin">
      <AdminContent />
    </ProtectedPage>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [showPwModal, setShowPwModal] = useState(false);

  const [students,  setStudents]  = useState<any[]>([]);
  const [branches,  setBranches]  = useState<any[]>([]);
  const [users,     setUsers]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);

  // Stats
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b, u] = await Promise.all([
        studentsApi.list(),
        branchesApi.list(),
        usersApi.list(),
      ]);
      setStudents(s.data);
      setBranches(b.data);
      setUsers(u.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (t: string) => {
    if (t === 'password') { setShowPwModal(true); return; }
    setTab(t);
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('Remove this student?')) return;
    try { await studentsApi.delete(id); toast.success('Student removed'); load(); }
    catch { toast.error('Failed to remove student'); }
  };

  const deleteBranch = async (id: number) => {
    if (!confirm('Remove this branch?')) return;
    try { await branchesApi.delete(id); toast.success('Branch removed'); load(); }
    catch { toast.error('Failed to remove branch'); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Remove this user?')) return;
    try { await usersApi.delete(id); toast.success('User removed'); load(); }
    catch { toast.error('Failed to remove user'); }
  };

  const roleBadge = (role: string) => {
    const m: Record<string,string> = {
      'Admin':'badge-admin','Executive director':'badge-ed',
      'VET Coordinator':'badge-vet','Principal/TC':'badge-prin'
    };
    return m[role] || 'badge-admin';
  };

  return (
    <AppShell activeTab={tab} setActiveTab={handleTabChange} navItems={NAV}>
      {loading && <div style={{ textAlign:'center', padding: 32 }}><span className="spinner spinner-dark" style={{ width:24,height:24,borderWidth:3 }} /></div>}

      {/* Overview */}
      {tab === 'overview' && !loading && (
        <>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Welcome back, {user?.username}</p>
          <div className="stat-grid">
            <div className="stat-card"><div className="num">{students.length}</div><div className="lbl">Total Students</div></div>
            <div className="stat-card"><div className="num">{branches.length}</div><div className="lbl">Branches</div></div>
            <div className="stat-card"><div className="num">{users.length}</div><div className="lbl">Users</div></div>
            <div className="stat-card"><div className="num">{students.filter((s:any)=>s.gender==='Male').length}</div><div className="lbl">Male Students</div></div>
            <div className="stat-card"><div className="num">{students.filter((s:any)=>s.gender==='Female').length}</div><div className="lbl">Female Students</div></div>
          </div>
          <div className="panel">
            <div className="panel-head">📋 Recent Students</div>
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>Name</th><th>Course</th><th>Branch</th><th>Year</th></tr></thead>
                <tbody>
                  {students.slice(0,8).map((s:any) => (
                    <tr key={s.id}>
                      <td>{s.first_name} {s.last_name}</td>
                      <td>{s.course_name}</td>
                      <td>{s.branch_name}</td>
                      <td>{s.year_of_study}</td>
                    </tr>
                  ))}
                  {students.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',color:'var(--muted)',padding:24}}>No students yet</td></tr>}
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
          <p className="page-sub">{students.length} student(s) across all branches</p>
          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Gender</th><th>Course</th><th>Branch</th><th>Year</th><th></th></tr></thead>
                <tbody>
                  {students.map((s:any, i:number) => (
                    <tr key={s.id}>
                      <td style={{color:'var(--muted)'}}>{i+1}</td>
                      <td>{s.first_name} {s.last_name}</td>
                      <td>{s.gender}</td>
                      <td>{s.course_name}</td>
                      <td>{s.branch_name}</td>
                      <td>{s.year_of_study}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s.id)}>Remove</button></td>
                    </tr>
                  ))}
                  {students.length===0 && <tr><td colSpan={7} style={{textAlign:'center',color:'var(--muted)',padding:24}}>No students</td></tr>}
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
          <p className="page-sub">{branches.length} branch(es) registered</p>
          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>Branch Name</th><th></th></tr></thead>
                <tbody>
                  {branches.map((b:any, i:number) => (
                    <tr key={b.id}>
                      <td style={{color:'var(--muted)'}}>{i+1}</td>
                      <td>🏫 {b.branch_name}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteBranch(b.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">➕ Add Branch</div>
            <AddBranchForm onSuccess={load} />
          </div>
        </>
      )}

      {/* Users */}
      {tab === 'users' && !loading && (
        <>
          <h1 className="page-title">System Users</h1>
          <p className="page-sub">{users.length} user(s) registered</p>
          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>Email</th><th>Role</th><th>Branch</th><th></th></tr></thead>
                <tbody>
                  {users.map((u:any, i:number) => (
                    <tr key={u.id}>
                      <td style={{color:'var(--muted)'}}>{i+1}</td>
                      <td>{u.username}</td>
                      <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                      <td>{u.branch_name || '—'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">➕ Add User</div>
            <AddUserForm branches={branches} onSuccess={load} />
          </div>
        </>
      )}

      {/* Register Student */}
      {tab === 'register' && !loading && (
        <>
          <h1 className="page-title">Register Student</h1>
          <p className="page-sub">Add a new student to any branch</p>
          <div className="panel">
            <div className="panel-body">
              <RegisterStudentForm branches={branches} onSuccess={() => { load(); setTab('students'); }} />
            </div>
          </div>
        </>
      )}

      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </AppShell>
  );
}

// ── Inline sub-forms ──────────────────────────────────────────────────────────
function AddBranchForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await branchesApi.create({ branch_name: name }); toast.success('Branch added'); setName(''); onSuccess(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} style={{ padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input className="form-control" style={{ flex: 1, minWidth: 200 }} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. VTC-Mbeya" required />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <span className="spinner"/> : 'Add Branch'}
      </button>
    </form>
  );
}

function AddUserForm({ branches, onSuccess }: { branches: any[]; onSuccess: () => void }) {
  const ROLES = ['Admin','Executive director','VET Coordinator','Principal/TC'];
  const [f, setF] = useState({ username:'', password:'', role:'', branch_name:'', phone:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setF(p => ({...p,[k]:v}));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.create({ ...f, password_confirmation: f.password });
      toast.success('User added'); setF({ username:'',password:'',role:'',branch_name:'',phone:'' }); onSuccess();
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0] as string : err?.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} style={{ padding: 16 }}>
      <div className="form-row">
        <div className="mb-3"><label className="form-label">Email *</label><input type="email" className="form-control" value={f.username} onChange={e=>set('username',e.target.value)} required placeholder="user@example.com" /></div>
        <div className="mb-3"><label className="form-label">Role *</label>
          <select className="form-select" value={f.role} onChange={e=>{set('role',e.target.value);set('branch_name','')}} required>
            <option value="">Select role</option>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="mb-3"><label className="form-label">Phone *</label><input type="tel" className="form-control" value={f.phone} onChange={e=>set('phone',e.target.value)} required placeholder="+255..." /></div>
        {f.role==='Principal/TC' && (
          <div className="mb-3"><label className="form-label">Branch *</label>
            <select className="form-select" value={f.branch_name} onChange={e=>set('branch_name',e.target.value)} required>
              <option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="mb-3"><label className="form-label">Password *</label>
        <div className="pw-wrap">
          <input type={showPw?'text':'password'} className="form-control" value={f.password} onChange={e=>set('password',e.target.value)} required minLength={6} />
          <button type="button" className="pw-eye" onClick={()=>setShowPw(v=>!v)} tabIndex={-1}>
            {showPw ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <><span className="spinner"/> Adding…</> : 'Add User'}
      </button>
    </form>
  );
}

function RegisterStudentForm({ branches, onSuccess }: { branches: any[]; onSuccess: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [f, setF] = useState({ first_name:'',last_name:'',gender:'',branch_name:'',course_id:'',year_of_study:'' });
  const [loading, setLoading] = useState(false);
  const set = (k:string,v:string) => setF(p=>({...p,[k]:v}));

  const onBranchChange = async (branch: string) => {
    set('branch_name', branch); set('course_id', '');
    if (!branch) { setCourses([]); return; }
    try { const r = await coursesApi.byBranch(branch); setCourses(r.data); }
    catch { setCourses([]); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await studentsApi.create(f);
      toast.success('Student registered!');
      setF({first_name:'',last_name:'',gender:'',branch_name:'',course_id:'',year_of_study:''});
      setCourses([]); onSuccess();
    } catch (err:any) {
      const errs = err?.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0] as string : err?.response?.data?.message||'Failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="mb-3"><label className="form-label">First Name *</label><input className="form-control" value={f.first_name} onChange={e=>set('first_name',e.target.value)} required /></div>
        <div className="mb-3"><label className="form-label">Last Name *</label><input className="form-control" value={f.last_name} onChange={e=>set('last_name',e.target.value)} required /></div>
      </div>
      <div className="form-row">
        <div className="mb-3"><label className="form-label">Gender *</label>
          <select className="form-select" value={f.gender} onChange={e=>set('gender',e.target.value)} required>
            <option value="">Select</option><option>Male</option><option>Female</option>
          </select>
        </div>
        <div className="mb-3"><label className="form-label">Year of Study *</label>
          <select className="form-select" value={f.year_of_study} onChange={e=>set('year_of_study',e.target.value)} required>
            <option value="">Select</option><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="mb-3"><label className="form-label">Branch *</label>
          <select className="form-select" value={f.branch_name} onChange={e=>onBranchChange(e.target.value)} required>
            <option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
          </select>
        </div>
        <div className="mb-3"><label className="form-label">Course *</label>
          <select className="form-select" value={f.course_id} onChange={e=>set('course_id',e.target.value)} required disabled={!courses.length}>
            <option value="">Select course</option>{courses.map((c:any)=><option key={c.id} value={c.id}>{c.course_name}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <><span className="spinner"/> Registering…</> : 'Register Student'}
      </button>
    </form>
  );
}
