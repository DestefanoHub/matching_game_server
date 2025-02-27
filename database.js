const firebase = require('firebase/app');
const firestore = require('firebase/firestore');

const firebaseConfig = require('./firebaseConfig.json');

const app = firebase.initializeApp(firebaseConfig);
const database = firestore.getFirestore(app);

exports.insertGame = async (game) => {
    try{
        const docRef = await firestore.addDoc(firestore.collection(database, 'games'), {
            player: game.player,
            difficulty: game.difficulty,
            hasWon: game.hasWon,
            points: game.points,
            totalPoints: game.totalPoints,
            time: game.time,
            date: game.date
        });
        console.log(docRef);
    }catch (e){
        console.log(e);
    }
};

exports.getRecentGames = async () => {
    const gamesArray = [];
    const gamesQuery = firestore.query(firestore.collection(database, 'games'), firestore.orderBy('date', 'desc'), firestore.limit(5));
    const games = await firestore.getDocs(gamesQuery);
    games.forEach((game) => {
        gamesArray.push(game.data());
    });
    return gamesArray;
};

exports.getGames = async (player, winLoss, diff, sort, page) => {
    const gamesArray = [];
    const recordsPerPage = 10;
    let gamesQuery = firestore.collection(database, 'games');
    
    //optional player search
    if(player !== null){
        gamesQuery = firestore.query(gamesQuery, firestore.where('player', '==', player));
    }

    //required win/loss filter
    switch(winLoss){
        case 'w': {
            gamesQuery = firestore.query(gamesQuery, firestore.where('hasWon', '==', true));
            break;
        }
        case 'l': {
            gamesQuery = firestore.query(gamesQuery, firestore.where('hasWon', '==', false));
            break;
        }
        case 'a':
        default:
            break;
    }

    //required difficulty filter
    if(diff !== 0){
        gamesQuery = firestore.query(gamesQuery, firestore.where('difficulty', '==', diff));
    }

    //required sort and order
    switch(sort){
        case 'sd': {
            gamesQuery = firestore.query(gamesQuery, firestore.orderBy('points', 'desc'));
            break;
        }
        case 'sa': {
            gamesQuery = firestore.query(gamesQuery, firestore.orderBy('points', 'asc'));
            break;
        }
        case 'da': {
            gamesQuery = firestore.query(gamesQuery, firestore.orderBy('date', 'asc'));
            break;
        }
        case 'dd':
        default: {
            gamesQuery = firestore.query(gamesQuery, firestore.orderBy('date', 'desc'));
            break;
        }
    }

    //get total number of filtered games
    const totalGamesQuery = await firestore.getCountFromServer(gamesQuery);
    const totalGames = totalGamesQuery.data().count;

    //pagination - ten records per page
    if(page === 1){
        gamesQuery = firestore.query(gamesQuery, firestore.limit(recordsPerPage));
    }else{
        const previousRecords = (page * recordsPerPage) - recordsPerPage;
        gamesQuery = firestore.query(gamesQuery, firestore.limit(previousRecords));
        const pageSetup = await firestore.getDocs(gamesQuery);
        const lastRecord = pageSetup.docs[pageSetup.docs.length - 1];
        gamesQuery = firestore.query(gamesQuery, firestore.startAfter(lastRecord), firestore.limit(recordsPerPage));
    }
    
    const games = await firestore.getDocs(gamesQuery);
    games.forEach((game) => {
        gamesArray.push(game.data());
    });

    return {
        games: gamesArray,
        totalGames: totalGames
    };
};