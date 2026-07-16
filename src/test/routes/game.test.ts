import { describe, test, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';

import app from '../../app.js';
import { initGames, destroyGames } from '../database-config.js';
import { Game } from '../../models/Game.js';
import { Player } from '../../models/Player.js';
import { generateToken } from '../../auth.js';
import GameGateway from '../../gateways/game.js';

const server = app.listen();
const agent = request.agent(server);

after(async () => {
    await destroyGames();
    server.close();
});

describe('Server Get Game Info operations', () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get game info successful', async () => {
        const dbGame = await Game.findOne({'player.username': 'Tester100'}).exec();
        
        const response = await agent.get(`/game/getGameInfo/${dbGame!.id}`)
            .set('Accept', 'application/json');

        const rBody = response.body;

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('object');
        expect(Object.keys(rBody).length).to.equal(2);
        expect(rBody).to.have.property('game');
        expect(rBody).to.have.property('stats');
        expect(rBody.game).to.be.an('object');
        expect(rBody.game).to.have.property('_id');
        expect(rBody.game._id).to.equal(dbGame!.id);
    });

    test('get game info failed: game ID does not exist', async () => {       
        const response = await agent.get('/game/getGameInfo/abcd1234')
            .set('Accept', 'application/json');

        expect(response.status).to.equal(404);
        expect(response.body).to.be.empty;
    });
});

describe('Server Get Games operations', () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get recent games successful: no player provided', async () => {
        const response = await agent.get('/game/getGames?winLoss=a&diff=0&sortBy=dd&page=1')
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('object');
        expect(Object.keys(rBody).length).to.equal(2);
        expect(rBody).to.have.property('games');
        expect(rBody).to.have.property('totalGames');
        expect(rBody.totalGames).to.equal(12);
        expect(rBody.games).to.be.an('array');
        expect(rBody.games).to.have.lengthOf(10);
    });

    test('get recent games successful: player param but no value', async () => {
        const response = await agent.get('/game/getGames?player=&winLoss=a&diff=0&sortBy=dd&page=1')
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('object');
        expect(Object.keys(rBody).length).to.equal(2);
        expect(rBody).to.have.property('games');
        expect(rBody).to.have.property('totalGames');
        expect(rBody.totalGames).to.equal(12);
        expect(rBody.games).to.be.an('array');
        expect(rBody.games).to.have.lengthOf(10);
    });

    test('get recent games successful: valid player', async () => {
        const response = await agent.get('/game/getGames?player=Tester100&winLoss=a&diff=0&sortBy=dd&page=1')
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('object');
        expect(Object.keys(rBody).length).to.equal(2);
        expect(rBody).to.have.property('games');
        expect(rBody).to.have.property('totalGames');
        expect(rBody.totalGames).to.equal(6);
        expect(rBody.games).to.be.an('array');
        expect(rBody.games).to.have.lengthOf(6);
    });

    test('get recent games successful: invalid player', async () => {
        const response = await agent.get('/game/getGames?player=abcd1234&winLoss=a&diff=0&sortBy=dd&page=1')
            .set('Accept', 'application/json');

        const rBody = response.body;
        expect(response.status).to.equal(204);
        expect(response.body).to.be.empty;
    });
});

describe('Server Get Recent Games operations', () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get recent games successful: no playerID', async () => {
        const response = await agent.get('/game/getRecentGames')
            .set('Accept', 'application/json');

        const rBody = response.body;

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody.length).to.equal(1);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0].length).to.equal(5);
    });

    test('get recent games successful: valid playerID', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester100'}).exec();
        
        const response = await agent.get(`/game/getRecentGames/${dbPlayer!.id}`)
            .set('Accept', 'application/json');

        const rBody = response.body;

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody.length).to.equal(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0].length).to.equal(5);
        expect(rBody[1]).to.be.an('array');
        expect(rBody[1].length).to.equal(5);
    });

    test('get recent games successful: valid playerID deleted player', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester200'}).exec();
        
        const response = await agent.get(`/game/getRecentGames/${dbPlayer!.id}`)
            .set('Accept', 'application/json');

        const rBody = response.body;

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody.length).to.equal(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0].length).to.equal(5);
        expect(rBody[1]).to.be.an('array');
        expect(rBody[1].length).to.equal(5);
    });

    test('get recent games successful: invalid playerID', async () => {        
        const response = await agent.get('/game/getRecentGames/abcd1234')
            .set('Accept', 'application/json');

        const rBody = response.body;

        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.match(/(application\/json)/);
        expect(rBody).to.be.an('array');
        expect(rBody.length).to.equal(2);
        expect(rBody[0]).to.be.an('array');
        expect(rBody[0].length).to.equal(5);
        expect(rBody[1]).to.be.an('array');
        expect(rBody[1].length).to.equal(0);
    });
});