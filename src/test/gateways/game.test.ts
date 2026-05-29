import { describe, test, before, after } from 'mocha';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { initGames, destroyGames } from '../database-config.js';
import { Game } from '../../models/Game.js';
import { Player } from '../../models/Player.js';
import GameGateway from '../../gateways/game.js';

chaiUse(chaiAsPromised);

describe('Game Gateway Insert operations', () => {
    before(async () => {
        await initGames();
    });

    after(async () => {
        await destroyGames();
    });

    
});