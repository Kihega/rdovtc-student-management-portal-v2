'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedPage from '@/components/ProtectedPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import RegisterStudentForm from '@/components/RegisterStudentForm';
import StudentsFilter from '@/components/StudentsFilter';
import RemoveStudents from '@/components/RemoveStudents';
import ChangePasswordModal from '@/components/ChangePasswordModal';

type ModalKey = 'register' | 'view' | 'remove' | 'changePassword' | null;

export default function PrincipalDashboard() {
  const { user, logout } = useAuth();
  const [modal, setModal] = useState<ModalKey>(null);
  const close = () => setModal(null);

  return (
    <ProtectedPage allowedRoles={['Principal/TC']}>
      <div className="dashboard-page" style={{ backgroundColor: 'green' }}>
        <Header username={user?.username} branch={user?.branch_name} />

        <main className="dashboard-main">
          <div
            className="p-4 rounded-3"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <button className="btn-action" onClick={() => setModal('register')}>
              Register Student
            </button>
            <button className="btn-action" onClick={() => setModal('view')}>
              View Registered Students
            </button>
            <button className="btn-action" onClick={() => setModal('remove')}>
              Remove Registered Students
            </button>
            <button className="btn-action" onClick={() => setModal('changePassword')}>
              Change Password
            </button>
            <button className="btn-action btn-danger-action" onClick={logout}>
              Logout
            </button>
          </div>
        </main>

        <Footer />

        <Modal open={modal === 'register'}       title="Register Student"        onClose={close} wide>
          <RegisterStudentForm onSuccess={close} />
        </Modal>

        <Modal open={modal === 'view'}           title="Registered Students"     onClose={close} wide>
          <StudentsFilter lockedBranch={user?.branch_name ?? undefined} />
        </Modal>

        <Modal open={modal === 'remove'}         title="Remove Student"          onClose={close} wide>
          <RemoveStudents lockedBranch={user?.branch_name ?? undefined} />
        </Modal>

        {modal === 'changePassword' && (
          <ChangePasswordModal onClose={close} />
        )}
      </div>
    </ProtectedPage>
  );
}
