import mongoose from 'mongoose';

import type { Player } from '../types.js';

const Schema = mongoose.Schema;
const playerSchema = new Schema<Player>({
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

interface PlayerModel extends mongoose.Model<Player>{};

export default mongoose.model<Player, PlayerModel>('Player', playerSchema);