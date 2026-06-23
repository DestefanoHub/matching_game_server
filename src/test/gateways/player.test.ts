import { describe, test, before, after } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { initPlayers, destroyPlayers } from '../database-config.js';
import { Player } from '../../models/Player.js';
import PlayerGateway from '../../gateways/player.js';

chaiUse(chaiAsPromised);

after(async () => {
    await destroyPlayers();
});

describe('Player Gateway Insert Player operations', () => {
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player insert successful', async () => {
        const player = await PlayerGateway.insertPlayer('Tester3', 'password1234');

        expect(player).to.have.property('_id');
        expect(player).to.have.property('name');
        expect(player).to.have.property('uniqueName');
        expect(player.uniqueName).to.equal('tester3');
        expect(player).to.have.property('password');
        expect(player).to.have.property('salt');
        expect(player).to.have.property('deletedAt');
        expect(player.deletedAt).to.be.null;
    });

    test('player insert failed: blank username', async () => {
        await expect(PlayerGateway.insertPlayer('', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: blank password', async () => {
        await expect(PlayerGateway.insertPlayer('Tester3', '')).to.be.rejectedWith(/400/);
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
        await expect(PlayerGateway.insertPlayer('Tester1', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: duplicate username in different case', async () => {
        await expect(PlayerGateway.insertPlayer('TeStEr1', 'password1234')).to.be.rejectedWith(/400/);
    });

    test('player insert failed: duplicate username of deleted user', async () => {
        await expect(PlayerGateway.insertPlayer('Tester2', 'password1234')).to.be.rejectedWith(/400/);
    });
});

describe('Player Gateway Get Player By ID operations', () => {
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player retrieval successful', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester1'}).exec();
        const player = await PlayerGateway.getPlayerByID(dbPlayer!.id);

        expect(player._id.toString()).to.equal(dbPlayer!.id);
        expect(player.name).to.equal(dbPlayer!.name);
        expect(player).to.have.property('password');
        expect(player.password).to.equal(dbPlayer!.password);
        expect(player).to.have.property('salt');
        expect(player.salt).to.equal(dbPlayer!.salt);
        expect(player).to.have.property('deletedAt');
        expect(player.deletedAt).to.be.null;
    });

    test('player retrieval failed: player has been deleted', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester2'}).exec();
        
        await expect(PlayerGateway.getPlayerByID(dbPlayer!.id)).to.be.rejectedWith(/404/);
    });

    test('player retrieval failed: id does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.getPlayerByID('abcd1234abcd1234abcd1234')).to.be.rejectedWith(/404/);
    });

    test('player retrieval failed: id does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.getPlayerByID('abcd1234')).to.be.rejectedWith(/400/);
    });

    test('player retrieval failed: blank id', async () => {        
        await expect(PlayerGateway.getPlayerByID('')).to.be.rejectedWith(/400/);
    });
});

describe('Player Gateway Check Username Exists operations', () => {
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player username does not exist (success)', async () => {
        const uNameCount = await PlayerGateway.checkUsernameExists('fakeusername');

        expect(uNameCount).to.equal(0);
    });

    test('player username exists (fail): username matches case', async () => {
        const uNameCount = await PlayerGateway.checkUsernameExists('Tester1');

        expect(uNameCount).to.equal(1);
    });

    test('player username exists (fail): username in different case', async () => {
        const uNameCount = await PlayerGateway.checkUsernameExists('TeStEr1');

        expect(uNameCount).to.equal(1);
    });

    test('player username exists (fail): username matches case and user deleted', async () => {
        const uNameCount = await PlayerGateway.checkUsernameExists('Tester2');

        expect(uNameCount).to.equal(1);
    });

    test('player username exists (fail): username in different case and user deleted', async () => {
        const uNameCount = await PlayerGateway.checkUsernameExists('TeStEr2');

        expect(uNameCount).to.equal(1);
    });

    test('player username blank (fail)', async () => {
        await expect(PlayerGateway.checkUsernameExists('')).to.be.rejectedWith(/400/);
    });
});

describe('Player Gateway Check Passwords Match operations', () => {
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player passwords do not match (success): different passwords', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester1'}).exec();
        const pWordMatch = await PlayerGateway.checkPasswordsMatch(dbPlayer!.id, 'mynewpassword');

        expect(pWordMatch).to.be.false;
    });

    test('player passwords do not match (success): passwords same but different case', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester1'}).exec();
        const pWordMatch = await PlayerGateway.checkPasswordsMatch(dbPlayer!.id, 'PaSsWoRd1234');

        expect(pWordMatch).to.be.false;
    });

    test('player passwords match (fail): passwords same case', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester1'}).exec();
        const pWordMatch = await PlayerGateway.checkPasswordsMatch(dbPlayer!.id, 'password1234');

        expect(pWordMatch).to.be.true;
    });

    test('player id does not exist (fail)', async () => {
        await expect(PlayerGateway.checkPasswordsMatch('abcd1234', 'password1234')).to.be.rejectedWith(/404/);
    });

    test('player id blank (fail)', async () => {
        await expect(PlayerGateway.checkPasswordsMatch('', 'password1234')).to.be.rejectedWith(/404/);
    });
});

