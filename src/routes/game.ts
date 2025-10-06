import express from 'express';

import GameGateway  from '../gateways/games.js';
import { type Difficulty, type WinLoss, type SortBy, isSortByType, isWinLossType, isDifficultyType } from '../types.js';

const router = express.Router();

router.get('/getGameInfo/:gameId', async (req, res, next) => {
    let gameData;
    const gameId = req.params.gameId;

    if(!gameId){
        throw new Error('400', {cause: 'No game ID provided.'});
    }

    try{
        gameData = await GameGateway.getGameInfo(gameId);

        if(!Object.keys(gameData.game).length){
            throw new Error('404', {cause: 'Game not found.'});
        }
    }catch(error){
        return next(error);
    }

    res.status(200).json(gameData);
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
    }catch(error){
        return next(error);
    }

    res.status(status).json(gamesData);
});

router.get('/getRecentGames', async (req, res, next) => {
    let status = 200;
    let recentGames;

    try{
        recentGames = await GameGateway.getRecentGames();

        if(!recentGames.length){
            status = 204;
        }
    }catch(error){
        return next(error);
    }
    
    res.status(status).json(recentGames);
});

router.options('/saveGame');
router.post('/saveGame', async (req, res, next) => {    
    let savedGame = {};
    const player: string = req.body.player;
    const difficulty: Difficulty = req.body.difficulty;
    const hasWon: boolean = req.body.hasWon;
    const points: number = req.body.points;
    const totalPoints: number = req.body.totalPoints;
    const time: number = req.body.time;

    try{
        const recentGame = await GameGateway.insertGame(player, difficulty, hasWon, points, totalPoints, time);
        savedGame = await GameGateway.getGameInfo(recentGame._id);
    }catch(error){
        return next(error);
    }

    res.status(201).json(savedGame); 
});

export default router;