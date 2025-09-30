import mongoose, { Types } from 'mongoose';

import Game from './Game.js';
import type { Game as GameType, Difficulty, SortBy, WinLoss } from './types.js';

import mongodbCreds from '../mongodb-credentials.json' with {type: 'json'};
const mongoDBURL = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/matching-game?retryWrites=true&w=majority&appName=Matching-Game`;

type SortParams = {
    sort: {
        date?: 1|-1,
        points?: 1|-1
    }
};

type WhereParams = {
    player?: string,
    hasWon?: boolean,
    difficulty?: Difficulty
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

export function connect() {
    mongoose.connect(mongoDBURL);
}

export async function insertGame(player: string, difficulty: Difficulty, hasWon: boolean, points: number, totalPoints: number, time: number): Promise<GameType> {
    const game = new Game({
        player,
        difficulty,
        hasWon,
        points,
        totalPoints,
        time
    });

    try{
        return await game.save();
    }catch(error){
        throw new Error("400", {cause: error});
    }    
};

export async function getGameInfo(gameId: string | Types.ObjectId): Promise<GameData> {
    const gameData: GameData = {
        game: {},
        stats: {
            isFirstGame: false,
            isFirstWin: false,
            isFirstDiffGame: false,
            isFirstDiffWin: false,
            isFastestDiffTime: false
        },
    };

    try{
        gameData.game = await Game.findById(gameId).lean<GameType>().exec() as GameType;

        const isFirstGame = await Game.find({
            player: gameData.game.player,
            date: {$lt: gameData.game.date}
        }).countDocuments().exec();
        gameData.stats.isFirstGame = (!isFirstGame) ? true : false;

        const isFirstDiffGame = await Game.find({
            player: gameData.game.player,
            date: {$lt: gameData.game.date},
            difficulty: gameData.game.difficulty
        }).countDocuments().exec();
        gameData.stats.isFirstDiffGame = (!isFirstDiffGame) ? true : false;

        if(gameData.game.hasWon){
            const isFirstWin = await Game.find({
                player: gameData.game.player,
                date: {$lt: gameData.game.date},
                hasWon: true
            }).countDocuments().exec();
            gameData.stats.isFirstWin = (!isFirstWin) ? true : false;

            const isFirstDiffWin = await Game.find({
                player: gameData.game.player,
                date: {$lt: gameData.game.date},
                difficulty: gameData.game.difficulty,
                hasWon: true
            }).countDocuments().exec();
            gameData.stats.isFirstDiffWin = (!isFirstDiffWin) ? true : false;

            const isFastestDiffTime = await Game.find({
                player: gameData.game.player,
                // date: {$lt: gameData.game.date},
                difficulty: gameData.game.difficulty,
                hasWon: true,
                time: {$lt: gameData.game.time}
            }).countDocuments().exec();
            gameData.stats.isFastestDiffTime = (!isFastestDiffTime) ? true : false;
        }
    }catch(error){
        throw new Error("404", {cause: error});
    }

    return gameData;
};

export async function getRecentGames(): Promise<[GameType?]> {
    try{
        return await Game.find({}, {
            player: 1,
            hasWon: 1,
            difficulty: 1,
            date: 1
        }).sort({date: -1})
        .limit(5)
        .lean<[GameType?]>()
        .exec();
    }catch(error){
        throw new Error("404", {cause: error});
    }
};

export async function getGames(player: string|null, winLoss: WinLoss, diff: Difficulty, sortBy: SortBy, page: number): Promise<MultiGamesData> {    
    const gamesData: MultiGamesData = {
        games: [],
        totalGames: 0
    };
    const recordsPerPage = 10;
    const whereParams: WhereParams = {};
    let sortParams: SortParams = {sort: {}};

    //optional player search
    if(player !== null){
        whereParams.player = player;
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
            //This assignment errors if the query returns no results, the array will be empty.
            if(queryData.count.length){
                gamesData.totalGames = queryData.count[0].totalCount;
            }
            
            gamesData.games = queryData.games;
        }
    }catch(error){
        throw new Error("404", {cause: error});
    }

    return gamesData;
};