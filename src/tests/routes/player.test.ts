import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';

import app from '../../app.js';
import { initPlayers, destroyPlayers } from '../database-config.js';
import { Player } from '../../models/Player.js';

beforeAll(async () => {
    await initPlayers();
});

afterAll(async () => {
    await destroyPlayers();
});

describe('Login operations', () => {    
    test('player has successfully logged in', async () => {
        const payload = {
            username: 'tester1',
            password: 'password1234'
        };

        const dbPlayer = await Player.findOne({name: payload.username}).exec();
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/(application\/json)/);
        expect(Object.hasOwn(response.body, 'ID')).toBeTruthy();
        expect(response.body.ID).toBe(dbPlayer!.id);
        expect(Object.hasOwn(response.body, 'username')).toBeTruthy();
        expect(response.body.username).toBe('tester1');
        expect(Object.hasOwn(response.body, 'JWT')).toBeTruthy();
    });

    test('player has failed logged in: incorrect username, correct password', async () => {
        const payload = {
            username: 'peepeepoopoo',
            password: 'wrongpassword'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: incorrect username wrong case, correct password', async () => {
        const payload = {
            username: 'TeStEr1',
            password: 'wrongpassword'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: correct username, incorrect password wrong case', async () => {
        const payload = {
            username: 'tester1',
            password: 'WrOnGpAsSwOrD'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: correct username, incorrect password', async () => {
        const payload = {
            username: 'tester1',
            password: 'wrongpassword'
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
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: blank password', async () => {
        const payload = {
            username: 'tester1',
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
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no password', async () => {
        const payload = {
            username: 'tester1'
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