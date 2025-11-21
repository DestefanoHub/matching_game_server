import express from 'express';

import GameGateway  from '../gateways/game.js';
import { checkAuthorization } from '../auth.js';
import { type Difficulty, type WinLoss, type SortBy, isSortByType, isWinLossType, isDifficultyType, type GamePlayer } from '../types.js';

const router = express.Router();

router.get('/getGameInfo/:gameID', async (req, res, next) => {
    let gameData;
    const gameID = req.params.gameID;

    if(!gameID){
        throw new Error('400', {cause: 'No game ID provided.'});
    }

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
    let gamesData;
    const player = (typeof req.query.player === 'string' && req.query.player.length) ? req.query.player : null;
    const winLoss: WinLoss = (isWinLossType(req.query.winLoss)) ? req.query.winLoss : 'a';
    const diff: Difficulty = (req.query.diff && isDifficultyType(+req.query.diff)) ? +req.query.diff as Difficulty : 0;
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

router.get('/getRecentGames', async (req, res, next) => {
    let status = 200;
    let recentGames;

    try{
        recentGames = await GameGateway.getRecentGames();

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
    let savedGame = {};
    const player: GamePlayer = req.body.player;
    const difficulty: Difficulty = req.body.difficulty;
    const hasWon: boolean = req.body.hasWon;
    const points: number = req.body.points;
    const totalPoints: number = req.body.totalPoints;
    const time: number = req.body.time;

    try{
        const recentGame = await GameGateway.insertGame(player, difficulty, hasWon, points, totalPoints, time);
        // savedGame = await GameGateway.getGameInfo(recentGame._id);

        res.status(201).json();
    }catch(error){
        next(error);
    }     
});

export default router;