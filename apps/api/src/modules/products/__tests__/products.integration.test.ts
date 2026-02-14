import request from 'supertest';
import app from '../../app'; // Default export
import { db } from '../../config/database'; // Named export from ./config/database.js

describe('Products API Integration Tests', () => {

    // We can assume the seed script has run and populated the DB with some data.
    // Or we could mock the DB calls. For integration tests, hitting a test DB is better,
    // but hitting the development DB (if safe) or a spun-up test container is standard.
    // Given the environment, we'll try to read from the existing DB.

    it('GET /api/products should return a list of products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/products/:slug should return a single product', async () => {
        // First get a list to find a valid slug
        const listResponse = await request(app).get('/api/products');
        const firstProduct = listResponse.body.data[0];
        const slug = firstProduct.slug;

        const response = await request(app).get(`/api/products/${slug}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.slug).toBe(slug);
    });

    it('GET /api/products/invalid-slug should return 404', async () => {
        const response = await request(app).get('/api/products/non-existent-product-slug-12345');
        expect(response.status).toBe(404);
    });
});
