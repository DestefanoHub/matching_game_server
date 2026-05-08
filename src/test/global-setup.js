import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { initDB, closeDB } from './database-config';

export async function mochaGlobalSetup() {
    await initDB();
}

export async function mochaGlobalTeardown() {
    await closeDB();
}