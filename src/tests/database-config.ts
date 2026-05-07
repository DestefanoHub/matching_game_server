import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { Player } from '../models/Player.js';

export async function initDBConn(){
    mongoose.connect(process.env.MONGO_URL as string);
}

export async function closeDBConn(){
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
}

type TestPlayer = {
    name: string,
    password: string,
    salt?: string,
    deletedAt?: Date
}

export async function initPlayers(){
    const players: TestPlayer[] = [
        {name: 'tester1', password: 'password1234'},
        {name: 'tester2', password: 'password1234', deletedAt: new Date(new Date().getTime() - (10 * 60 * 1000))}
    ];

    for(const player of players){
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password1234', salt);

        player.password = hash;
        player.salt = salt;
    }

    await Player.insertMany(players);
}

export async function destroyPlayers(){
    await mongoose.connection.dropCollection('players');
}