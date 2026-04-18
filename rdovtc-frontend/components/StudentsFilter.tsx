'use client';
import { useState } from 'react';
import { studentsApi, branchesApi, coursesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface Branch { id: number; branch_name: string; }
interface Course { id: number; course_code: string; course_name: string; }
interface Student {
  id: number; first_name: string; middle_name: string; surname: string;
  gender: string; course: string; registration_number: string;
  registration_date: string; status: string; duration: string;
  sponsor: string; branch_name: string; residential_status: string;
}

interface Props {
  lockedBranch?: string;  // forces branch for Principal/TC
}

const YEARS = Array.from({ length: 12 }, (_, i) => 2020 + i);

export default function StudentsFilter({ lockedBranch }: Props) {
  const { user } = useAuth();
  const isPrincipal = user?.role === 'Principal/TC';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [filters, setFilters] = useState({
    branch: lockedBranch || '',
    year:   '',
    status: '',
    duration: '',
    course: '',
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!isPrincipal) branchesApi.list().then(r => setBranches(r.data));
    if (lockedBranch) {
      coursesApi.byBranch(lockedBranch).then(r => setCourses(r.data));
    }
  }, [isPrincipal, lockedBranch]);

  const handleBranchChange = (v: string) => {
    setFilters(f => ({ ...f, branch: v, course: '' }));
    if (v) coursesApi.byBranch(v).then(r => setCourses(r.data));
    else setCourses([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.branch)   params.branch   = filters.branch;
      if (filters.year)     params.year      = filters.year;
      if (filters.status)   params.status    = filters.status;
      if (filters.duration) params.duration  = filters.duration;
      if (filters.course)   params.course    = filters.course;

      const { data } = await studentsApi.list(params);
      setStudents(data);
      setSearched(true);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-wrapper">
      {/* ── Filter Form ── */}
      <div className="filter-box">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            {/* Branch */}
            <div className="col-md-3">
              <label className="form-label fw-bold">Branch</label>
              {isPrincipal ? (
                <input className="form-control" value={lockedBranch} readOnly style={{ background: '#f0f0f0' }} />
              ) : (
                <select className="form-select" value={filters.branch}
                  onChange={e => handleBranchChange(e.target.value)}>
                  <option value="">-- All Branches --</option>
                  {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
                </select>
              )}
            </div>

            {/* Year */}
            <div className="col-md-2">
              <label className="form-label fw-bold">Year</label>
              <select className="form-select" value={filters.year}
                onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}>
                <option value="">-- All --</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="col-md-2">
              <label className="form-label fw-bold">Status</label>
              <select className="form-select" value={filters.status}
                onChange={e => setFilters(f => ({
                  ...f, status: e.target.value, duration: '',
                }))}>
                <option value="">-- All --</option>
                <option value="Long Course">Long Course</option>
                <option value="Short Course">Short Course</option>
              </select>
            </div>

            {/* Duration — only for Short Course */}
            {filters.status === 'Short Course' && (
              <div className="col-md-2">
                <label className="form-label fw-bold">Duration</label>
                <select className="form-select" value={filters.duration}
                  onChange={e => setFilters(f => ({ ...f, duration: e.target.value }))}>
                  <option value="">-- All --</option>
                  <option value="3months">3 months</option>
                  <option value="6months">6 months</option>
                </select>
              </div>
            )}

            {/* Course */}
            {courses.length > 0 && (
              <div className="col-md-3">
                <label className="form-label fw-bold">Course</label>
                <select className="form-select" value={filters.course}
                  onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}>
                  <option value="">-- All Courses --</option>
                  {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                </select>
              </div>
            )}

            <div className="col-md-2">
              <button className="btn w-100 text-white fw-bold" type="submit"
                style={{ background: '#006400' }} disabled={loading}>
                {loading ? 'Loading…' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {searched && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 text-green fw-bold">
              {students.length} student{students.length !== 1 ? 's' : ''} found
            </h6>
          </div>

          {students.length === 0 ? (
            <div className="alert alert-warning">No students match the selected filters.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Gender</th>
                    <th>Course</th>
                    <th>Reg. Number</th>
                    <th>Reg. Date</th>
                    <th>Status</th>
                    <th>Sponsor</th>
                    <th>Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{idx + 1}</td>
                      <td>{[s.first_name, s.middle_name, s.surname].filter(Boolean).join(' ')}</td>
                      <td>{s.gender}</td>
                      <td>{s.course}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.registration_number}</td>
                      <td>{s.registration_date}</td>
                      <td>
                        <span className={`badge ${s.status === 'Long Course' ? 'bg-success' : 'bg-info text-dark'}`}>
                          {s.status}
                        </span>
                        {s.duration && <small className="d-block text-muted">{s.duration}</small>}
                      </td>
                      <td>{s.sponsor?.replace('$', '') || '-'}</td>
                      <td>{s.branch_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
