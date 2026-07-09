import { describe, test, before, after } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { initGames, destroyGames } from '../database-config.js';
import { Game } from '../../models/Game.js';
import { Player } from '../../models/Player.js';
import GameGateway from '../../gateways/game.js';
import type { Game as GameType } from '../../types.js';

chaiUse(chaiAsPromised);

type GameCondition = {
    player?: string,
    date?: 'asc' | 'desc',
    score?: 'asc' | 'desc'
};

function checkGamesMatchCondition(games: GameType[], condition: GameCondition): boolean {
    let result = false;
    
    if(typeof condition.player !== 'undefined'){
        result = games.every((game, index) => {
            if(game.player.pid !== condition.player){
                return false;
            }

            return true;
        });
    }

    if(typeof condition.date !== 'undefined'){
        result = games.every((game, index) => {
            if(index < games.length - 1){
                const nextGame = games[index+1];
                
                if(typeof game.date !== 'undefined' && typeof nextGame.date !== 'undefined'){
                    if(condition.date === 'desc' && game.date < nextGame.date){
                        return false;
                    }else if(condition.date === 'asc' && game.date > nextGame.date){
                        return false;
                    }
                }
            }

            return true;
        });
    }

    if(typeof condition.score !== 'undefined'){
        result = games.every((game, index) => {
            if(index < games.length - 1){
                const nextGame = games[index+1];
                
                if(condition.score === 'desc' && game.points < nextGame.points){
                    return false;
                }else if(condition.score === 'asc' && game.points > nextGame.points){
                    return false;
                }
            }

            return true;
        });
    }

    return result;
}

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
        await expect(GameGateway.insertGame(player!.id, 5, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 'abc', true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, null, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, undefined, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, 'abc', 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, null, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, undefined, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 100, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 'abc', 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, null, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, undefined, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 100, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 'abc', 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, null, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, undefined, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, -100)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, 'abc')).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, null)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, undefined)).to.be.rejectedWith(/400/);
    });
});

describe('Game Gateway Get Game Info operations', () => {    
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get game info successful', async () => {
        const testDate = new Date(2026, 0, 1, 0, 0, 0);
        const dbPlayer = await Player.findOne({name: 'Tester100'}).exec();
        const dbGame = await Game.findOne({'player.pid': dbPlayer!.id, date: testDate}).exec();
        const gameData = await GameGateway.getGameInfo(dbGame!._id);

        expect(gameData).to.be.an('object');
        expect(gameData).to.have.property('game');
        expect(gameData).to.have.property('stats');

        expect(gameData.game).to.have.property('_id');
        expect(gameData.game._id.toString()).to.equal(dbGame!.id);

        expect(gameData.game).to.have.property('player');
        expect(gameData.game.player).to.be.an('object');
        expect(gameData.game.player).to.have.property('pid');
        expect(gameData.game.player.pid).to.equal(dbPlayer!.id);
        expect(gameData.game.player).to.have.property('username');
        expect(gameData.game.player.username).to.equal(dbPlayer!.name);
        expect(gameData.game.player).to.have.property('uniqueName');
        expect(gameData.game.player.uniqueName).to.equal(dbPlayer!.uniqueName);

        expect(gameData.game).to.have.property('date');
        expect(gameData.game.date!.toString()).to.equal(testDate.toString());
        expect(gameData.game).to.have.property('difficulty');
        expect(gameData.game.difficulty).to.equal(1);
        expect(gameData.game).to.have.property('hasWon');
        expect(gameData.game.hasWon).to.equal(true);
        expect(gameData.game).to.have.property('points');
        expect(gameData.game.points).to.equal(6);
        expect(gameData.game).to.have.property('totalPoints');
        expect(gameData.game.totalPoints).to.equal(6);
        expect(gameData.game).to.have.property('time');
        expect(gameData.game.time).to.equal(20);

        expect(gameData.stats).to.be.an('object');
        expect(gameData.stats).to.have.property('isFirstGame');
        expect(gameData.stats.isFirstGame).to.be.true;
        expect(gameData.stats).to.have.property('isFirstWin');
        expect(gameData.stats.isFirstWin).to.be.true;
        expect(gameData.stats).to.have.property('isFirstDiffGame');
        expect(gameData.stats.isFirstDiffGame).to.be.true;
        expect(gameData.stats).to.have.property('isFirstDiffWin');
        expect(gameData.stats.isFirstDiffWin).to.be.true;
        expect(gameData.stats).to.have.property('isFastestDiffTime');
        expect(gameData.stats.isFastestDiffTime).to.be.true;
    });

    test('get game info failed: id does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.getGameInfo('abcd1234abcd1234abcd1234')).to.be.rejectedWith(/404/);
    });

    test('get game info failed: id does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.getGameInfo('abcd1234')).to.be.rejectedWith(/404/);
    });

    test('get game info failed: blank id', async () => {        
        await expect(GameGateway.getGameInfo('')).to.be.rejectedWith(/404/);
    });

    test('get game info failed: null id', async () => {        
        //@ts-expect-error
        await expect(GameGateway.getGameInfo(null)).to.be.rejectedWith(/404/);
    });

    test('get game info failed: undefined id', async () => {        
        //@ts-expect-error
        await expect(GameGateway.getGameInfo(undefined)).to.be.rejectedWith(/404/);
    });
});

describe('Game Gateway Get Recent Games operations', async () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get recent games successful: null playerID', async () => {
        const recentGames = await GameGateway.getRecentGames(null);

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(1);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        const gamesInOrder = checkGamesMatchCondition(recentGames[0], {date: 'desc'});
        expect(gamesInOrder).to.be.true;
    });

    test('get recent games successful: playerID given', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester100'}).exec();
        const recentGames = await GameGateway.getRecentGames(dbPlayer!.id);

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(2);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        const gamesInOrder = checkGamesMatchCondition(recentGames[0], {date: 'desc'});
        expect(gamesInOrder).to.be.true;

        expect(recentGames[1]).to.be.an('array');
        expect(recentGames[1]).to.have.lengthOf(5);

        const playerGamesInOrder = checkGamesMatchCondition(recentGames[1], {date: 'desc'});
        expect(playerGamesInOrder).to.be.true;
        const onlyPlayerGames = checkGamesMatchCondition(recentGames[1], {player: dbPlayer!.id});
        expect(onlyPlayerGames).to.be.true;
    });

    test('get recent games failed: playerID does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.getRecentGames('abcd1234abcd1234abcd1234')).to.be.rejectedWith(/404/);
    });

    test('get recent games failed: playerID does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.getRecentGames('abcd1234')).to.be.rejectedWith(/404/);
    });

    test('get recent games failed: blank playerID', async () => {        
        await expect(GameGateway.getRecentGames('')).to.be.rejectedWith(/404/);
    });

    test('get recent games failed: undefined playerID', async () => {        
        //@ts-expect-error
        await expect(GameGateway.getRecentGames(undefined)).to.be.rejectedWith(/404/);
    });
});

describe('Game Gateway Get Games operations', async () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get games sucessful: player null, winLoss all, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);

        const gamesInOrder = checkGamesMatchCondition(games.games, {date: 'desc'});
        expect(gamesInOrder).to.be.true;
    });
});