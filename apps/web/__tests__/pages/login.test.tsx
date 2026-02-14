import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
    useSearchParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
}));

import { signIn } from 'next-auth/react';

describe('LoginPage', () => {
    beforeEach(() => {
        (useSearchParams as jest.Mock).mockReturnValue({ get: () => '/' });
        (signIn as jest.Mock).mockResolvedValue({ error: null, ok: true });
    });

    it('renders login form', () => {
        render(<LoginPage />);
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument(); // Using regex for case-insensitive match
    });

    it('submits form with valid data', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
                email: 'test@example.com',
                password: 'password123',
            }));
        });
    });

    it('shows error message on failure', async () => {
        (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
    });
});
