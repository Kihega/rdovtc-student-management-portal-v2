import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/page';
import { AuthProvider } from '@/lib/auth-context';
import { authApi } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  authApi: {
    login:          jest.fn(),
    logout:         jest.fn(),
    me:             jest.fn(),
    changePassword: jest.fn(),
    updatePassword: jest.fn(),
  },
  studentsApi: { list: jest.fn(), create: jest.fn(), delete: jest.fn() },
  branchesApi: { list: jest.fn() },
  coursesApi:  { list: jest.fn(), byBranch: jest.fn() },
  usersApi:    { list: jest.fn(), create: jest.fn(), delete: jest.fn() },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

const renderLogin = () =>
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders system description on the left side', () => {
    renderLogin();
    expect(screen.getByText(/registering students for all rdo vtcs/i)).toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    (authApi.login as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'admin@vtc.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  it('calls authApi.login with correct credentials', async () => {
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        token: 'tok_abc',
        user: { id: 1, username: 'admin@vtc.com', role: 'Admin', branch_name: null, phone: '' },
      },
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'admin@vtc.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('admin@vtc.com', 'secret123');
    });
  });

  it('shows forgot password modal when link is clicked', async () => {
    renderLogin();
    fireEvent.click(screen.getByText(/forgot password\?/i));
    await waitFor(() => {
      expect(screen.getByText(/change password/i)).toBeInTheDocument();
    });
  });

  it('renders the header and footer', () => {
    renderLogin();
    expect(screen.getByText(/rdo-vtc's students record management system/i)).toBeInTheDocument();
    expect(screen.getByText(/2025 rdo-vtc/i)).toBeInTheDocument();
  });
});
