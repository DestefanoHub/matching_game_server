const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const database = require('./database');

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

app.get('/getGameInfo/:gameId', async (req, res) => {
    let status = 200;
    const gameId = req.params.gameId;
    const gameData = await database.getGameInfo(gameId);

    if(!Object.keys(gameData.game).length){
        status = 404;
    }

    if(gameData.didError){
        status = 500;
    }

    res.status(status).json(gameData);
});

app.get('/getGames', async (req, res) => {
    let status = 200;
    const player = (req.query.player.length) ? req.query.player : null;
    const winLoss = req.query.winLoss;
    const diff = (req.query.diff.length) ? +req.query.diff : 0;
    const sortBy = req.query.sortBy;
    const page = (req.query.page) ? +req.query.page : 1;

    const gamesData = await database.getGames(player, winLoss, diff, sortBy, page);
    
    if(!gamesData.totalGames){
        status = 204;
    }

    if(gamesData.didError){
        status = 500;
    }

    res.status(status).json(gamesData);
});

app.get('/getRecentGames', async (req, res) => {
    let status = 200;
    const recentGamesData = await database.getRecentGames();

    if(!recentGamesData.games.length){
        status = 204;
    }

    if(recentGamesData.didError){
        status = 500;
    }

    res.status(status).json(recentGamesData.games);
});

app.options('/saveGame');
app.post('/saveGame', async (req, res) => {    
    let status = 201;
    const player = req.body.player;
    const difficulty = req.body.difficulty;
    const hasWon = req.body.hasWon;
    const points = req.body.points;
    const totalPoints = req.body.totalPoints;
    const time = req.body.time;

    const savedGameData = await database.insertGame(player, difficulty, hasWon, points, totalPoints, time);

    if(savedGameData.didError){
        status = 500;
    }

    res.status(status).json(savedGameData.game); 
});

try{
    database.connect();
    app.listen(port);
}catch(error){
    console.log(error);
}