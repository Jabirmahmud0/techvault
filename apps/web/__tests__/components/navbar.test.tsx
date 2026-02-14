import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/layout/navbar';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore } from '@/lib/stores/cart-store';

// Mock dependencies
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
    signOut: jest.fn(),
    useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('@/lib/stores/auth-store');
jest.mock('@/lib/stores/cart-store');

describe('Navbar', () => {
    beforeEach(() => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isAuthenticated: false,
        });
        (useCartStore as unknown as jest.Mock).mockReturnValue({
            toggleCart: jest.fn(),
            totalItems: () => 0,
        });
    });

    it('renders logo and nav links', () => {
        render(<Navbar />);
        expect(screen.getByText('TechVault')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('shows login button when not authenticated', () => {
        render(<Navbar />);
        expect(screen.getByLabelText('Login')).toBeInTheDocument();
    });

    it('shows user menu when authenticated', () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { name: 'Test User', email: 'test@example.com', role: 'USER' },
            isAuthenticated: true,
        });

        render(<Navbar />);
        expect(screen.getByLabelText('Account')).toBeInTheDocument();
    });

    it('opens mobile menu on toggle', () => {
        render(<Navbar />);
        const menuButton = screen.getByLabelText('Menu');
        fireEvent.click(menuButton);
        expect(screen.getByText('Home')).toBeVisible();
    });
});
