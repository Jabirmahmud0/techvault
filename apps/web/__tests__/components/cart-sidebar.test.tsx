import { render, screen, fireEvent } from '@testing-library/react';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { useCartStore } from '@/lib/stores/cart-store';

// Mock dependencies
jest.mock('@/lib/stores/cart-store');
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe('CartSidebar', () => {
    const toggleCartMock = jest.fn();
    const removeItemMock = jest.fn();
    const updateQuantityMock = jest.fn();

    beforeEach(() => {
        (useCartStore as unknown as jest.Mock).mockReturnValue({
            isOpen: true,
            items: [
                {
                    id: '1',
                    name: 'Test Product',
                    price: 100,
                    quantity: 2,
                    image: '/test.jpg'
                }
            ],
            totalPrice: () => 200,
            toggleCart: toggleCartMock,
            removeItem: removeItemMock,
            updateQuantity: updateQuantityMock,
        });
    });

    it('renders cart items when open', () => {
        render(<CartSidebar />);
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$200.00')).toBeInTheDocument();
    });

    it('calls removeItem when delete button clicked', () => {
        render(<CartSidebar />);
        const removeBtn = screen.getByLabelText('Remove item');
        fireEvent.click(removeBtn);
        expect(removeItemMock).toHaveBeenCalledWith('1');
    });

    it('closes sidebar when close button clicked', () => {
        render(<CartSidebar />);
        const closeBtn = screen.getByLabelText('Close cart');
        fireEvent.click(closeBtn);
        expect(toggleCartMock).toHaveBeenCalled();
    });
});
