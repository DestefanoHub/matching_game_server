import mongoose from 'mongoose';
import { describe, test, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';

import app from '../../app.js';
import { initPlayers, destroyPlayers } from '../database-config.js';
import { Player } from '../../models/Player.js';
/*
before(async () => {
    await mongoose.connect(process.env.MONGO_URL as string);
});

after(async () => {
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
});

describe('Login operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });
    
    test('player has successfully logged in', async () => {
        const payload = {
            username: 'tester1',
            password: 'password1234'
        };

        const dbPlayer = await Player.findOne({name: payload.username}).exec();
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(201);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(Object.hasOwn(response.body, 'ID')).to.be.true;
        expect(response.body.ID).to.equal(dbPlayer!.id);
        expect(Object.hasOwn(response.body, 'username')).to.be.true;
        expect(response.body.username).to.equal('tester1');
        expect(Object.hasOwn(response.body, 'JWT')).to.be.true;
    });

    test('player has failed logged in: incorrect username, correct password', async () => {
        const payload = {
            username: 'peepeepoopoo',
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: incorrect username wrong case, correct password', async () => {
        const payload = {
            username: 'TeStEr1',
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: correct username, incorrect password wrong case', async () => {
        const payload = {
            username: 'tester1',
            password: 'PaSsWoRd1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: correct username, incorrect password', async () => {
        const payload = {
            username: 'tester1',
            password: 'wrongpassword'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: user does not exist', async () => {
        const payload = {
            username: 'smellyfart',
            password: 'peepeepoopoo'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: blank username', async () => {
        const payload = {
            username: '',
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: blank password', async () => {
        const payload = {
            username: 'tester1',
            password: ''
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: no username', async () => {
        const payload = {
            password: 'password1234'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: no password', async () => {
        const payload = {
            username: 'tester1'
        };
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: empty body', async () => {
        const payload = {};
        
        const response = await request(app).post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player has failed logged in: no body', async () => {
        const response = await request(app).post('/player/login')
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });
});
*/