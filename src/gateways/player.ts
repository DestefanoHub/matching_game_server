import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

import Player from '../models/Player.js';
import type { Player as PlayerType } from '../types.js';

export default abstract class PlayerGateway {
    public static async insertPlayer(name: string, password: string): Promise<void> {
        try{
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password, salt);
            
            const player = new Player({
                name,
                password: hash,
                salt
            });

            await player.save();
        }catch(error){
            throw new Error("400", {cause: error});
        }
    }

    public static async getPlayerByID(id: string): Promise<PlayerType> {
        try{
            return await Player.findById(id).lean<PlayerType>().exec() as PlayerType;
        }catch(error){
            throw new Error("404", {cause: error});
        }
    }

    public static async checkUsernameExists(username: string): Promise<number> {
        try{
            // const foundPlayer = await Player.aggregate([
            //     {
            //         $addFields: {upperName: {$toUpper: '$name'}},
            //         $match: {name: username},
            //         $count: 'matching_users'
            //     }
            // ]);
            // console.log(foundPlayer);
            return await Player.find({name: username.trim()}).countDocuments();
        }catch(error){
            throw new Error("400", {cause: error});
        }
    }

    public static async searchPlayers(searchTerm: string): Promise<string[]> {
        try{
            if(!searchTerm){
                throw new Error('400', {cause: 'No search term provided.'});
            }

            const searchRegex = new RegExp(searchTerm.trim(), 'i');
            return await Player.find({name: searchRegex}, {name: 1}).lean<string[]>().exec();
        }catch(error){
            throw new Error("404", {cause: error});
        }
    }

    public static async deletePlayer(id: string): Promise<void> {
        try{
            await Player.deleteOne({_id: id});
        }catch(error){
            throw new Error("404", {cause: error});
        }
    }

    public static async changePassword(id: string, newPassword: string) {
        try{
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(newPassword, salt);

            await Player.updateOne({_id: id}, {password: hash, salt});
        }catch(error){
            throw new Error("404", {cause: error});
        }
    }

    public static async login(name: string, password: string): Promise<{_id: Types.ObjectId, name: string}> {
        try{
            const player = await Player.findOne({name}).lean<PlayerType>().exec();

            if(player !== null){
                const isValid = await bcrypt.compare(password, player.password!);

                if(isValid){
                    return player;
                }
            }

            throw new Error("401", {cause: 'Invalid credentials.'});
        }catch(error){
            throw new Error("400", {cause: error});
        }
    }

    public static async validate() {}
}