const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const gameSchema = new Schema({
    player: {
        type: String,
        trim: true,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    difficulty: {
        type: Number,
        enum: [1,2,3],
        required: true
    },
    hasWon: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number,
        min: 0,
        max: 12,
        required: true
    },
    totalPoints: {
        type: Number,
        enum: [6,9,12],
        required: true
    },
    time: {
        type: Number,
        min: 0,
        max: 60,
        required: true
    },
});

module.exports = mongoose.model('Game', gameSchema);