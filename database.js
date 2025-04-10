const mongoose = require('mongoose');

const Game = require('./Game');

const mongodbCreds = require('./mongodb-credentials.json');
const mongoDBURL = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/matching-game?retryWrites=true&w=majority&appName=Matching-Game`;

exports.connect = () => {
    mongoose.connect(mongoDBURL);
}

exports.insertGame = async (player, difficulty, hasWon, points, totalPoints, time) => {
    const savedGameData = {
        game: {},
        didError: false
    };
    
    const game = new Game({
        player,
        difficulty,
        hasWon,
        points,
        totalPoints,
        date: new Date().toJSON(),
        time
    });

    try{
        savedGameData.game = await game.save();
    }catch(error){
        console.log(error);
        didError = true
    }

    return savedGameData;
};

exports.getGameInfo = async (gameId) => {
    const gameData = {
        game: {},
        stats: [],
        didError: false
    };

    try{
        gameData.game = await Game.findById(gameId);
    }catch(error){
        console.log(error);
        gameData.didError = true;
    }

    return gameData;
};

exports.getRecentGames = async () => {
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

    return recentGamesData;
};

exports.getGames = async (player, winLoss, diff, sortBy, page) => {
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

    return gamesData;
};