import mongoose from 'mongoose';
import express, { type Request, type Response, type NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
// import winston from 'winston';

import GameRouter from './routes/game.js';
import PlayerRouter from './routes/player.js';

import mongodbCreds from '../mongodb-credentials.json' with {type: 'json'};
const mongoDBURL = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/matching-game?retryWrites=true&w=majority&appName=Matching-Game`;

const app = express();
const port = 3100;

app.use(helmet({
    strictTransportSecurity: false,
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    preflightContinue: true
}));

app.use(bodyParser.json());

app.use('/game', GameRouter);
app.use('/player', PlayerRouter);

type serverError = {
    timestamp: Date,
    code: number,
    reason: string
};

// eslint-disable-next-line no-unused-vars
app.use(async (error: Error, req: Request, res: Response, next: NextFunction) => {
    const logFileName = new Date().toISOString().split('T')[0];
    const filePath = path.join(`${import.meta.dirname}/../logs/${logFileName}.txt`);
    // const logger = winston.createLogger({
    //     level: 'error',
    //     format: winston.format.combine(
    //         winston.format.errors({stack: true}),
    //         winston.format.timestamp(),
    //         winston.format.json()
    //     )
    // });
    let errorCode = 500;

    if(!Number.isNaN(error.message)){
        errorCode = +error.message;
    }

    const errorData: serverError = {
        timestamp: new Date(),
        code: errorCode,
        reason: (error.cause instanceof Error) ? error.cause.toString() : error.cause as string
    };

    try{
        await fs.appendFile(filePath, `${JSON.stringify(errorData)}${os.EOL}`, 'utf8');
    }catch(error){
        console.log('Failed to write error to log file');
        console.log(error);
    }

    res.status(errorCode).end();
});

try{
    mongoose.connect(mongoDBURL);
    app.listen(port);
}catch(error){
    console.log(error);
}