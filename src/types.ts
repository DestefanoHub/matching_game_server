import { Types } from 'mongoose';

export type SortBy = 'sa'|'sd'|'da'|'dd';

export type WinLoss = 'w'|'l'|'a';

export type Difficulty = 0|1|2;

export function isSortBy(value: unknown): value is SortBy {
    return ['sa', 'sd', 'da', 'dd'].includes(value as string);
}

export function isWinLoss(value: unknown): value is WinLoss {
    return ['w', 'l', 'a'].includes(value as string);
}

export function isDifficulty(value: unknown): value is Difficulty {
    return [0, 1, 2].includes(value as number);
}

export interface Game {
    _id?: Types.ObjectId,
    __v?: number,
    date?: Date,
    player: string,
    difficulty: number,
    hasWon: boolean,
    points: number,
    totalPoints: number,
    time: number
};