const { ObjectId } = require('mongodb');

class Game{
    #_id;
    #player;
    #date;
    #difficulty;
    #hasWon;
    #points;
    #totalPoints;
    #time;
    
    constructor(nPlayer, nDiff, nWon, nPoints, nTotalPoints, nTime, nDate = null, nId = null) {
        this.player = nPlayer;
        this.difficulty = nDiff;
        this.hasWon = nWon;
        this.points = nPoints;
        this.totalPoints = nTotalPoints;
        this.time = nTime;

        this.date = new Date().toJSON();
        this._id = nId;
    }

    getId() {
        return (this._id === null) ? null : this._id;
    }

    getIdAsBSON() {
        return (this._id === null) ? null : new ObjectId(nId);
    }

    getPlayer() {
        return this.player;
    }

    getDate() {
        return this.date;
    }

    getDifficulty() {
        return this.difficulty;
    }

    getHasWon() {
        return this.hasWon;
    }

    getPoints() {
        return this.points;
    }

    getTotalPoints() {
        return this.totalPoints;
    }

    getTime() {
        return this.time;
    }
};

module.exports = {
    Game
};