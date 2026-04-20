'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedPage from '@/components/ProtectedPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import StudentsFilter from '@/components/StudentsFilter';
import BranchesList from '@/components/BranchesList';
import ChangePasswordModal from '@/components/ChangePasswordModal';

type ModalKey = 'students' | 'branches' | 'changePassword' | null;

export default function ViewerDashboard() {
  const { user, logout } = useAuth();
  const [modal, setModal] = useState<ModalKey>(null);
  const close = () => setModal(null);

  return (
    <ProtectedPage allowedRoles={['Executive director', 'VET Coordinator']}>
      <div className="dashboard-page" style={{ backgroundColor: 'green' }}>
        <Header subtitle={`(${user?.role})`} />

        <main className="dashboard-main">
          <div
            className="p-4 rounded-3"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <h4 className="text-white mb-4">Welcome, {user?.username}</h4>

            <button className="btn-action" onClick={() => setModal('students')}>
              View Registered Students
            </button>
            <button className="btn-action" onClick={() => setModal('branches')}>
              View Branches
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

        <Modal open={modal === 'students'} title="Registered Students" onClose={close} wide>
          <StudentsFilter />
        </Modal>

        <Modal open={modal === 'branches'} title="Branches" onClose={close}>
          <BranchesList />
        </Modal>

        {modal === 'changePassword' && (
          <ChangePasswordModal onClose={close} />
        )}
      </div>
    </ProtectedPage>
  );
}
