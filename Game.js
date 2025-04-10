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

module.exports = mongoose.model('Game', gameSchema);