import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import { initPlayers, destroyPlayers } from '../../database-config.js';
import { Player } from '../../models/Player.js';
import PlayerGateway from '../../gateways/player.js';

beforeAll(async () => {
    await initPlayers();
});

afterAll(async () => {
    await destroyPlayers();
});

describe('Gateway Login operations', () => {    
    test('player has successfully logged in', async () => {
        const username = 'tester1';
        const password = 'password1234';

        const dbPlayer = await Player.findOne({name: username}).exec();
        
        const player = await PlayerGateway.login(username, password);

        expect(player._id).toBe(dbPlayer!.id);
        expect(player.name).toBe(dbPlayer!.name);
        expect(Object.hasOwn(player, 'password')).toBeTruthy();
        expect(player.password).toBe(dbPlayer!.password);
        expect(Object.hasOwn(player, 'salt')).toBeTruthy();
        expect(player.salt).toBe(dbPlayer!.salt);
        expect(Object.hasOwn(player, 'deletedAt')).toBeTruthy();
        expect(player.deletedAt).toBeNull();
    });

    test('player has failed logged in: incorrect username, correct password', async () => {
        const username = 'peepeepoopoo';
        const password = 'wrongpassword';
        
        expect(async () => {await PlayerGateway.login(username, password)}).toThrow(/401/);
    });

    test('player has failed logged in: incorrect username wrong case, correct password', async () => {
        const username = 'TeStEr1';
        const password = 'wrongpassword';
        
        expect(async () => {await PlayerGateway.login(username, password)}).toThrow(/401/);
    });

    test('player has failed logged in: correct username, incorrect password wrong case', async () => {
        const username = 'tester1';
        const password = 'WrOnGpAsSwOrD';
        
        expect(async () => {await PlayerGateway.login(username, password)}).toThrow(/401/);
    });
/*
    test('player has failed logged in: correct username, incorrect password', async () => {
        const payload = {
            username: 'tester1',
            password: 'wrongpassword'
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: user does not exist', async () => {
        const payload = {
            username: 'smellyfart',
            password: 'peepeepoopoo'
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: blank username', async () => {
        const payload = {
            username: '',
            password: 'password1234'
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: blank password', async () => {
        const payload = {
            username: 'tester1',
            password: ''
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no username', async () => {
        const payload = {
            password: 'password1234'
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no password', async () => {
        const payload = {
            username: 'tester1'
        };
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: empty body', async () => {
        const payload = {};
        
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });

    test('player has failed logged in: no body', async () => {
        const player = await PlayerGateway.login(username, password);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({});
    });
    */
});