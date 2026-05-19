import mongoose from 'mongoose';

import app from './app.js';

import mongodbCreds from '../mongodb-credentials.json' with {type: 'json'};

const port = 3100;
const mongoDBURL = `mongodb+srv://${mongodbCreds.username}:${mongodbCreds.password}@matching-game.052nx.mongodb.net/matching-game?retryWrites=true&w=majority&appName=Matching-Game`;

try{
    await mongoose.connect(mongoDBURL);
    console.log('MongoDB connection successful');
}catch(error){
    console.log('MongoDB connection error');
    console.log(error);
    process.exit(1);
}

app.listen(port, () => console.log(`Server running on port ${port}`));