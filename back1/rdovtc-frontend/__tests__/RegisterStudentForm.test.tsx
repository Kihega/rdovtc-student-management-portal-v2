import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterStudentForm from '@/components/RegisterStudentForm';
import { studentsApi, branchesApi, coursesApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  studentsApi: { create: jest.fn() },
  branchesApi: { list: jest.fn() },
  coursesApi:  { byBranch: jest.fn(), list: jest.fn() },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'admin@vtc.com', role: 'Admin', branch_name: null },
  }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const mockBranches = [
  { id: 1, branch_name: 'VTC-Mdabulo' },
  { id: 2, branch_name: 'VTC-Kilolo' },
];

const mockCourses = [
  { id: 1, course_code: 'EI', course_name: 'Electrical Installation (EI)' },
  { id: 2, course_code: 'AHP', course_name: 'Animal Health and Production (AHP)' },
];

beforeEach(() => {
  (branchesApi.list as jest.Mock).mockResolvedValue({ data: mockBranches });
  (coursesApi.byBranch as jest.Mock).mockResolvedValue({ data: mockCourses });
  jest.clearAllMocks();
});

describe('RegisterStudentForm', () => {
  it('renders all key form fields', async () => {
    render(<RegisterStudentForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/surname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/registration date/i)).toBeInTheDocument();
    expect(screen.getByText(/register student/i)).toBeInTheDocument();
  });

  it('loads branches for admin role on mount', async () => {
    render(<RegisterStudentForm />);

    await waitFor(() => {
      expect(branchesApi.list).toHaveBeenCalledTimes(1);
    });
  });

  it('fetches courses when a branch is selected', async () => {
    render(<RegisterStudentForm />);

    // Wait for branches to load
    await waitFor(() => expect(branchesApi.list).toHaveBeenCalled());

    const branchSelect = screen.getByLabelText(/centre of registration/i);
    await userEvent.selectOptions(branchSelect, 'VTC-Mdabulo');

    await waitFor(() => {
      expect(coursesApi.byBranch).toHaveBeenCalledWith('VTC-Mdabulo');
    });
  });

  it('shows duration field only when Short Course is selected', async () => {
    render(<RegisterStudentForm />);

    // Duration not visible initially
    expect(screen.queryByLabelText(/duration/i)).not.toBeInTheDocument();

    const statusSelect = screen.getByLabelText(/registration status/i);
    await userEvent.selectOptions(statusSelect, 'Short Course');

    await waitFor(() => {
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    });
  });

  it('hides duration when Long Course is selected after Short Course', async () => {
    render(<RegisterStudentForm />);

    const statusSelect = screen.getByLabelText(/registration status/i);
    await userEvent.selectOptions(statusSelect, 'Short Course');
    await waitFor(() => expect(screen.getByLabelText(/duration/i)).toBeInTheDocument());

    await userEvent.selectOptions(statusSelect, 'Long Course');
    await waitFor(() => {
      expect(screen.queryByLabelText(/duration/i)).not.toBeInTheDocument();
    });
  });

  it('renders gender radio buttons', () => {
    render(<RegisterStudentForm />);
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
    expect(screen.getByLabelText('Female')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  it('renders guardian section', () => {
    render(<RegisterStudentForm />);
    expect(screen.getByText(/parents \/ guardian information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guardian full name/i)).toBeInTheDocument();
  });

  it('calls studentsApi.create on valid submission', async () => {
    (studentsApi.create as jest.Mock).mockResolvedValue({
      data: { message: 'Student registered successfully.' },
    });

    render(<RegisterStudentForm />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/surname/i), 'Doe');

    fireEvent.click(screen.getByLabelText('Male'));

    await userEvent.type(
      screen.getByLabelText(/registration date/i),
      '2025-01-15'
    );

    const statusSelect = screen.getByLabelText(/registration status/i);
    await userEvent.selectOptions(statusSelect, 'Long Course');

    fireEvent.submit(screen.getByText(/register student/i).closest('form')!);

    await waitFor(() => {
      expect(studentsApi.create).toHaveBeenCalled();
    });
  });
});
