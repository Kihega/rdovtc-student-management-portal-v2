'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { studentsApi, coursesApi, branchesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Branch { id: number; branch_name: string; }
interface Course { id: number; course_code: string; course_name: string; }

interface Props { onSuccess?: () => void; }

const EMPTY = {
  first_name: '', middle_name: '', surname: '',
  gender: '', branch_name: '', course: '',
  date_of_birth: '', village: '', ward: '', district: '', region: '',
  education_level: '', student_telephone: '',
  registration_number: '', registration_date: '',
  residential_status: '', prem_no: '', std_vii_index_no: '', form_iv_index_no: '',
  status: '', duration: '', sponsor: '',
  guardian_full_name: '', guardian_address: '', guardian_telephone: '', occupation: '',
};

export default function RegisterStudentForm({ onSuccess }: Props) {
  const { user } = useAuth();
  const isPrincipal = user?.role === 'Principal/TC';

  const [form, setForm]     = useState({ ...EMPTY, branch_name: isPrincipal ? (user?.branch_name ?? '') : '' });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(false);

  const fetchCourses = useCallback((branchName: string) => {
    if (!branchName) { setCourses([]); return; }
    coursesApi.byBranch(branchName).then(r => setCourses(r.data));
  }, []);

  useEffect(() => {
    if (!isPrincipal) branchesApi.list().then(r => setBranches(r.data));
    else fetchCourses(user?.branch_name ?? '');
  }, [isPrincipal, user, fetchCourses]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleBranchChange = (v: string) => {
    set('branch_name', v);
    set('course', '');
    fetchCourses(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentsApi.create(form);
      toast.success('Student registered successfully!');
      setForm({ ...EMPTY, branch_name: isPrincipal ? (user?.branch_name ?? '') : '' });
      if (!isPrincipal) setCourses([]);
      else fetchCourses(user?.branch_name ?? '');
      onSuccess?.();
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      if (errs) {
        const first = Object.values(errs)[0] as string[];
        toast.error(first[0]);
      } else {
        toast.error(err?.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rdo-form" onSubmit={handleSubmit}>
      <h1>Student Information</h1>

      <div className="form-grid">
        <Field label="First Name *">
          <input type="text" required value={form.first_name} onChange={e => set('first_name', e.target.value)} />
        </Field>
        <Field label="Middle Name">
          <input type="text" value={form.middle_name} onChange={e => set('middle_name', e.target.value)} />
        </Field>
        <Field label="Surname *">
          <input type="text" required value={form.surname} onChange={e => set('surname', e.target.value)} />
        </Field>

        {/* Branch */}
        <Field label="Centre of Registration *">
          {isPrincipal ? (
            <input type="text" value={form.branch_name} readOnly style={{ background: '#f0f0f0' }} />
          ) : (
            <select required value={form.branch_name} onChange={e => handleBranchChange(e.target.value)}>
              <option value="">-- Select Centre --</option>
              {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
            </select>
          )}
        </Field>

        {/* Course */}
        <Field label="Course Registered *">
          <select required value={form.course} onChange={e => set('course', e.target.value)}>
            <option value="">-- Select Course --</option>
            {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
          </select>
        </Field>

        <Field label="Date of Birth">
          <input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
        </Field>
        <Field label="Village / Street">
          <input type="text" value={form.village} onChange={e => set('village', e.target.value)} />
        </Field>
        <Field label="Ward">
          <input type="text" value={form.ward} onChange={e => set('ward', e.target.value)} />
        </Field>
        <Field label="District">
          <input type="text" value={form.district} onChange={e => set('district', e.target.value)} />
        </Field>
        <Field label="Region">
          <input type="text" value={form.region} onChange={e => set('region', e.target.value)} />
        </Field>

        <Field label="Education Level">
          <select value={form.education_level} onChange={e => set('education_level', e.target.value)}>
            <option value="">-- Select --</option>
            <option value="primary">Primary Level</option>
            <option value="secondary">Secondary Level</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Telephone Number">
          <input type="tel" placeholder="+255XXXXXXXXX" value={form.student_telephone}
            onChange={e => set('student_telephone', e.target.value)} />
        </Field>
        <Field label="Registration Number">
          <input type="text" placeholder="RDO/MD/AHP/2025/001" value={form.registration_number}
            onChange={e => set('registration_number', e.target.value)} />
        </Field>
        <Field label="Registration Date *">
          <input type="date" required value={form.registration_date}
            onChange={e => set('registration_date', e.target.value)} />
        </Field>

        <Field label="Residence">
          <select value={form.residential_status} onChange={e => set('residential_status', e.target.value)}>
            <option value="">-- Select --</option>
            <option value="day">Day</option>
            <option value="boarding">Boarding</option>
          </select>
        </Field>

        <Field label="Registration Status *">
          <select required value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="">-- Select Status --</option>
            <option value="Long Course">Long Course</option>
            <option value="Short Course">Short Course</option>
          </select>
        </Field>

        {form.status === 'Short Course' && (
          <Field label="Duration *">
            <select required value={form.duration} onChange={e => set('duration', e.target.value)}>
              <option value="">-- Select Duration --</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
            </select>
          </Field>
        )}

        <Field label="Sponsor">
          <select value={form.sponsor} onChange={e => set('sponsor', e.target.value)}>
            <option value="">-- Select Sponsor --</option>
            <option value="OSP">Orphans Support (OSP)</option>
            <option value="PRIVATE">Private</option>
          </select>
        </Field>

        <Field label="Prem No">
          <input type="text" placeholder="P000/000/000" value={form.prem_no}
            onChange={e => set('prem_no', e.target.value)} />
        </Field>
        <Field label="Std VII Index No">
          <input type="text" placeholder="PS000/000/000" value={form.std_vii_index_no}
            onChange={e => set('std_vii_index_no', e.target.value)} />
        </Field>
        <Field label="Form IV Index No">
          <input type="text" placeholder="S000/000/000" value={form.form_iv_index_no}
            onChange={e => set('form_iv_index_no', e.target.value)} />
        </Field>
      </div>

      {/* Gender */}
      <div className="mt-3">
        <label className="fw-bold me-3">Gender *</label>
        {['Male', 'Female', 'Other'].map(g => (
          <label key={g} className="me-3">
            <input type="radio" name="gender" value={g} required
              checked={form.gender === g} onChange={e => set('gender', e.target.value)}
              className="me-1" />
            {g}
          </label>
        ))}
      </div>

      {/* Guardian */}
      <h2>Parents / Guardian Information</h2>
      <div className="form-grid">
        <Field label="Guardian Full Name">
          <input type="text" value={form.guardian_full_name}
            onChange={e => set('guardian_full_name', e.target.value)} />
        </Field>
        <Field label="Guardian Address">
          <input type="text" value={form.guardian_address}
            onChange={e => set('guardian_address', e.target.value)} />
        </Field>
        <Field label="Guardian Telephone">
          <input type="tel" placeholder="+255XXXXXXXXX" value={form.guardian_telephone}
            onChange={e => set('guardian_telephone', e.target.value)} />
        </Field>
        <Field label="Occupation">
          <input type="text" value={form.occupation}
            onChange={e => set('occupation', e.target.value)} />
        </Field>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering…' : 'Register Student'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}
