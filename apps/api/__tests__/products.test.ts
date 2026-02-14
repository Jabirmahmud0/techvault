import request from 'supertest';
import app from '../src/app';

describe('Products API', () => {
    it('GET /products - should return list of products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /products/:id - should return 404 for non-existent product', async () => {
        const res = await request(app).get('/api/products/non-existent-id');
        expect(res.statusCode).toEqual(404);
    });
});
