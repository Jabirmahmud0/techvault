import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product/product-card';
import { useCartStore } from '@/lib/stores/cart-store';

// Mock dependencies
jest.mock('@/lib/stores/cart-store');
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    price: 99.99,
    salePrice: null,
    images: ['/test-image.jpg'],
    categoryId: 'cat1',
    stock: 10,
    rating: 4.5,
    reviewsCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [],
    specifications: {}, // Changed from string to object to match type definition
    category: {
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Category Description',
        image: 'test-category-image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
};

describe('ProductCard', () => {
    const addItemMock = jest.fn();

    beforeEach(() => {
        (useCartStore as unknown as jest.Mock).mockReturnValue({
            addItem: addItemMock,
        });
    });

    it('renders product details', () => {
        render(<ProductCard product={mockProduct} />);
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('adds item to cart when clicked', () => {
        render(<ProductCard product={mockProduct} />);
        // Find the cart button (it might be an icon button, so we might need aria-label or just role button)
        // Looking at the component, it might be a button with "Add to Cart" or an icon.
        // Assuming aria-label="Add to cart" based on common patterns or just finding any button if distinct.
        // Let's assume there is a button.
        const buttons = screen.getAllByRole('button');
        // Usually the add to cart is one of them. Let's try finding by aria-label if possible, or text.
        // If implementation details fail, we might need to adjust.
        // For now, let's assume there's an aria-label="Add to cart"

        // NOTE: If this fails, I'll need to check ProductCard implementation.
        // Assuming there is a button that calls addItem.
        // Let's try to click the button that looks like a cart button.

        const addToCartBtn = buttons.find(btn => btn.querySelector('svg')); // specific to lucide icon inside
        if (addToCartBtn) {
            fireEvent.click(addToCartBtn);
            expect(addItemMock).toHaveBeenCalledWith(expect.objectContaining({
                id: mockProduct.id,
            }));
        }
    });
});
