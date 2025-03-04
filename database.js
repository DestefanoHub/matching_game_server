const { MongoClient } = require('mongodb');

const mongodbCreds = require('./mongodb-credentials.json')

const uri = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/?retryWrites=true&w=majority&appName=Matching-Game`;
const client = new MongoClient(uri);

exports.insertGame = async (game) => {
    try{
        await client.connect();
        const database = client.db('matching-game');
        const conn = database.collection('games');
        const status = await conn.insertOne({
            player: game.player,
            difficulty: game.difficulty,
            hasWon: game.hasWon,
            points: game.points,
            totalPoints: game.totalPoints,
            time: game.time,
            date: game.date
        });
    }catch(error){
        console.log(error);
    }finally{
        await client.close();
    }
};

exports.getRecentGames = async () => {
    let recentGames = null;
    
    try{
        await client.connect();
        const database = client.db('matching-game');
        const conn = database.collection('games');
        recentGames = await conn.find({}).sort({date: -1}).limit(5).toArray();
    }catch(error){
        console.log(error);
    }finally{
        await client.close();
        return recentGames;
    }
};

exports.getGames = async (player, winLoss, diff, sort, page) => {
    const gamesData = {
        games: null,
        totalGames: 0
    };
    // const games = [];
    const recordsPerPage = 10;
    const whereParams = {};
    let sortParams = {};

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
            gamesData.totalGames = queryData.metadata[0].totalCount;
            gamesData.games = queryData.data;
        }
    }catch(error){
        console.log(error);
    }finally{
        await client.close();
        return gamesData;
    }
};