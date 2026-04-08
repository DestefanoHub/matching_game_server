import mongoose from 'mongoose';

import type { Player as PlayerType } from '../types.js';

const Schema = mongoose.Schema;
const playerSchema = new Schema<PlayerType>({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 5,
        maxlength: 30,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        required: false,
        default: null
    }
});

export const Player = mongoose.model<PlayerType>('Player', playerSchema);