describe('Player Gateway Delete Player operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player deletion successful', async () => {
        const playerToDelete = await PlayerGateway.insertPlayer('Tester3', 'password1234');

        expect(playerToDelete).to.have.property('deletedAt');
        expect(playerToDelete.deletedAt).to.be.null;

        await PlayerGateway.deletePlayer(playerToDelete._id.toString());

        const deletedPlayer = await Player.findOne({_id: playerToDelete._id}).exec();

        expect(deletedPlayer).to.have.property('deletedAt');
        expect(deletedPlayer!.deletedAt).to.not.be.null;
    });

    test('player deletion failed: player already deleted', async () => {
        const deletedPlayer = await Player.findOne({name: 'Tester2'}).exec();

        await expect(PlayerGateway.deletePlayer(deletedPlayer!.id)).to.be.rejectedWith(/404/);

        const playerAfterDeletion = await Player.findOne({_id: deletedPlayer!.id}).exec();

        expect(playerAfterDeletion!.deletedAt?.toString()).to.equal(deletedPlayer?.deletedAt?.toString());
    });

    test('player deletion failed: id does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.deletePlayer('abcd1234abcd1234abcd1234')).to.be.rejectedWith(/404/);
    });

    test('player deletion failed: id does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.deletePlayer('abcd1234')).to.be.rejectedWith(/400/);
    });

    test('player deletion failed: blank id', async () => {        
        await expect(PlayerGateway.deletePlayer('')).to.be.rejectedWith(/400/);
    });
});

describe('Player Gateway Change Password operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });

    test('player change password successful', async () => {
        const playerToChange = await PlayerGateway.insertPlayer('Tester3', 'password1234');

        await PlayerGateway.changePassword(playerToChange._id.toString(), 'password5678');

        const changedPlayer = await Player.findOne({_id: playerToChange._id}).exec();

        expect(changedPlayer!.password).to.not.equal(playerToChange.password);
        expect(changedPlayer!.salt).to.not.equal(playerToChange.salt);
    });

    test('player change password failed: player deleted', async () => {
        const deletedPlayer = await Player.findOne({name: 'Tester2'}).exec();

        await expect(PlayerGateway.changePassword(deletedPlayer!.id, 'password5678')).to.be.rejectedWith(/404/);

        const playerAfterChange = await Player.findOne({_id: deletedPlayer!.id}).exec();

        expect(playerAfterChange?.password).to.equal(deletedPlayer?.password);
        expect(playerAfterChange?.salt).to.equal(deletedPlayer?.salt);
    });

    test('player change password failed: id does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.changePassword('abcd1234abcd1234abcd1234', 'password5678')).to.be.rejectedWith(/404/);
    });

    test('player change password failed: id does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(PlayerGateway.changePassword('abcd1234', 'password5678')).to.be.rejectedWith(/400/);
    });

    test('player change password failed: blank id', async () => {        
        await expect(PlayerGateway.changePassword('', 'password5678')).to.be.rejectedWith(/400/);
    });

    test('player change password failed: blank password', async () => {        
        const player = await Player.findOne({name: 'Tester3'}).exec();
        
        await expect(PlayerGateway.changePassword(player!.id, '')).to.be.rejectedWith(/400/);
    });

    test('player change password failed: blank id and password', async () => {        
        await expect(PlayerGateway.changePassword('', '')).to.be.rejectedWith(/400/);
    });
});

describe('Player Gateway Login operations', () => {    
    before(async () => {
        await initPlayers();
    });

    after(async () => {
        await destroyPlayers();
    });
    
    test('player login successful', async () => {
        const username = 'Tester1';
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

    test('login successful: incorrect username, correct password', async () => {        
        await expect(PlayerGateway.login('peepeepoopoo', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player login failed: incorrect username wrong case, correct password', async () => {
        await expect(PlayerGateway.login('TeStEr1', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player login failed: correct username, incorrect password wrong case', async () => {        
        await expect(PlayerGateway.login('Tester1', 'PaSsWoRd1234')).to.be.rejectedWith(/401/);
    });

    test('player login failed: correct username, incorrect password', async () => {
        await expect(PlayerGateway.login('Tester1', 'wrongpassword')).to.be.rejectedWith(/401/);
    });

    test('player login failed: user does not exist', async () => {
        await expect(PlayerGateway.login('smellyfart', 'peepeepoopoo')).to.be.rejectedWith(/401/);
    });

    test('player login failed: blank username', async () => {
        await expect(PlayerGateway.login('', 'password1234')).to.be.rejectedWith(/401/);
    });

    test('player login failed: blank password', async () => {
        await expect(PlayerGateway.login('Tester1', '')).to.be.rejectedWith(/401/);
    });

    test('player login failed: blank username and password', async () => {
        await expect(PlayerGateway.login('', '')).to.be.rejectedWith(/401/);
    });

    test('player login failed: account has deletedAt set', async () => {
        await expect(PlayerGateway.login('Tester2', 'password1234')).to.be.rejectedWith(/401/);
    });
});