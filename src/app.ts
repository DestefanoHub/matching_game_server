import mongoose from 'mongoose';
import express, { type Request, type Response, type NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';

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

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    let errorCode = 500;

    console.log(error.cause);

    if(!Number.isNaN(error.message)){
        errorCode = +error.message;
    }

    res.status(errorCode).end();
});

try{
    mongoose.connect(mongoDBURL);
    app.listen(port);
}catch(error){
    console.log(error);
}