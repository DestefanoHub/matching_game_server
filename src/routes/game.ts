import express, { type Request } from 'express';

import GameGateway  from '../gateways/game.js';
import { checkAuthorization } from '../auth.js';
import { type Difficulty, type SearchDifficulty, type WinLoss, type SortBy, type GameData, isSortByType, isWinLossType, isSearchDifficultyType, type MultiGamesData, type Game, isDifficultyType } from '../types.js';

const router = express.Router();

router.get('/getGameInfo/:gameID', async (req, res, next) => {
    let gameData: GameData;
    const gameID = req.params.gameID;

    /*
    * This shouldn't ever be needed since Express throws a 404 by default if the required route 
    * parameter is missing.
    */
    // if(!gameID){
    //     throw new Error('400', {cause: 'No game ID provided.'});
    // }

    try{
        gameData = await GameGateway.getGameInfo(gameID);

        if(!Object.keys(gameData.game).length){
            throw new Error('404', {cause: 'Game not found.'});
        }

        res.status(200).json(gameData);
    }catch(error){
        next(error);
    }
});

router.get('/getGames', async (req, res, next) => {
    let status = 200;
    let gamesData: MultiGamesData;
    const player = (typeof req.query.player === 'string' && req.query.player.length) ? req.query.player : null;
    const winLoss: WinLoss = (isWinLossType(req.query.winLoss)) ? req.query.winLoss : 'a';
    const diff: SearchDifficulty = (req.query.diff && isSearchDifficultyType(+req.query.diff)) ? +req.query.diff as SearchDifficulty : 0;
    const sortBy: SortBy = (isSortByType(req.query.sortBy)) ? req.query.sortBy : 'dd';
    const page = (req.query.page) ? +req.query.page : 1;

    try{
        gamesData = await GameGateway.getGames(player, winLoss, diff, sortBy, page);

        if(!gamesData.totalGames){
            status = 204;
        }

        res.status(status).json(gamesData);
    }catch(error){
        next(error);
    }
});

type recentGamesParams = {
    playerID?: string
};

router.get('/getRecentGames/:playerID?', async (req: Request<recentGamesParams>, res, next) => {
    let status = 200;
    let recentGames: Game[][];
    const playerID = (req.params.playerID) ? req.params.playerID : null;

    try{
        recentGames = await GameGateway.getRecentGames(playerID);

        if(!recentGames.length){
            status = 204;
        }

        res.status(status).json(recentGames);
    }catch(error){
        next(error);
    }
});

router.options('/saveGame');
router.post('/saveGame', checkAuthorization, async (req, res, next) => {    
    const difficulty: Difficulty | null = (req.body.difficulty && isDifficultyType(+req.body.difficulty)) ? +req.body.difficulty as Difficulty : null;
    const hasWon: boolean | null = req.body.hasWon ?? null;
    const points: number | null = req.body.points ?? null;
    const totalPoints: number | null = req.body.totalPoints ?? null;
    const time: number | null = req.body.time ?? null;

    try{
        if(difficulty === null || hasWon === null || points === null || totalPoints === null || time === null){
            throw new Error('400', {cause: 'Missing Game fields.'});
        }

        await GameGateway.insertGame(req.token!.id, difficulty, hasWon, points, totalPoints, time);
        
        res.status(201).end();
    }catch(error){
        next(error);
    }     
});

export default router;