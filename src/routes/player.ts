import express from 'express';

import PlayerGateway from '../gateways/player.js';
import { checkAuthorization, generateToken } from '../auth.js';
// import type { Player as PlayerType } from '../types.js';

const router = express.Router();

router.get('/getPlayer/:playerID', async (req, res, next) => {
    let playerData;
    const playerID = req.params.playerID;

    if(!playerID){
        throw new Error('400', {cause: 'No player ID provided.'});
    }

    try{
        playerData = await PlayerGateway.getPlayerByID(playerID);
        res.status(200).json(playerData);
    }catch(error){
        next(error);
    }
});

router.get('/checkUsername/:username', async (req, res, next) => {
    let status = 200;
    const username = req.params.username;

    if(!username){
        throw new Error('400', {cause: 'No player ID provided.'});
    }

    try{
        const exists = await PlayerGateway.checkUsernameExists(username);

        if(exists){
            status = 409;
        }

        res.status(status).end();
    }catch(error){
        next(error);
    }
});

// router.get('/searchPlayers/:player', async (req, res, next) => {
//     let status = 200;
//     let players: string[] = [];
//     const player = req.params.player;

//     if(!player){
//         throw new Error('400', {cause: 'No search term provided.'});
//     }

//     try{
//         players = await PlayerGateway.searchPlayers(player);

//         if(!players.length){
//             status = 404;
//         }

//         res.status(status).json(players);
//     }catch(error){
//         next(error);
//     }
// });

router.options('/createAccount');
router.post('/createAccount', async (req, res, next) => {
    let status = 201;
    let newPlayerCreds = null;
    const username: string = req.body.username;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;

    const usernameObj = {
        value: username,
        error: false,
        message: ''
    };
    const passwordObj = {
        value: password,
        error: false,
        message: ''
    };
    const confirmObj = {
        value: confirmPassword,
        error: false,
        message: ''
    };

    if(usernameObj.value.length < 5) {
        usernameObj.error = true;
        usernameObj.message = 'Username too short.';
    }else if(usernameObj.value.length > 30) {
        usernameObj.error = true;
        usernameObj.message = 'Username too long.';
    }

    try{
        const usernameExists = await PlayerGateway.checkUsernameExists(usernameObj.value);

        if(usernameExists){
            usernameObj.error = true;
            usernameObj.message = 'Username unavailable.';
        }

        if(passwordObj.value.length < 12) {
            passwordObj.error = true;
            passwordObj.message = 'Password too short.';
        }else if(passwordObj.value.length > 30) {
            passwordObj.error = true;
            passwordObj.message = 'Password too long.';
        }
        
        if(confirmObj.value !== passwordObj.value) {
            confirmObj.error = true;
            confirmObj.message = 'Password does not match.';
        }

        if(usernameObj.error || passwordObj.error || confirmObj.error){
            status = 400;
        }else{
            const newPlayer = await PlayerGateway.insertPlayer(usernameObj.value, passwordObj.value);
            const token = generateToken(newPlayer._id, newPlayer.name);
            newPlayerCreds = {
                ID: newPlayer._id,
                username: newPlayer.name,
                JWT: token
            };
        }

        res.status(status).json([
            {
                usernameObj,
                passwordObj,
                confirmObj
            },
            newPlayerCreds
        ]);
    }catch(error){
        next(error);
    }
});

router.options('/login');
router.post('/login', async (req, res, next) => {
    let status = 201;
    let userCreds = null;
    const username: string = req.body.username;
    const password: string = req.body.password;
    
    try{
        const userData = await PlayerGateway.login(username, password);
        const token = generateToken(userData._id, userData.name);
        userCreds = {
            ID: userData._id,
            username: userData.name,
            JWT: token
        };

        res.status(status).json(userCreds);
    }catch(error){
        next(error);
    }
});

router.options('/changePassword');
router.patch('/changePassword', checkAuthorization, async (req, res, next) => {
    let status = 200;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;

    const passwordObj = {
        value: password,
        error: false,
        message: ''
    };
    const confirmObj = {
        value: confirmPassword,
        error: false,
        message: ''
    };

    if(passwordObj.value.length < 12) {
        passwordObj.error = true;
        passwordObj.message = 'Password too short.';
    }else if(passwordObj.value.length > 30) {
        passwordObj.error = true;
        passwordObj.message = 'Password too long.';
    }
    
    if(confirmObj.value !== passwordObj.value) {
        confirmObj.error = true;
        confirmObj.message = 'Password does not match.';
    }

    try{
        const isPasswordSame = await PlayerGateway.checkPasswordsMatch(req.token!.id, passwordObj.value);

        if(isPasswordSame){
            passwordObj.error = true;
            passwordObj.message = 'New password cannot be your current password.';
        }

        if(passwordObj.error || confirmObj.error){
            status = 400;
        }else{
            await PlayerGateway.changePassword(req.token!.id, passwordObj.value);
        }

        res.status(status).json({
            passwordObj,
            confirmObj
        });
    }catch(error){
        next(error);
    }
});

router.options('/logout');
router.delete('/logout', checkAuthorization, async (req, res, next) => {
    // await PlayerGateway.deletePlayer();
});

router.options('/deleteAccount');
router.delete('/deleteAccount', checkAuthorization, async (req, res, next) => {
    try{
        await PlayerGateway.deletePlayer(req.token!.id);

        res.status(200).end();
    }catch(error){
        next(error);
    }
});

export default router;