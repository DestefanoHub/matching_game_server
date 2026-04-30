import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

describe('Login operations', () => {
    test('player has successfully logged in', async () => {
        const payload = {
            username: 'Andrew',
            password: 'MGAcctPass0!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/(application\/json)/);
        expect(Object.hasOwn(response.body, 'ID')).toBeTruthy();
        expect(response.body.ID).toBe('6914e7e18bb180a0e191a995');
        expect(Object.hasOwn(response.body, 'username')).toBeTruthy();
        expect(response.body.username).toBe('Andrew');
        expect(Object.hasOwn(response.body, 'JWT')).toBeTruthy();
    });

    test('player has failed logged in: incorrect username, correct password', async () => {
        const payload = {
            username: 'peepeepoopoo',
            password: 'MGAcctPass0!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: incorrect username wrong case, correct password', async () => {
        const payload = {
            username: 'AnDrEw',
            password: 'MGAcctPass0!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: correct username, incorrect password wrong case', async () => {
        const payload = {
            username: 'Andrew',
            password: 'mgacctpass0!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: correct username, incorrect password', async () => {
        const payload = {
            username: 'Andrew',
            password: 'peepeepoopoo!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: user does not exist', async () => {
        const payload = {
            username: 'smellyfart',
            password: 'peepeepoopoo'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: blank username', async () => {
        const payload = {
            username: '',
            password: 'peepeepoopoo!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: blank password', async () => {
        const payload = {
            username: 'Andrew',
            password: ''
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no username', async () => {
        const payload = {
            password: 'peepeepoopoo!'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no password', async () => {
        const payload = {
            username: 'Andrew'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: empty body', async () => {
        const payload = {};
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no body', async () => {
        const response = await request(app).post('/player/login')
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});