import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

import jwtSecret from '../jwt-secret.json' with {type: 'json'};

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if(typeof authHeader === 'undefined'){
        return res.sendStatus(401);
    }

    const authToken = authHeader?.split(' ')[1];

    if(!authToken.length){
        return res.sendStatus(401);
    }

    try{
        const authorized = jwt.verify(authToken, jwtSecret.secret, {
            algorithms: ['HS512'],
            issuer: 'Matching Game Server',
            subject: 'Authorization token',
        });
    }catch(error){
        throw new Error("401", {cause: error});
    }
    
    req.JWT = authToken;
    next();
}

export function generateToken(playerID: Types.ObjectId, username: string): string{
    return jwt.sign({ID: playerID, username: username}, jwtSecret.secret, {
        algorithm: 'HS512',
        issuer: 'Matching Game Server',
        subject: 'Authorization token',
        expiresIn: '24h'
    });
}