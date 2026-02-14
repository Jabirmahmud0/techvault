import request from 'supertest';
import app from '../src/app';

describe('Cart API', () => {
    it('GET /cart - should require authentication', async () => {
        const res = await request(app).get('/api/cart');
        expect(res.statusCode).toEqual(401);
    });
});
