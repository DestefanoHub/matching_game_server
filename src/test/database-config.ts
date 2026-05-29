import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

import { Player } from '../models/Player.js';
import { Game } from '../models/Game.js';
import type { Difficulty, GamePlayer } from '../types.js';

type TestPlayer = {
    name: string,
    password: string,
    salt?: string,
    deletedAt?: Date
};

type TestGame = {
    date: Date,
    player: GamePlayer,
    difficulty: Difficulty,
    hasWon: boolean,
    points: number,
    totalPoints: number,
    time: number
};

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

export async function initGames(){
    const players: TestPlayer[] = [
        {name: 'tester100', password: 'password1234'},
        {name: 'tester200', password: 'password1234', deletedAt: new Date(new Date().getTime() - (10 * 60 * 1000))}
    ];

    for(const player of players){
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password1234', salt);

        player.password = hash;
        player.salt = salt;
    }

    await Player.insertMany(players);
    
    const player1 = await Player.findOne({name: 'tester100'}).exec();
    const player2 = await Player.findOne({name: 'tester200'}).exec();
    
    const games: TestGame[] = [
        {
            date: new Date(2026, 0, 1, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 1,
            hasWon: true,
            points: 6,
            totalPoints: 6,
            time: 20
        },
        {
            date: new Date(2026, 0, 2, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 2,
            hasWon: true,
            points: 9,
            totalPoints: 9,
            time: 35
        },
        {
            date: new Date(2026, 0, 3, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 3,
            hasWon: true,
            points: 12,
            totalPoints: 12,
            time: 50
        },
        {
            date: new Date(2026, 0, 4, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 1,
            hasWon: false,
            points: 5,
            totalPoints: 6,
            time: 60
        },
        {
            date: new Date(2026, 0, 5, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 2,
            hasWon: false,
            points: 7,
            totalPoints: 9,
            time: 60
        },
        {
            date: new Date(2026, 0, 6, 0, 0, 0),
            player: {pid: player1!.id, username: player1!.name},
            difficulty: 3,
            hasWon: false,
            points: 10,
            totalPoints: 12,
            time: 60
        },
        {
            date: new Date(2026, 0, 1, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 1,
            hasWon: true,
            points: 6,
            totalPoints: 6,
            time: 24
        },
        {
            date: new Date(2026, 0, 2, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 2,
            hasWon: true,
            points: 9,
            totalPoints: 9,
            time: 42
        },
        {
            date: new Date(2026, 0, 3, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 3,
            hasWon: true,
            points: 12,
            totalPoints: 12,
            time: 58
        },
        {
            date: new Date(2026, 0, 4, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 1,
            hasWon: false,
            points: 5,
            totalPoints: 6,
            time: 60
        },
        {
            date: new Date(2026, 0, 5, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 2,
            hasWon: false,
            points: 7,
            totalPoints: 9,
            time: 60
        },
        {
            date: new Date(2026, 0, 6, 1, 0, 0),
            player: {pid: player2!.id, username: player2!.name},
            difficulty: 3,
            hasWon: false,
            points: 10,
            totalPoints: 12,
            time: 60
        }
    ];

    await Game.insertMany(games);
}

export async function destroyGames(){
    await destroyPlayers();
    await mongoose.connection.dropCollection('games');
}