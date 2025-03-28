const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

const database = require('./database');
const Game = require('./Game');

const mongodbCreds = require('./mongodb-credentials.json');
const mongoDBURL = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/matching-game?retryWrites=true&w=majority&appName=Matching-Game`;


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

    const gamesData = {
        games: [],
        totalGames: 0,
        didError: false
    };
    const recordsPerPage = 10;
    const whereParams = {};
    let sortParams = {};

    let status = 200;

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
            sortParams = {'points': 1, 'date': -1};
            break;
        }
        case 'sd': {
            sortParams = {'points': -1, 'date': -1};
            break;
        }
        case 'da': {
            sortParams = {'date': 1};
            break;
        }
        case 'dd':
        default: {
            sortParams = {'date': -1};
            break;
        }
    }

    try{
        gamesCursor = await Game.aggregate([
            {
                $match: whereParams,
            },
            {
                $sort: sortParams,
            },
            {
                $facet: {
                    metadata: [{ $count: 'totalCount' }],
                    data: [{ $skip: (page * recordsPerPage) - recordsPerPage }, { $limit: recordsPerPage }],
                },
            },
        ]);

        for await(const queryData of gamesCursor) {
            //This assignment errors if the query returns no results, the array will be empty.
            if(queryData.metadata.length){
                gamesData.totalGames = queryData.metadata[0].totalCount;
            }
            
            gamesData.games = queryData.data;
        }
    }catch(error){
        gamesData.didError = true;
        console.log(error);
    }

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
    const recentGamesData = {
        games: [],
        didError: false
    };

    try{
        recentGamesData.games = await Game.find().sort({date: -1}).limit(5);
    }catch(error){
        console.log(error);
        recentGames.didError = true;
    }

    if(!recentGamesData.games.length){
        status = 204;
    }

    if(recentGamesData.didError){
        status = 500;
    }

    res.status(status).json(recentGamesData);
});

app.options('/saveGame');
app.post('/saveGame', async (req, res) => {    
    const game = new Game({
        player: req.body.player,
        difficulty: req.body.difficulty,
        hasWon: req.body.hasWon,
        points: req.body.points,
        totalPoints: req.body.totalPoints,
        date: new Date().toJSON(),
        time: req.body.time
    });
    let status = 201;

    try{
        await game.save();
    }catch(error){
        console.log(error);
        status = 500;
    }
    
    res.status(status).send();
});

try{
    mongoose.connect(mongoDBURL);
    app.listen(port);
}catch(error){
    console.log(error);
}