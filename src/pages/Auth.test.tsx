import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Auth from './Auth';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster"; // Required for useToast
import { AuthProvider } from '@/context/AuthContext';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [], // Provide an empty array for the Toaster to map over
  }),
}));

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        {ui}
        <Toaster />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Auth Page Integration Test', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Reset getSession mock for each test
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: null } });
  });

  it('should allow a user to type in the sign-in form and attempt to sign in', async () => {
    const user = userEvent.setup();
    // Make the mock return a promise that never resolves to keep the component in a loading state
    (supabase.auth.signInWithPassword as vi.Mock).mockImplementation(() => {
      return new Promise(() => {});
    });

    renderWithRouter(<Auth />);

    // Find elements within the "Sign In" tab
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    // Ensure we are in the sign-in tab
    expect(signInButton).toBeInTheDocument();

    // Simulate user input
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');

    // Simulate form submission
    await user.click(signInButton);

    // After clicking, wait for the UI to update to the loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /sign in/i }).querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Also, verify that the signIn function was called with the correct credentials
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show an error message if sign-in fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid login credentials';
    (supabase.auth.signInWithPassword as vi.Mock).mockResolvedValue({
      error: { message: errorMessage, name: 'AuthApiError' },
    });

    renderWithRouter(<Auth />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(signInButton);

    // Wait for the error message to appear
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Invalid email or password. Please check your credentials and try again.');
    });
  });
});
