import express from 'express';

import PlayerGateway from '../gateways/player.js';
import authenticate from '../auth.js';

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
        return next(error);
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
        return next(error);
    }
});

router.get('/searchPlayers/:player', async (req, res, next) => {
    let status = 200;
    let players: string[] = [];
    const player = req.params.player;

    if(!player){
        throw new Error('400', {cause: 'No search term provided.'});
    }

    try{
        players = await PlayerGateway.searchPlayers(player);

        if(!players.length){
            status = 404;
        }

        res.status(status).json(players);
    }catch(error){
        return next(error);
    }
});

router.options('/createAccount');
router.post('/createAccount', async (req, res, next) => {
    let status = 201;
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
        await PlayerGateway.insertPlayer(usernameObj.value, passwordObj.value);
    }

    res.status(status).json({
        usernameObj,
        passwordObj,
        confirmObj
    });
});

router.options('/login');
router.post('/login', async (req, res, next) => {
    // await PlayerGateway.login();
});

router.options('/changePassword');
router.patch('/changePassword', authenticate, async (req, res, next) => {
    // await PlayerGateway.changePassword();
});

router.options('/logout');
router.delete('/logout', authenticate, async (req, res, next) => {
    // await PlayerGateway.deletePlayer();
});

router.options('/deleteAccount');
router.delete('/deleteAccount', authenticate, async (req, res, next) => {
    // await PlayerGateway.deletePlayer();
});

export default router;