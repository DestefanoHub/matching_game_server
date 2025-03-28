// const { Int32 } = require('mongodb');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const gameSchema = new Schema({
    player: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true
    },
    hasWon: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    totalPoints: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
});

// class Game{
//     #_id;
//     #player;
//     #date;
//     #difficulty;
//     #hasWon;
//     #points;
//     #totalPoints;
//     #time;
    
//     constructor(nPlayer, nDiff, nWon, nPoints, nTotalPoints, nTime, nDate = new Date().toJSON(), nId = null) {
//         this.player = nPlayer;
//         this.difficulty = nDiff;
//         this.hasWon = nWon;
//         this.points = nPoints;
//         this.totalPoints = nTotalPoints;
//         this.time = nTime;

//         this.date = nDate;
//         this._id = nId;
//     }

//     getId() {
//         return (this._id === null) ? null : this._id;
//     }

//     getIdAsBSON() {
//         return (this._id === null) ? null : new ObjectId(nId);
//     }

//     getPlayer() {
//         return this.player;
//     }

//     getDate() {
//         return this.date;
//     }

//     getDifficulty() {
//         return this.difficulty;
//     }

//     getHasWon() {
//         return this.hasWon;
//     }

//     getPoints() {
//         return this.points;
//     }

//     getTotalPoints() {
//         return this.totalPoints;
//     }

//     getTime() {
//         return this.time;
//     }
// };

module.exports = mongoose.model('Game', gameSchema);