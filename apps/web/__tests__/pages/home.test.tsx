import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock child components to avoid complex rendering in unit test
jest.mock('@/components/ui/hero-parallax', () => ({
    HeroParallax: () => <div data-testid="hero">Hero Section</div>,
}));
jest.mock('@/components/product/product-card', () => ({
    ProductCard: () => <div data-testid="product-card">Product Card</div>,
}));
jest.mock('@/components/animations/scroll-reveal', () => ({
    ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Home Page', () => {
    it('renders hero section', () => {
        render(<Home />);
        expect(screen.getByTestId('hero')).toBeInTheDocument();
    });

    it('renders shop by category section', () => {
        render(<Home />);
        expect(screen.getByText('Shop by Category')).toBeInTheDocument();
        expect(screen.getByText('Laptops')).toBeInTheDocument();
        expect(screen.getByText('Smartphones')).toBeInTheDocument();
    });

    it('renders featured products', () => {
        render(<Home />);
        expect(screen.getByText('Featured Products')).toBeInTheDocument();
        // Check if at least one product card is rendered
        expect(screen.getAllByTestId('product-card').length).toBeGreaterThan(0);
    });
});
