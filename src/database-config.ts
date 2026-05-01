import mongoose, { type HydratedDocument } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

import { Player } from './models/Player.js';
import type { Player as PlayerType } from './types.js';

let dbServer: MongoMemoryServer;

export async function initDBConn(){
    dbServer = await MongoMemoryServer.create();
    mongoose.connect(dbServer.getUri(), {dbName: 'matching-game-test'});
}

export async function closeDBConn(){
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
    await dbServer.stop();
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