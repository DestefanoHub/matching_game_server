import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Types } from 'mongoose';

import jwtSecret from '../jwt-secret.json' with {type: 'json'};

export function checkAuthorization(req: Request, res: Response, next: NextFunction) {
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

        if(typeof authorized === 'object'){
            // @ts-expect-error
            req.token = authorized;
        }else{
            return res.sendStatus(401);
        }
    }catch(error){
        throw new Error("401", {cause: error});
    }finally{
        next();
    }
}

export function generateToken(playerID: Types.ObjectId, username: string): string{
    return jwt.sign({id: playerID, username}, jwtSecret.secret, {
        algorithm: 'HS512',
        issuer: 'Matching Game Server',
        subject: 'Authorization token',
        expiresIn: '24h'
    });
}

// function isJWT(value: unknown): value is JwtPayload{
//     return (typeof value == 'object' &&
//         value !== null &&
//         typeof value.exp == 'number' &&
//         typeof value.iat == 'number' &&
//         typeof value.ID == 'string' &&
//         typeof value.iss == 'string' &&
//         typeof value.sub == 'string' &&
//         typeof value.username == 'string'
//     );
// }