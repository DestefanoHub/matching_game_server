import bcrypt from 'bcrypt';
import type { HydratedDocument } from 'mongoose';

import { Player } from '../models/Player.js';
import type { Player as PlayerType } from '../types.js';

export default abstract class PlayerGateway {
    /*
    * Checks if the username and password are not blank.
    * Does not check if the plaintext password meets any length requirement.
    */
    public static async insertPlayer(name: string, password: string): Promise<PlayerType> {
        try{
            if(!(name.trim().length && password.trim().length)) {
                throw new Error('400', {cause: 'Missing required fields.'});
            }

            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password, salt);
            const uniqueName = name.toLowerCase();
            
            const player: HydratedDocument<PlayerType> = new Player({
                name,
                uniqueName,
                password: hash,
                salt
            });

            return await player.save();
        }catch(error){
            if(error instanceof Error && error.message === '400'){
                throw error;
            }

            throw new Error("400", {cause: error});
        }
    }

    public static async getPlayerByID(id: string): Promise<PlayerType> {
        try{
            //Only retrieve players that are not deleted.
            const player = await Player.findOne({_id: id, deletedAt: null}).lean<PlayerType>().exec();

            if(player !== null) {
                return player;
            }

            throw new Error('404', {cause: `Player with ID: ${id} does not exist.`});
        }catch(error){
            if(error instanceof Error && error.message === '404'){
                throw error;
            }

            throw new Error("400", {cause: error});
        }
    }

    public static async checkUsernameExists(username: string): Promise<number> {
        try{
            /*
            * This should check all usernames, not just for active players.
            */
            if(username.trim().length !== 0){
                return await Player.find({uniqueName: username.trim().toLowerCase()}).countDocuments();
            }

            throw new Error('400', {cause: 'Username given for comparison is blank.'});
        }catch(error){
            if(error instanceof Error && error.message === '400'){
                throw error;
            }
            
            throw new Error("400", {cause: error});
        }
    }

    public static async checkPasswordsMatch(id: string, newPassword: string): Promise<boolean> {
        try{
            const player = await this.getPlayerByID(id);
            const newHash = await bcrypt.hash(newPassword, player.salt!);

            if(newHash === player.password){
                return true;
            }

            return false;
        }catch(error){
            throw new Error("404", {cause: error});
        }
    }

    // public static async searchPlayers(searchTerm: string): Promise<string[]> {
    //     try{
    //         if(!searchTerm){
    //             throw new Error('400', {cause: 'No search term provided.'});
    //         }

    //         const searchRegex = new RegExp(searchTerm.trim(), 'i');
    //         return await Player.find({name: searchRegex}, {name: 1}).lean<string[]>().exec();
    //     }catch(error){
    //         throw new Error("404", {cause: error});
    //     }
    // }

    /*
    * Sets the deletedAt field to the current datetime.
    * Does not work if the player is already deleted.
    */
    public static async deletePlayer(id: string): Promise<void> {
        try{
            const resultMeta = await Player.updateOne({_id: id, deletedAt: null}, {deletedAt: new Date()});

            if(resultMeta.modifiedCount === 0){
                throw new Error('404', {cause: 'Could not find user to delete.'});
            }
        }catch(error){
            if(error instanceof Error && error.message === '404'){
                throw error;
            }
            
            throw new Error("400", {cause: error});
        }
    }

    /*
    * Does not check if the new password matches the old one. Need to call checkPasswordsMatch first if you
    * want to check for that. However, it does generate a new salt so the hashes would be different.
    * Does not work for deleted players.
    * Checks if the password is not blank but does not check any length requirements.
    */
    public static async changePassword(id: string, newPassword: string): Promise<void> {
        try{
            if(!newPassword.trim().length) {
                throw new Error('400', {cause: 'Missing password for update.'});
            }
            
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(newPassword, salt);

            const resultMeta = await Player.updateOne({_id: id, deletedAt: null}, {password: hash, salt});

            if(resultMeta.modifiedCount === 0){
                throw new Error('404', {cause: 'Could not find user to update password.'});
            }
        }catch(error){
            if(error instanceof Error && (error.message === '404' || error.message === '400')){
                throw error;
            }
            
            throw new Error("400", {cause: error});
        }
    }

    /*
    * Only works if the player is not deleted (i.e. - deletedAt is null).
    */
    public static async login(name: string, password: string): Promise<PlayerType> {
        try{
            /*
            * Optionally chain the trim() calls since this could be null or undefined, and the error should be a 401
            * in those cases instead of a generic 400 which is what happens when the JS throws an error about being
            * unable to call trim().
            */
            const isNameBlank = name?.trim().length === 0;
            const isNameMissing = name == null;
            const isPasswordBlank = password?.trim().length === 0;
            const isPasswordMissing = password == null;

            if((isNameBlank || isNameMissing) || (isPasswordBlank || isPasswordMissing)){
                throw new Error('401', {cause: 'Missing required fields.'});
            }
            
            const player = await Player.findOne({name: name.trim(), deletedAt: null}).lean<PlayerType>().exec();

            if(player !== null){
                const isValid = await bcrypt.compare(password.trim(), player.password!);

                if(isValid){
                    return player;
                }
            }

            throw new Error('401', {cause: 'Invalid credentials.'});
        }catch(error){            
            if(error instanceof Error && error.message === '401'){
                throw error;
            }
            
            throw new Error("400", {cause: error});
        }
    }
}