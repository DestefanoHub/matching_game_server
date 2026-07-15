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
    win?: boolean,
    difficulty?: 1|2|3,
    date?: 'asc'|'desc',
    score?: 'asc'|'desc'
};

function checkGamesMatchCondition(games: GameType[], condition: GameCondition): boolean {
    let result = false;
    
    if(typeof condition.player !== 'undefined'){
        result = games.every((game) => {
            if(game.player.pid !== condition.player){
                return false;
            }

            return true;
        });
    }

    if(typeof condition.win !== 'undefined'){
        result = games.every((game) => {
            if(game.hasWon !== condition.win){
                return false;
            }

            return true;
        });
    }

    if(typeof condition.difficulty !== 'undefined'){
         result = games.every((game) => {
            if(game.difficulty !== condition.difficulty){
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

    test('game insert failed: player is deleted', async () => {
        const player = await Player.findOne({name: 'Tester200'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: playerID does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.insertGame('abcd1234abcd1234abcd1234', 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: playerID does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        await expect(GameGateway.insertGame('abcd1234', 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: blank playerID', async () => {        
        await expect(GameGateway.insertGame('', 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: null playerID', async () => {        
        //@ts-expect-error: playerID is null
        await expect(GameGateway.insertGame(null, 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: undefined playerID', async () => {        
        //@ts-expect-error: playerID is undefined
        await expect(GameGateway.insertGame(undefined, 1, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: difficulty value is not one of the allowed numbers
        await expect(GameGateway.insertGame(player!.id, 5, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: difficulty value is wrong type
        await expect(GameGateway.insertGame(player!.id, 'abc', true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: difficulty value is null
        await expect(GameGateway.insertGame(player!.id, null, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect difficulty value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: difficulty value is undefined
        await expect(GameGateway.insertGame(player!.id, undefined, true, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: hasWon is not a boolean
        await expect(GameGateway.insertGame(player!.id, 1, 'abc', 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: hasWon is null
        await expect(GameGateway.insertGame(player!.id, 1, null, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect hasWon value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: hasWon is undefined
        await expect(GameGateway.insertGame(player!.id, 1, undefined, 6, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 100, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: points is not a number
        await expect(GameGateway.insertGame(player!.id, 1, true, 'abc', 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: points is null
        await expect(GameGateway.insertGame(player!.id, 1, true, null, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect points value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: points is undefined
        await expect(GameGateway.insertGame(player!.id, 1, true, undefined, 6, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 100, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: totalPoints is not a number
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 'abc', 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: totalPoints is null
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, null, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect totalPoints value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: totalPoints is undefined
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, undefined, 30)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value out of range', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, -100)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value wrong type', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: time is not a number
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, 'abc')).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value null', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: time is null
        await expect(GameGateway.insertGame(player!.id, 1, true, 6, 6, null)).to.be.rejectedWith(/400/);
    });

    test('game insert failed: incorrect time value undefined', async () => {
        const player = await Player.findOne({name: 'Tester100'}).exec();
        //@ts-expect-error: time is undefined
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
        //@ts-expect-error: game ID is null
        await expect(GameGateway.getGameInfo(null)).to.be.rejectedWith(/404/);
    });

    test('get game info failed: undefined id', async () => {        
        //@ts-expect-error: game ID is undefined
        await expect(GameGateway.getGameInfo(undefined)).to.be.rejectedWith(/404/);
    });
});

describe('Game Gateway Get Recent Games operations', () => {
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

        expect(recentGames[0][0]).to.be.an('object');
        expect(Object.keys(recentGames[0][0]).length).to.equal(5);
        expect(recentGames[0][0]).to.have.property('_id');
        expect(recentGames[0][0]).to.have.property('player');
        expect(recentGames[0][0]).to.have.property('hasWon');
        expect(recentGames[0][0]).to.have.property('difficulty');
        expect(recentGames[0][0]).to.have.property('date');
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

        expect(recentGames[1][0]).to.be.an('object');
        expect(Object.keys(recentGames[1][0]).length).to.equal(5);
        expect(recentGames[1][0]).to.have.property('_id');
        expect(recentGames[1][0]).to.have.property('player');
        expect(recentGames[1][0]).to.have.property('hasWon');
        expect(recentGames[1][0]).to.have.property('difficulty');
        expect(recentGames[1][0]).to.have.property('date');
    });

    test('get recent games successful: playerID does not exist but is a valid ObjectId (24 hex characters)', async () => {        
        const recentGames = await GameGateway.getRecentGames('abcd1234abcd1234abcd1234');

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(2);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        expect(recentGames[1]).to.be.an('array');
        expect(recentGames[1]).to.have.lengthOf(0);
    });

    test('get recent games successful: playerID does not exist and is not valid ObjectId (24 hex characters)', async () => {        
        const recentGames = await GameGateway.getRecentGames('abcd1234');

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(2);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        expect(recentGames[1]).to.be.an('array');
        expect(recentGames[1]).to.have.lengthOf(0);
    });

    test('get recent games successful: blank playerID', async () => {        
        const recentGames = await GameGateway.getRecentGames('');

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(2);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        expect(recentGames[1]).to.be.an('array');
        expect(recentGames[1]).to.have.lengthOf(0);
    });

    test('get recent games failed: undefined playerID', async () => {        
        //@ts-expect-error: playerID is undefined
        const recentGames = await GameGateway.getRecentGames(undefined);

        expect(recentGames).to.be.an('array');
        expect(recentGames).to.have.lengthOf(2);
        expect(recentGames[0]).to.be.an('array');
        expect(recentGames[0]).to.have.lengthOf(5);

        expect(recentGames[1]).to.be.an('array');
        expect(recentGames[1]).to.have.lengthOf(0);
    });
});

describe('Game Gateway Get Games operations', () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    test('get games sucessful: player null, winLoss all, difficulty all, date descending, all pages', async () => {
        const games1 = await GameGateway.getGames(null, 'a', 0, 'dd', 1);

        expect(games1).to.be.an('object');
        expect(games1).to.have.property('games');
        expect(games1).to.have.property('totalGames');

        expect(games1.totalGames).to.equal(12);

        expect(games1.games).to.be.an('array');
        expect(games1.games).to.have.lengthOf(10);

        const games1InOrder = checkGamesMatchCondition(games1.games, {date: 'desc'});
        expect(games1InOrder).to.be.true;

        expect(games1.games[0]).to.be.an('object');
        expect(Object.keys(games1.games[0]).length).to.equal(5);
        expect(games1.games[0]).to.have.property('_id');
        expect(games1.games[0]).to.have.property('player');
        expect(games1.games[0]).to.have.property('hasWon');
        expect(games1.games[0]).to.have.property('difficulty');
        expect(games1.games[0]).to.have.property('date');

        const games2 = await GameGateway.getGames(null, 'a', 0, 'dd', 2);

        expect(games2).to.be.an('object');
        expect(games2).to.have.property('games');
        expect(games2).to.have.property('totalGames');

        expect(games2.totalGames).to.equal(12);

        expect(games2.games).to.be.an('array');
        expect(games2.games).to.have.lengthOf(2);

        const games2InOrder = checkGamesMatchCondition(games2.games, {date: 'desc'});
        expect(games2InOrder).to.be.true;
    });

    test('get games sucessful: player exists and is active, winLoss all, difficulty all, date descending, page 1', async () => {
        const dbPlayer = await Player.findOne({name: 'Tester100'}).exec();
        const games = await GameGateway.getGames('Tester100', 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(6);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(6);

        const gamesInOrder = checkGamesMatchCondition(games.games, {date: 'desc'});
        expect(gamesInOrder).to.be.true;
        const gamesBelongToPlayer = checkGamesMatchCondition(games.games, {player: dbPlayer!.id});
        expect(gamesBelongToPlayer).to.be.true;
    });

    test('get games sucessful: player exists and is active but name is wrong case, winLoss all, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames('TeStEr100', 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(6);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(6);
    });

    test('get games sucessful: player exists but is deleted, winLoss all, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames('Tester200', 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(6);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(6);
    });

    test('get games sucessful: player is blank, winLoss all, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames('', 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player is undefined, winLoss all, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: playerID is undefined
        const games = await GameGateway.getGames(undefined, 'a', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss win, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'w', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(6);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(6);

        const allGamesWon = checkGamesMatchCondition(games.games, {win: true});
        expect(allGamesWon).to.be.true;
    });

    test('get games sucessful: player null, winLoss loss, difficulty all, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'l', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(6);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(6);

        const allGamesLost = checkGamesMatchCondition(games.games, {win: false});
        expect(allGamesLost).to.be.true;
    });

    test('get games sucessful: player null, winLoss incorrect value, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: winLoss incorrect value
        const games = await GameGateway.getGames(null, 'abcd', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss wrong type, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: winLoss incorrect type
        const games = await GameGateway.getGames(null, 1234, 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss blank, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: winLoss empty string
        const games = await GameGateway.getGames(null, '', 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss null, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: winLoss null
        const games = await GameGateway.getGames(null, null, 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss undefined, difficulty all, date descending, page 1', async () => {
        //@ts-expect-error: winLoss undefined
        const games = await GameGateway.getGames(null, undefined, 0, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss all, difficulty easy, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 1, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(4);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(4);

        const allGamesEasy = checkGamesMatchCondition(games.games, {difficulty: 1});
        expect(allGamesEasy).to.be.true;
    });

    test('get games sucessful: player null, winLoss loss, difficulty normal, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 2, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(4);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(4);

        const allGamesNormal = checkGamesMatchCondition(games.games, {difficulty: 2});
        expect(allGamesNormal).to.be.true;
    });

    test('get games sucessful: player null, winLoss loss, difficulty hard, date descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 3, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(4);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(4);

        const allGamesHard = checkGamesMatchCondition(games.games, {difficulty: 3});
        expect(allGamesHard).to.be.true;
    });

    test('get games sucessful: player null, winLoss loss, difficulty incorrect value, date descending, page 1', async () => {
        //@ts-expect-error: difficulty not correct value
        const games = await GameGateway.getGames(null, 'a', 100, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(0);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(0);
    });

    test('get games sucessful: player null, winLoss loss, difficulty incorrect type, date descending, page 1', async () => {
        //@ts-expect-error: difficulty not a number
        const games = await GameGateway.getGames(null, 'a', 'abcd', 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(0);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(0);
    });

    test('get games sucessful: player null, winLoss loss, difficulty null, date descending, page 1', async () => {
        //@ts-expect-error: difficulty null
        const games = await GameGateway.getGames(null, 'a', null, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(0);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(0);
    });

    test('get games sucessful: player null, winLoss loss, difficulty undefined, date descending, page 1', async () => {
        //@ts-expect-error: difficulty undefined
        const games = await GameGateway.getGames(null, 'a', undefined, 'dd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(0);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(0);
    });

    test('get games sucessful: player null, winLoss all, difficulty all, date ascending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'da', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);

        const allGamesDateAsc = checkGamesMatchCondition(games.games, {date: 'asc'});
        expect(allGamesDateAsc).to.be.true;
    });

    test('get games sucessful: player null, winLoss all, difficulty all, score descending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'sd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);

        const allGamesScoreDesc = checkGamesMatchCondition(games.games, {score: 'desc'});
        expect(allGamesScoreDesc).to.be.true;
        const allGamesDateDesc = checkGamesMatchCondition(games.games, {date: 'desc'});
        expect(allGamesDateDesc).to.be.true;
    });

    test('get games sucessful: player null, winLoss all, difficulty all, score ascending, page 1', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'sa', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);

        const allGamesScoreAsc = checkGamesMatchCondition(games.games, {score: 'asc'});
        expect(allGamesScoreAsc).to.be.true;
        const allGamesDateDesc = checkGamesMatchCondition(games.games, {date: 'desc'});
        expect(allGamesDateDesc).to.be.true;
    });

    test('get games sucessful: player null, winLoss all, difficulty all, sort incorrect value, page 1', async () => {
        //@ts-expect-error: sort is incorrect value
        const games = await GameGateway.getGames(null, 'a', 0, 'abcd', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss all, difficulty all, sort incorrect type, page 1', async () => {
        //@ts-expect-error: sort is incorrect type
        const games = await GameGateway.getGames(null, 'a', 0, 1234, 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss all, difficulty all, sort blank, page 1', async () => {
        //@ts-expect-error: sort is empty string
        const games = await GameGateway.getGames(null, 'a', 0, '', 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss all, difficulty all, sort null, page 1', async () => {
        //@ts-expect-error: sort is null
        const games = await GameGateway.getGames(null, 'a', 0, null, 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games sucessful: player null, winLoss all, difficulty all, sort undefined, page 1', async () => {
        //@ts-expect-error: sort is undefined
        const games = await GameGateway.getGames(null, 'a', 0, undefined, 1);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games failed: page too high', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', 20);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(0);
    });

    test('get games failed: page too low', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', -6);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games failed: page is zero', async () => {
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', 0);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games failed: page wrong type', async () => {
        //@ts-expect-error: page is wrong type
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', 'abcd');

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games failed: page null', async () => {
        //@ts-expect-error: page is null
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', null);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });

    test('get games failed: page undefined', async () => {
        //@ts-expect-error: page is undefined
        const games = await GameGateway.getGames(null, 'a', 0, 'dd', undefined);

        expect(games).to.be.an('object');
        expect(games).to.have.property('games');
        expect(games).to.have.property('totalGames');

        expect(games.totalGames).to.equal(12);

        expect(games.games).to.be.an('array');
        expect(games.games).to.have.lengthOf(10);
    });
});