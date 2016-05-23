'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Collection = require('../../lib/Model/Collection');
var CopHeadstart = require('../../lib/Mechanic/CopHeadstart');
var Game = require('../../lib/Model/Game');
var Player = require('../../lib/Model/Player');
var Townie = require('../../lib/Model/Role/Townie');
var Goon = require('../../lib/Model/Role/Goon');

describe('Setup/Mechanic/CopHeadstart', () => {
    it('should modify a Game creation', () => {
        var game = new Game({mechanics: [CopHeadstart]});
        assert.notEqual(game.onCycleReady, Game.prototype.onCycleReady);
        assert.equal(game.cycle, 'night');
        assert.equal(game.round, 0);
    });
    it('should ignore mafia vote on first night', () => {
        sinon.stub(Client._client.Channels, 'getBy').returns({id: '2', sendMessage: sinon.stub()});
        var player1 = new Player({role: new Townie(), sendPrivate: sinon.stub()});
        var player2 = new Player({role: new Townie({cycleReady: false}), sendPrivate: sinon.stub()});
        var player3 = new Player({role: new Goon(), sendPrivate: sinon.stub()});
        var game = new Game({
            channel: '2',
            players: new Collection([player1, player2, player3]),
            mechanics: [CopHeadstart]
        });
        game.start();

        assert.equal(game.cycle, 'night');
        game.setVote(player3, player1);
        player2.role.cycleReady = true;
        game.onCycleReady();
        assert.equal(game.cycle, 'day');
        assert.equal(game.players.length, 3);
        assert.equal(game.votes.length, 0);
        Client._client.Channels.getBy.restore();
    });
    it('should run normally on other nights', () => {
        sinon.stub(Client._client.Channels, 'getBy').returns({id: '2', sendMessage: sinon.stub()});
        var player1 = new Player({role: new Townie(), sendPrivate: sinon.stub()});
        var player2 = new Player({role: new Townie({cycleReady: false}), sendPrivate: sinon.stub()});
        var player3 = new Player({role: new Goon(), sendPrivate: sinon.stub()});
        var game = new Game({
            channel: '2',
            round: 1,
            players: new Collection([player1, player2, player3]),
            mechanics: [CopHeadstart]
        });
        game.start();

        assert.equal(game.cycle, 'night');
        game.setVote(player3, player1);
        player2.role.cycleReady = true;
        game.onCycleReady();
        assert.equal(Client.game, null);
        assert(game.channel.sendMessage.calledWith('The *Mafia* Wins! Congratulations ' + player3.mention));
        Client._client.Channels.getBy.restore();
    });
});
