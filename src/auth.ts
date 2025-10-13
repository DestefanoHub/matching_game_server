import type { Request, Response, NextFunction } from 'express';

export default function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const authToken = authHeader?.split(' ')[1];

    if(!authToken){
        return res.sendStatus(401);
    }

    // req.user = authToken;
    next();
}