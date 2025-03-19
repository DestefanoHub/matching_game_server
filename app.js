const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const database = require('./database');
const { Game } = require('./Game');

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

app.get('/getGames', async (req, res) => {
    const player = (req.query.player.length) ? req.query.player : null;
    const winLoss = req.query.winLoss;
    const diff = (req.query.diff.length) ? +req.query.diff : 0;
    const sortBy = req.query.sortBy;
    const page = (req.query.page) ? +req.query.page : 1;

    const gamesData = await database.getGames(player, winLoss, diff, sortBy, page);
    let status = 200;

    if(!gamesData.totalGames){
        status = 204;
    }

    if(gamesData.didError){
        status = 500;
    }

    res.status(status).json(gamesData);
});

app.get('/getRecentGames', async (req, res) => {
    const recentGamesData = await database.getRecentGames();
    let status = 200;

    if(!recentGamesData.recentGames.length){
        status = 204;
    }

    if(recentGamesData.didError){
        status = 500;
    }

    res.status(status).json(recentGamesData.recentGames);
});

app.options('/saveGame');
app.post('/saveGame', async (req, res) => {
    const game = new Game(
        req.body.player,
        req.body.difficulty,
        req.body.hasWon,
        req.body.points,
        req.body.totalPoints,
        req.body.time
    );
    let status = 201;

    const didInsert = await database.insertGame(game);

    if(!didInsert){
        status = 500;
    }

    res.status(status).send();
});

app.listen(port);