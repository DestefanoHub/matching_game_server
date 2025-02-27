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
    allowedHeaders: 'Content-Type',
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
        status = 404;
    }

    res.status(status).json(gamesData);
});

app.get('/getRecentGames', async (req, res) => {
    const recentGames = await database.getRecentGames();
    let status = 200;

    if(!recentGames.length){
        status = 404;
    }

    res.status(status).json(recentGames);
});

app.options('/saveGame');
app.post('/saveGame', async (req, res) => {
    console.log(req.body);
    res.send('Matching Game Server up and running!');
});

app.listen(port);