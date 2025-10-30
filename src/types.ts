import mongoose, { Types } from 'mongoose';

export type SortBy = 'sa'|'sd'|'da'|'dd';

export type WinLoss = 'w'|'l'|'a';

export type Difficulty = 0|1|2|3;

export function isSortByType(value: unknown): value is SortBy {
    return ['sa', 'sd', 'da', 'dd'].includes(value as string);
}

export function isWinLossType(value: unknown): value is WinLoss {
    return ['w', 'l', 'a'].includes(value as string);
}

export function isDifficultyType(value: unknown): value is Difficulty {
    return [0, 1, 2, 3].includes(value as number);
}

export interface Game extends mongoose.Document {
    _id: Types.ObjectId,
    date?: Date,
    player: {
        id: string,
        username: string
    },
    difficulty: number,
    hasWon: boolean,
    points: number,
    totalPoints: number,
    time: number
};

export interface Player extends mongoose.Document {
    _id: Types.ObjectId,
    name: string,
    password?: string,
    salt?: string,
    JWT?: string
};

export type GamePlayer = {
    id: string,
    username: string
};