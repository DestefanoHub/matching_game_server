import { Types, type HydratedDocument } from 'mongoose';

import { Game } from '../models/Game.js';
import PlayerGateway from './player.js';
import type { Game as GameType, Difficulty, SearchDifficulty, SortBy, WinLoss } from '../types.js';

type SortParams = {
    sort: {
        date?: 1|-1,
        points?: 1|-1
    }
};

type WhereParams = {
    'player.uniqueName'?: string,
    hasWon?: boolean,
    difficulty?: SearchDifficulty
};

type PlayerStats = {
    isFirstGame: boolean,
    isFirstWin: boolean,
    isFirstDiffGame: boolean,
    isFirstDiffWin: boolean,
    isFastestDiffTime: boolean
};

type GameData = {
    game: GameType | Record<PropertyKey, never>,
    stats: PlayerStats
};

type MultiGamesData = {
    games: GameType[],
    totalGames: number
};

export default abstract class GameGateway {    
    /*
    * As this is the gateway, this method does not handle business logic. Therefore, this method does not attempt to
    * enforce any constraints/conditions on the data provided to it, outside of the database erroring due to a constraint
    * violation. If this method is to be called, the caller is responsible for ensuring the validity of the data passed to it.
    * 
    * This does not verify the following conditions:
    *  - that the player is a valid, active player
    *  - if hasWon = true:
    *   * time < 60
    *   * points = totalPoints
    *  - if hasWon = false:
    *   * time = 60
    *   * points < totalPoints
    *  - if difficulty = 1 totalPoints = 6
    *  - if difficulty = 2 totalPoints = 9
    *  - if difficulty = 3 totalPoints = 12 
    */
    public static async insertGame(playerID: string, difficulty: Difficulty, hasWon: boolean, points: number, totalPoints: number, time: number): Promise<GameType> {
        try{
            const gamePlayerData = await PlayerGateway.getPlayerByID(playerID);
            const player = {
                pid: gamePlayerData._id,
                username: gamePlayerData.name,
                uniqueName: gamePlayerData.uniqueName
            };

            const game: HydratedDocument<GameType> = new Game({
                player,
                difficulty,
                hasWon,
                points,
                totalPoints,
                time
            });

            return await game.save();
        }catch(error){
            throw new Error("400", {cause: error});
        }    
    }

    public static async getGameInfo(id: string | Types.ObjectId): Promise<GameData> {
        try{
            const gameData: GameData = {
                game: {},
                stats: {
                    isFirstGame: false,
                    isFirstWin: false,
                    isFirstDiffGame: false,
                    isFirstDiffWin: false,
                    isFastestDiffTime: false
                }
            };
            const gameRecord = await Game.findById(id).lean<GameType>().exec();

            if(gameRecord === null){
                throw new Error('404', {cause: `Game with ID: ${id} does not exist.`});
            }

            gameData.game = gameRecord;

            const isFirstGame = await Game.find({
                'player.pid': gameData.game.player.pid,
                date: {$lt: gameData.game.date}
            }).countDocuments().exec();
            gameData.stats.isFirstGame = (!isFirstGame) ? true : false;

            const isFirstDiffGame = await Game.find({
                'player.pid': gameData.game.player.pid,
                date: {$lt: gameData.game.date},
                difficulty: gameData.game.difficulty
            }).countDocuments().exec();
            gameData.stats.isFirstDiffGame = (!isFirstDiffGame) ? true : false;

            if(gameData.game.hasWon){
                const isFirstWin = await Game.find({
                    'player.pid': gameData.game.player.pid,
                    date: {$lt: gameData.game.date},
                    hasWon: true
                }).countDocuments().exec();
                gameData.stats.isFirstWin = (!isFirstWin) ? true : false;

                const isFirstDiffWin = await Game.find({
                    'player.pid': gameData.game.player.pid,
                    date: {$lt: gameData.game.date},
                    difficulty: gameData.game.difficulty,
                    hasWon: true
                }).countDocuments().exec();
                gameData.stats.isFirstDiffWin = (!isFirstDiffWin) ? true : false;

                const isFastestDiffTime = await Game.find({
                    'player.pid': gameData.game.player.pid,
                    difficulty: gameData.game.difficulty,
                    hasWon: true,
                    time: {$lt: gameData.game.time}
                }).countDocuments().exec();
                gameData.stats.isFastestDiffTime = (!isFastestDiffTime) ? true : false;
            }

            return gameData;
        }catch(error){
            if(error instanceof Error && error.message === '404'){
                throw error;
            }

            throw new Error("404", {cause: error});
        }
    }

    public static async getRecentGames(playerID: string | null): Promise<GameType[][]> {        
        try{
            const recentGames: GameType[][] = [];
            const allRecentGames = await Game.find({}, {
                player: 1,
                hasWon: 1,
                difficulty: 1,
                date: 1
            }).sort({date: -1})
            .limit(5)
            .lean<GameType[]>()
            .exec();

            recentGames[0] = allRecentGames;

            if(playerID !== null){
                const playerRecentGames = await Game.find({
                    'player.pid': playerID
                },
                {
                    player: 1,
                    hasWon: 1,
                    difficulty: 1,
                    date: 1
                }).sort({date: -1})
                .limit(5)
                .lean<GameType[]>()
                .exec();

                recentGames[1] = playerRecentGames;
            }

            return recentGames;
        }catch(error){
            throw new Error("400", {cause: error});
        }
    }

    public static async getGames(playerName: string|null, winLoss: WinLoss, diff: SearchDifficulty, sortBy: SortBy, page: number): Promise<MultiGamesData> {    
        const gamesData: MultiGamesData = {
            games: [],
            totalGames: 0
        };
        const recordsPerPage = 10;
        let whereParams: WhereParams = {};
        const sortParams: SortParams = {sort: {}};

        //optional player search
        if(playerName !== null){
            whereParams = {'player.uniqueName': playerName.toLowerCase()};
        }

        //required win/loss filter
        switch(winLoss){
            case 'w': {
                whereParams.hasWon = true;
                break;
            }
            case 'l': {
                whereParams.hasWon = false;
                break;
            }
            case 'a':
            default:
                break;
        }

        //required difficulty filter
        if(diff !== 0){
            whereParams.difficulty = diff;
        }

        //required sort and order
        switch(sortBy){
            case 'sa': {
                sortParams.sort = {'points': 1, 'date': -1};
                break;
            }
            case 'sd': {
                sortParams.sort = {'points': -1, 'date': -1};
                break;
            }
            case 'da': {
                sortParams.sort = {'date': 1};
                break;
            }
            case 'dd':
            default: {
                sortParams.sort = {'date': -1};
                break;
            }
        }

        try{
            const gamesCursor = await Game.aggregate([
                {
                    $match: whereParams,
                },
                {
                    $project: {
                        player: 1,
                        hasWon: 1,
                        difficulty: 1,
                        date: 1
                    }
                },
                {
                    $sort: sortParams.sort,
                },
                {
                    $facet: {
                        count: [{ $count: 'totalCount' }],
                        games: [{ $skip: (page * recordsPerPage) - recordsPerPage }, { $limit: recordsPerPage }],
                    },
                },
            ]);

            for await(const queryData of gamesCursor) {
                //Need to check if the array is empty becuase this assignment errors if the query returns no results.
                if(queryData.count.length){
                    gamesData.totalGames = queryData.count[0].totalCount;
                }
                
                gamesData.games = queryData.games;
            }
        }catch(error){
            throw new Error("404", {cause: error});
        }

        return gamesData;
    }
}