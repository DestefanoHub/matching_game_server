import { describe, test, before, beforeEach, after, afterEach } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { initPlayers, destroyPlayers } from '../database-config.js';
import { Player } from '../../models/Player.js';
import PlayerGateway from '../../gateways/player.js';

chaiUse(chaiAsPromised);

describe('Gateway Insert Player operations', () => {
    beforeEach(async () => {
        await initPlayers();
    });

    afterEach(async () => {
        await destroyPlayers();
    });

    test('successfully inserted player', async () => {
        const player = await PlayerGateway.insertPlayer('tester3', 'password1234');

        expect(player).to.have.property('_id');
        expect(player).to.have.property('name');
        expect(player).to.have.property('password');
        expect(player).to.have.property('salt');
        expect(player).to.have.property('deletedAt');
        expect(player.deletedAt).to.be.null;
    });

    test('player insert failed: blank username', async () => {
        await expect(PlayerGateway.insertPlayer('', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: blank password', async () => {
        await expect(PlayerGateway.insertPlayer('tester3', '')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: blank username and password', async () => {
        await expect(PlayerGateway.insertPlayer('', '')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: username too short', async () => {
        await expect(PlayerGateway.insertPlayer('test', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: username too long', async () => {
        await expect(PlayerGateway.insertPlayer('testertestertestertestertester3', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: duplicate username', async () => {
        await expect(PlayerGateway.insertPlayer('tester1', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: duplicate username of deleted user', async () => {
        await expect(PlayerGateway.insertPlayer('tester2', 'password1234')).to.be.rejectedWith(/400/);
    });
});

describe('Gateway Login operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });
    
    test('player has successfully login', async () => {
        const username = 'tester1';
        const password = 'password1234';

        const dbPlayer = await Player.findOne({name: username}).exec();
        const player = await PlayerGateway.login(username, password);

        expect(player._id.toString()).to.equal(dbPlayer!.id);
        expect(player.name).to.equal(dbPlayer!.name);
        expect(player).to.have.property('password');
        expect(player.password).to.equal(dbPlayer!.password);
        expect(player).to.have.property('salt');
        expect(player.salt).to.equal(dbPlayer!.salt);
        expect(player).to.have.property('deletedAt');
        expect(player.deletedAt).to.be.null;
    });

    test('player has failed login: incorrect username, correct password', async () => {        
        await expect(PlayerGateway.login('peepeepoopoo', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: incorrect username wrong case, correct password', async () => {
        await expect(PlayerGateway.login('TeStEr1', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: correct username, incorrect password wrong case', async () => {        
        await expect(PlayerGateway.login('tester1', 'PaSsWoRd1234')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: correct username, incorrect password', async () => {
        await expect(PlayerGateway.login('tester1', 'wrongpassword')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: user does not exist', async () => {
        await expect(PlayerGateway.login('smellyfart', 'peepeepoopoo')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: blank username', async () => {
        await expect(PlayerGateway.login('', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: blank password', async () => {
        await expect(PlayerGateway.login('tester1', '')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: blank username and password', async () => {
        await expect(PlayerGateway.login('', '')).to.be.rejectedWith(/401/);
    });

    test('player has failed login: account has deletedAt set', async () => {
        await expect(PlayerGateway.login('tester2', 'password1234')).to.be.rejectedWith(/401/);
    });
});