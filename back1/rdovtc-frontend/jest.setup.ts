import '@testing-library/jest-dom';

// Mock next/navigation used in auth context
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push:    jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next/image to avoid canvas errors in test env
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    require('react').createElement('img', { src, alt }),
}));

// Suppress console.error for expected React warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('act('))
    ) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });
