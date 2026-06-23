import { describe, test, before, after } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { initGames, destroyGames } from '../database-config.js';
import { Game } from '../../models/Game.js';
import { Player } from '../../models/Player.js';
import GameGateway from '../../gateways/game.js';

chaiUse(chaiAsPromised);

after(async () => {
    await destroyGames();
});

describe('Game Gateway Insert operations', () => {    
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('game insert successful', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        const game = await GameGateway.insertGame(player!.id, 1, true, 6, 6, 30);

        expect(game).to.have.property('_id');
        expect(game).to.have.property('player');
        expect(game.player).to.have.property('pid');
        expect(game.player.pid).to.not.be.null;
        expect(game.player).to.have.property('username');
        expect(game.player.username).to.not.be.null;
        expect(game.player).to.have.property('uniqueName');
        expect(game.player.uniqueName).to.not.be.null;
        expect(game).to.have.property('date');
        expect(game.date).to.not.be.null;
        expect(game).to.have.property('difficulty');
        expect(game.difficulty).to.equal(1);
        expect(game).to.have.property('hasWon');
        expect(game.hasWon).to.equal(true);
        expect(game).to.have.property('points');
        expect(game.points).to.equal(6);
        expect(game).to.have.property('totalPoints');
        expect(game.totalPoints).to.equal(6);
        expect(game).to.have.property('time');
        expect(game.time).to.equal(30);
    });

    test('game insert failed: incorrect difficulty value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 5, true, 6, 6, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect difficulty value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 'abc', true, 6, 6, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect hasWon value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, 'abc', 6, 6, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect points value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 100, 6, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect points value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 'abc', 6, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect totalPoints value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 100, 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect totalPoints value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 'abc', 30)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect time value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, -100)).to.be.rejectedWith();
    });

    test('game insert failed: incorrect time value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, 'abc')).to.be.rejectedWith();
    });
});