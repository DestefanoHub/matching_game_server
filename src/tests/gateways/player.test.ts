import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import { initDBConn, initPlayers, destroyPlayers, closeDBConn } from '../../database-config.js';
import { Player } from '../../models/Player.js';
import PlayerGateway from '../../gateways/player.js';

beforeAll(async () => {
    await initDBConn();
});

afterAll(async () => {
    await closeDBConn();
});

describe('Gateway Login operations', () => {    
    beforeAll(async () => {
        await initPlayers();
    });

    afterAll(async () => {
        await destroyPlayers();
    });
    
    test('player has successfully logged in', async () => {
        const username = 'tester1';
        const password = 'password1234';

        const dbPlayer = await Player.findOne({name: username}).exec();
        const player = await PlayerGateway.login(username, password);

        expect(player._id.toString()).toBe(dbPlayer!.id);
        expect(player.name).toBe(dbPlayer!.name);
        expect(Object.hasOwn(player, 'password')).toBeTruthy();
        expect(player.password).toBe(dbPlayer!.password);
        expect(Object.hasOwn(player, 'salt')).toBeTruthy();
        expect(player.salt).toBe(dbPlayer!.salt);
        expect(Object.hasOwn(player, 'deletedAt')).toBeTruthy();
        expect(player.deletedAt).toBeNull();
    });

    test('player has failed logged in: incorrect username, correct password', async () => {        
        await expect(PlayerGateway.login('peepeepoopoo', 'password1234')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: incorrect username wrong case, correct password', async () => {
        await expect(PlayerGateway.login('TeStEr1', 'password1234')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: correct username, incorrect password wrong case', async () => {        
        await expect(PlayerGateway.login('tester1', 'PaSsWoRd1234')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: correct username, incorrect password', async () => {
        await expect(PlayerGateway.login('tester1', 'wrongpassword')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: user does not exist', async () => {
        await expect(PlayerGateway.login('smellyfart', 'peepeepoopoo')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: blank username', async () => {
        await expect(PlayerGateway.login('', 'password1234')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: blank password', async () => {
        await expect(PlayerGateway.login('tester1', '')).rejects.toThrow(/401/);
    });

    test('player has failed logged in: blank username and password', async () => {
        await expect(PlayerGateway.login('', '')).rejects.toThrow(/401/);
    });
});