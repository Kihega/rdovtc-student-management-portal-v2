import { render, screen, waitFor } from '@testing-library/react';
import ProtectedPage from '@/components/ProtectedPage';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

// Control auth state per test
const mockUseAuth = jest.fn();
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedPage', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('shows spinner while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to / when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <ProtectedPage>
        <div>Protected content</div>
      </ProtectedPage>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('renders children for authenticated user with correct role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: 'Admin', username: 'admin@vtc.com' },
      loading: false,
    });

    render(
      <ProtectedPage allowedRoles={['Admin']}>
        <div>Admin content</div>
      </ProtectedPage>
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects Principal/TC away from Admin page', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, role: 'Principal/TC', username: 'principal@vtc.com' },
      loading: false,
    });

    render(
      <ProtectedPage allowedRoles={['Admin']}>
        <div>Admin only</div>
      </ProtectedPage>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/principal');
    });
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
  });

  it('renders without role restriction for any authenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 3, role: 'VET Coordinator', username: 'vet@vtc.com' },
      loading: false,
    });

    render(
      <ProtectedPage>
        <div>Open content</div>
      </ProtectedPage>
    );

    expect(screen.getByText('Open content')).toBeInTheDocument();
  });
});
