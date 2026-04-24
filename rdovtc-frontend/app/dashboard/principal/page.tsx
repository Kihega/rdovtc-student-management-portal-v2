'use client';
import { useState, useEffect, useCallback } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import AppShell from '@/components/AppShell';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { studentsApi, coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'overview', icon: '📊', label: 'Overview'        },
  { id: 'students', icon: '🎓', label: 'My Students'      },
  { id: 'register', icon: '➕', label: 'Register Student' },
  { id: 'password', icon: '🔒', label: 'Change Password'  },
];

export default function PrincipalDashboard() {
  return <ProtectedPage role="Principal/TC"><PrincipalContent /></ProtectedPage>;
}

function PrincipalContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [showPw, setShowPw] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [courses,  setCourses]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    if (!user?.branch_name) return;
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        studentsApi.list({ branch_name: user.branch_name }),
        coursesApi.byBranch(user.branch_name),
      ]);
      setStudents(s.data);
      setCourses(c.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleTab = (t: string) => {
    if (t === 'password') { setShowPw(true); return; }
    setTab(t);
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('Remove student?')) return;
    try { await studentsApi.delete(id); toast.success('Removed'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <AppShell activeTab={tab} setActiveTab={handleTab} navItems={NAV}>
      {loading && <div style={{textAlign:'center',padding:32}}><span className="spinner spinner-dark" style={{width:24,height:24,borderWidth:3}}/></div>}

      {tab === 'overview' && !loading && (
        <>
          <h1 className="page-title">Principal Dashboard</h1>
          <p className="page-sub">📍 {user?.branch_name}</p>
          <div className="stat-grid">
            <div className="stat-card"><div className="num">{students.length}</div><div className="lbl">My Students</div></div>
            <div className="stat-card"><div className="num">{students.filter((s:any)=>s.gender==='Male').length}</div><div className="lbl">Male</div></div>
            <div className="stat-card"><div className="num">{students.filter((s:any)=>s.gender==='Female').length}</div><div className="lbl">Female</div></div>
            <div className="stat-card"><div className="num">{courses.length}</div><div className="lbl">Courses Offered</div></div>
          </div>
          <div className="panel">
            <div className="panel-head">🎓 Recent Students</div>
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>Name</th><th>Course</th><th>Year</th></tr></thead>
                <tbody>
                  {students.slice(0,8).map((s:any)=>(
                    <tr key={s.id}><td>{s.first_name} {s.last_name}</td><td>{s.course_name}</td><td>{s.year_of_study}</td></tr>
                  ))}
                  {students.length===0&&<tr><td colSpan={3} style={{textAlign:'center',color:'var(--muted)',padding:24}}>No students yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'students' && !loading && (
        <>
          <h1 className="page-title">Students — {user?.branch_name}</h1>
          <p className="page-sub">{students.length} student(s)</p>
          <div className="panel">
            <div className="panel-body tbl-wrap">
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Gender</th><th>Course</th><th>Year</th><th></th></tr></thead>
                <tbody>
                  {students.map((s:any,i:number)=>(
                    <tr key={s.id}>
                      <td style={{color:'var(--muted)'}}>{i+1}</td>
                      <td>{s.first_name} {s.last_name}</td>
                      <td>{s.gender}</td>
                      <td>{s.course_name}</td>
                      <td>{s.year_of_study}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={()=>deleteStudent(s.id)}>Remove</button></td>
                    </tr>
                  ))}
                  {students.length===0&&<tr><td colSpan={6} style={{textAlign:'center',color:'var(--muted)',padding:24}}>No students</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'register' && !loading && (
        <>
          <h1 className="page-title">Register Student</h1>
          <p className="page-sub">Adding to {user?.branch_name}</p>
          <div className="panel">
            <div className="panel-body">
              <PrincipalRegisterForm branch={user?.branch_name||''} courses={courses} onSuccess={()=>{load();setTab('students');}} />
            </div>
          </div>
        </>
      )}

      {showPw && <ChangePasswordModal onClose={() => setShowPw(false)} />}
    </AppShell>
  );
}

function PrincipalRegisterForm({ branch, courses, onSuccess }: { branch:string; courses:any[]; onSuccess:()=>void }) {
  const [f, setF] = useState({ first_name:'',last_name:'',gender:'',course_id:'',year_of_study:'' });
  const [loading, setLoading] = useState(false);
  const set = (k:string,v:string) => setF(p=>({...p,[k]:v}));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await studentsApi.create({ ...f, branch_name: branch });
      toast.success('Student registered!');
      setF({first_name:'',last_name:'',gender:'',course_id:'',year_of_study:''});
      onSuccess();
    } catch (err:any) {
      const errs = err?.response?.data?.errors;
      toast.error(errs?Object.values(errs)[0] as string:err?.response?.data?.message||'Failed');
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
        <div className="mb-3"><label className="form-label">Year *</label>
          <select className="form-select" value={f.year_of_study} onChange={e=>set('year_of_study',e.target.value)} required>
            <option value="">Select</option><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option>
          </select>
        </div>
      </div>
      <div className="mb-3"><label className="form-label">Course *</label>
        <select className="form-select" value={f.course_id} onChange={e=>set('course_id',e.target.value)} required>
          <option value="">Select course</option>{courses.map((c:any)=><option key={c.id} value={c.id}>{c.course_name}</option>)}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading?<><span className="spinner"/>Registering…</>:'Register Student'}
      </button>
    </form>
  );
}
