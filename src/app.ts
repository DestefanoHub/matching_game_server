import express, { type Request, type Response, type NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';

import { connect, getGameInfo, getGames, getRecentGames, insertGame } from './database.js';
import { type Difficulty, type WinLoss, type SortBy, isSortBy, isWinLoss, isDifficulty } from './types.js';

const app = express();
const port = 3100;

app.use(helmet({
    strictTransportSecurity: false,
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Accept',
    preflightContinue: true
}));

app.use(bodyParser.json());

app.get('/getGameInfo/:gameId', async (req, res, next) => {
    let gameData;
    const gameId = req.params.gameId;

    if(!gameId){
        throw new Error('400', {cause: 'No game ID provided.'});
    }

    try{
        gameData = await getGameInfo(gameId);

        if(!Object.keys(gameData.game).length){
            throw new Error('404', {cause: 'Game not found.'});
        }
    }catch(error){
        return next(error);
    }

    res.status(200).json(gameData);
});

app.get('/getGames', async (req, res, next) => {
    let status = 200;
    let gamesData;
    const player = (typeof req.query.player === 'string' && req.query.player.length) ? req.query.player : null;
    const winLoss: WinLoss = (isWinLoss(req.query.winLoss)) ? req.query.winLoss : 'a';
    const diff: Difficulty = (isDifficulty(req.query.diff)) ? req.query.diff : 0;
    const sortBy: SortBy = (isSortBy(req.query.sortBy)) ? req.query.sortBy : 'dd';
    const page = (req.query.page) ? +req.query.page : 1;

    try{
        const gamesData = await getGames(player, winLoss, diff, sortBy, page);

        if(!gamesData.totalGames){
            status = 204;
        }
    }catch(error){
        return next(error);
    }

    res.status(status).json(gamesData);
});

app.get('/getRecentGames', async (req, res, next) => {
    let status = 200;
    let recentGames;

    try{
        recentGames = await getRecentGames();

        if(!recentGames.length){
            status = 204;
        }
    }catch(error){
        return next(error);
    }
    
    res.status(status).json(recentGames);
});

app.options('/saveGame');
app.post('/saveGame', async (req, res, next) => {    
    let savedGame;
    const player: string = req.body.player;
    const difficulty: Difficulty = req.body.difficulty;
    const hasWon: boolean = req.body.hasWon;
    const points: number = req.body.points;
    const totalPoints: number = req.body.totalPoints;
    const time: number = req.body.time;

    try{
        savedGame = await insertGame(player, difficulty, hasWon, points, totalPoints, time);
        // savedGameInfo = await getGameInfo(savedGameData.game._id!);
    }catch(error){
        return next(error);
    }

    res.status(201).json(savedGame); 
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(error.cause);
    res.status(+error.message).end();
});

try{
    connect();
    app.listen(port);
}catch(error){
    console.log(error);
}