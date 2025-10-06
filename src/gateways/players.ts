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

    public static async searchPlayers(searchTerm: string): Promise<PlayerType[]> {
        try{
            const searchRegex = new RegExp(searchTerm, 'i');
            return await Player.find({name: searchRegex}, {name: 1}).lean<PlayerType[]>().exec();
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

    public static async authenticate(name: string, password: string) {
        try{
            const player = await Player.findOne({name}).lean<PlayerType>().exec() as PlayerType;
            return await bcrypt.compare(password, player.password!);
        }catch(error){
            throw new Error("401", {cause: error});
        }
    }

    public static async validate() {}
}