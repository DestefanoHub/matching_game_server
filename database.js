// const { MongoClient } = require('mongodb');


// const mongodbCreds = require('./mongodb-credentials.json');

// const uri = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/?retryWrites=true&w=majority&appName=Matching-Game`;
// const client = new MongoClient(uri);

exports.insertGame = async (game) => {
    let didError = false;
    
    try{
        await client.connect();
        const database = client.db('matching-game');
        const conn = database.collection('games');
        const result = await conn.insertOne(game);
        
        if(!result.acknowledged){
            didError = true;
        }
    }catch(error){
        didError = true;
        console.log(error);
    }finally{
        await client.close();

        return didError;
    }
};

exports.getRecentGames = async () => {
    const recentGamesData = {
        recentGames: [],
        didError: false
    }
    
    try{
        await client.connect();
        const database = client.db('matching-game');
        const conn = database.collection('games');
        const queryRecentGames = await conn.find().sort({date: -1}).limit(5).toArray();

        queryRecentGames.forEach((gameData) => {
            const game = new Game(
                gameData.player,
                gameData.difficulty,
                gameData.hasWon,
                gameData.points,
                gameData.totalPoints,
                gameData.time,
                gameData.date,
                gameData.id
            );

            recentGamesData.recentGames.push(game);
        });
    }catch(error){
        recentGamesData.didError = true;
        console.log(error);
    }finally{
        await client.close();
        return recentGamesData;
    }
};

exports.getGames = async (player, winLoss, diff, sort, page) => {
    const gamesData = {
        games: [],
        totalGames: 0,
        didError: false
    };
    const recordsPerPage = 10;
    const whereParams = {};
    let sortParams = {};
    let queryGames = [];

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
    switch(sort){
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
        await client.connect();
        const database = client.db('matching-game');
        const conn = database.collection('games');
        gamesCursor = await conn.aggregate([
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
            
            queryGames = queryData.data;
        }

        queryGames.forEach((gameData) => {
            const game = new Game(
                gameData.player,
                gameData.difficulty,
                gameData.hasWon,
                gameData.points,
                gameData.totalPoints,
                gameData.time,
                gameData.date,
                gameData._id
            );

            gamesData.games.push(game);
        });
    }catch(error){
        gamesData.didError = true;
        console.log(error);
    }finally{
        await client.close();
        return gamesData;
    }
};