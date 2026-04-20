'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedPage from '@/components/ProtectedPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import BranchesList from '@/components/BranchesList';
import UsersList from '@/components/UsersList';
import RegisterUserForm from '@/components/RegisterUserForm';
import RegisterBranchForm from '@/components/RegisterBranchForm';
import StudentsFilter from '@/components/StudentsFilter';
import ChangePasswordModal from '@/components/ChangePasswordModal';

type ModalKey =
  | 'branches' | 'users' | 'registerUser' | 'registerBranch'
  | 'students' | 'changePassword' | null;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [modal, setModal] = useState<ModalKey>(null);
  const close = () => setModal(null);

  const buttons: { label: string; key: ModalKey; variant?: string }[] = [
    { label: 'View Branches',            key: 'branches' },
    { label: 'View Users',               key: 'users' },
    { label: 'Register User',            key: 'registerUser' },
    { label: 'Register Branch',          key: 'registerBranch' },
    { label: 'View Registered Students', key: 'students' },
    { label: 'Change Password',          key: 'changePassword' },
  ];

  return (
    <ProtectedPage allowedRoles={['Admin']}>
      <div className="dashboard-page">
        <Header subtitle="(Admin Dashboard)" />

        <main className="dashboard-main">
          <div className="text-center">
            {buttons.map((b) => (
              <button
                key={b.key}
                className={`btn-action ${b.variant || ''}`}
                onClick={() => setModal(b.key)}
              >
                {b.label}
              </button>
            ))}
            <button
              className="btn-action btn-danger-action"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </main>

        <Footer />

        {/* ── Modals ── */}
        <Modal open={modal === 'branches'}       title="Branches"          onClose={close}>
          <BranchesList adminMode onChanged={close} />
        </Modal>

        <Modal open={modal === 'users'}          title="System Users"      onClose={close}>
          <UsersList onChanged={close} />
        </Modal>

        <Modal open={modal === 'registerUser'}   title="Register New User" onClose={close}>
          <RegisterUserForm onSuccess={close} />
        </Modal>

        <Modal open={modal === 'registerBranch'} title="Register New Branch" onClose={close}>
          <RegisterBranchForm onSuccess={close} />
        </Modal>

        <Modal open={modal === 'students'}       title="Registered Students" onClose={close} wide>
          <StudentsFilter />
        </Modal>

        {modal === 'changePassword' && (
          <ChangePasswordModal onClose={close} />
        )}
      </div>
    </ProtectedPage>
  );
}
