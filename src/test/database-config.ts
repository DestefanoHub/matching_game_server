import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

import { Player } from '../models/Player.js';

type TestPlayer = {
    name: string,
    password: string,
    salt?: string,
    deletedAt?: Date
}

let mongoServer: MongoMemoryServer;

export async function initDB(){
    mongoServer = await MongoMemoryServer.create({
        binary: {
            version: '7.1.1'
        }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}

export async function closeDB(){
    await mongoose.disconnect();
    await mongoServer.stop();
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