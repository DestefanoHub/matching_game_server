import mongoose from 'mongoose';

import type { Game as GameType, GamePlayer } from '../types.js';

const Schema = mongoose.Schema;

const gamePlayerSchema = new Schema<GamePlayer>({
    id: String,
    username: String
});

const gameSchema = new Schema<GameType>({
    player: {
        type: gamePlayerSchema,
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

interface GameModel extends mongoose.Model<GameType>{};

export default mongoose.model<GameType, GameModel>('Game', gameSchema);