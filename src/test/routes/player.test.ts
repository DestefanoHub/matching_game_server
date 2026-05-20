import { describe, test, before, beforeEach, after, afterEach } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import request from 'supertest';
// import chaiAsPromised from 'chai-as-promised';

import app from '../../app.js';
import { initPlayers, destroyPlayers } from '../database-config.js';
import { Player } from '../../models/Player.js';

// chaiUse(chaiAsPromised);

const server = app.listen();
const agent = request.agent(server);

after(() => {
    server.close();
})


describe('Server Insert Player operations', () => {
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player insert successful', async () => {
        const payload = {
            username: 'tester3',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(201);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(0);
        expect(rBody[1]).to.have.property('ID');
        expect(rBody[1]).to.have.property('username');
        expect(rBody[1]).to.have.property('JWT');
    });

    test('player insert failed: blank username', async () => {
        const payload = {
            username: '',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[1]).to.be.null;
    });

    
    test('player insert failed: no username', async () => {
        const payload = {
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: blank password', async () => {
        const payload = {
            username: 'tester4',
            password: '',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(2);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[0][1]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: no password', async () => {
        const payload = {
            username: 'tester4',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(2);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[0][1]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: blank confirm password', async () => {
        const payload = {
            username: 'tester4',
            password: 'password1234',
            confirmPassword: ''
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: no confirm password', async () => {
        const payload = {
            username: 'tester4',
            password: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: blank username and password', async () => {
        const payload = {
            username: '',
            password: '',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(3);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[0][1]).to.equal(3);
        expect(rBody[0][2]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: no username and password', async () => {
        const payload = {
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(3);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[0][1]).to.equal(3);
        expect(rBody[0][2]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: blank username and confirm password', async () => {
        const payload = {
            username: '',
            password: 'password1234',
            confirmPassword: ''
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(2);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[0][1]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: no username and confirm password', async () => {
        const payload = {
            password: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(2);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[0][1]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: blank password and confirm password', async () => {
        const payload = {
            username: 'tester4',
            password: '',
            confirmPassword: ''
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: no password and confirm password', async () => {
        const payload = {
            username: 'tester4'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(2);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[0][1]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: username too short', async () => {
        const payload = {
            username: 'test',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: username too long', async () => {
        const payload = {
            username: 'testertestertestertestertester4',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(1);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: password too short', async () => {
        const payload = {
            username: 'tester4',
            password: 'password',
            confirmPassword: 'password'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: password too long', async () => {
        const payload = {
            username: 'tester4',
            password: 'password1234password1234password1234',
            confirmPassword: 'password1234password1234password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(3);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: password and confirm password do not match', async () => {
        const payload = {
            username: 'tester4',
            password: 'password1234',
            confirmPassword: 'password12345678'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(4);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: duplicate username', async () => {
        const payload = {
            username: 'tester1',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(2);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: duplicate username different case', async () => {
        const payload = {
            username: 'TeStEr1',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(2);
        expect(rBody[1]).to.be.null;
    });

    test('player insert failed: duplicate username of deleted user', async () => {
        const payload = {
            username: 'tester2',
            password: 'password1234',
            confirmPassword: 'password1234'
        };
        
        const response = await agent.post('/player/createAccount')
            .send(payload)
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(400);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody).to.have.lengthOf(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0]).to.have.lengthOf(1);
        expect(rBody[0][0]).to.equal(2);
        expect(rBody[1]).to.be.null;
    });
});

describe('Server Login operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });
    
    test('player login successful', async () => {
        const payload = {
            username: 'tester1',
            password: 'password1234'
        };

        const dbPlayer = await Player.findOne({name: payload.username}).exec();
        
        const response = await agent.post('/player/login')
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

    test('player login failed: incorrect username, correct password', async () => {
        const payload = {
            username: 'peepeepoopoo',
            password: 'password1234'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: incorrect username wrong case, correct password', async () => {
        const payload = {
            username: 'TeStEr1',
            password: 'password1234'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: correct username, incorrect password wrong case', async () => {
        const payload = {
            username: 'tester1',
            password: 'PaSsWoRd1234'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: correct username, incorrect password', async () => {
        const payload = {
            username: 'tester1',
            password: 'wrongpassword'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: user does not exist', async () => {
        const payload = {
            username: 'smellyfart',
            password: 'peepeepoopoo'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: blank username', async () => {
        const payload = {
            username: '',
            password: 'password1234'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: blank password', async () => {
        const payload = {
            username: 'tester1',
            password: ''
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: blank username and password', async () => {
        const payload = {
            username: '',
            password: ''
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: no username', async () => {
        const payload = {
            password: 'password1234'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: no password', async () => {
        const payload = {
            username: 'tester1'
        };
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: empty body', async () => {
        const payload = {};
        
        const response = await agent.post('/player/login')
            .send(payload)
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });

    test('player login failed: no body', async () => {
        const response = await agent.post('/player/login')
            .set('Accept', 'application/json');

        expect(response.status).to.equal(401);
        expect(response.body).to.be.empty;
    });
});

//change password

//delete