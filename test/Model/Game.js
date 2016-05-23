'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Collection = require('../../lib/Model/Collection');
var Game = require('../../lib/Model/Game');
var Player = require('../../lib/Model/Player');
var Role = require('../../lib/Model/Role');
var Goon = require('../../lib/Model/Role/Goon');
var Townie = require('../../lib/Model/Role/Townie');

describe('Model/Game', () => {
    describe('#start()', () => {
        it('should initialize all player', () => {
            var player1 = new Player({initialize: sinon.stub()});
            var player2 = new Player({initialize: sinon.stub()});
            var player3 = new Player({initialize: sinon.stub()});
            var game = new Game({
                players: new Collection([player1, player2, player3]),
                onDayStart: sinon.stub()
            });

            game.start();

            assert(player1.initialize.calledOnce);
            assert(player1.initialize.calledWith(game));
            assert(player2.initialize.calledOnce);
            assert(player2.initialize.calledWith(game));
            assert(player3.initialize.calledOnce);
            assert(player3.initialize.calledWith(game));
        });
        it('should register to receive cycle events', () => {
            var game = new Game({on: sinon.stub()});

            game.start();

            assert(game.on.calledWith('day.start', game));
            assert(game.on.calledWith('day.end', game));
            assert(game.on.calledWith('night.start', game));
            assert(game.on.calledWith('night.end', game));
        });
    });
    describe('#setVote()/#countVotes()/#clearVotes()', () => {
        it('should store votes for each player', () => {
            var player1 = new Player({role: new Role()});
            var player2 = new Player({role: new Role()});
            var player3 = new Player({role: new Role()});
            var player4 = new Player({role: new Role()});
            var game = new Game({
                players: new Collection([player1, player2, player3, player4])
            });

            assert.equal(game.votes.length, 0);
            game.setVote(player1, player3);
            game.setVote(player2, player3);
            assert.equal(game.votes.length, 2);
            assert.equal(game.countVotes()[player3.id], 2);
            game.setVote(player3, player1);
            assert.equal(game.votes.length, 3);
            assert.equal(game.countVotes()[player1.id], 1);
            assert.equal(game.countVotes()[player3.id], 2);
            game.setVote(player2, player1);
            assert.equal(game.votes.length, 3);
            assert.equal(game.countVotes()[player1.id], 2);
            assert.equal(game.countVotes()[player3.id], 1);
            game.setVote(player1, null);
            assert.equal(game.votes.length, 2);
            assert.equal(game.countVotes()[player1.id], 2);
            assert.equal(game.countVotes()[player3.id], undefined);
            game.clearVotes();
            assert.equal(game.votes.length, 0);
            assert.equal(game.countVotes()[player1.id], undefined);
            game.setVote(player3, player2);
            assert.equal(game.votes.length, 1);
        });
        it('should end the day when reach majority of votes', () => {
            var player1 = new Player({role: new Role()});
            var player2 = new Player({role: new Role()});
            var player3 = new Player({role: new Role()});
            var player4 = new Player({role: new Role()});
            var player5 = new Player({role: new Role()});
            var game = new Game({
                players: new Collection([player1, player2, player3, player4, player5]),
                emit: sinon.stub()
            });

            game.setVote(player1, player3);
            game.setVote(player2, player3);
            game.setVote(player3, player1);
            assert(game.emit.notCalled);
            game.setVote(player4, player3);
            assert(game.emit.calledWith('day.end', player3));
            assert.equal(game.votes.length, 0);
        });
    });
    describe('#onCycleReady()', () => {
        it('should prevent to end a cycle when a player is not ready', () => {
            var player1 = new Player({role: new Townie()});
            var player2 = new Player({role: new Townie()});
            var player3 = new Player({role: new Townie({cycleReady: false})});
            var player4 = new Player({role: new Goon()});
            var game = new Game({
                players: new Collection([player1, player2, player3, player4]),
                emit: sinon.stub()
            });

            game.setVote(player1, player2);
            game.setVote(player3, player2);
            game.setVote(player4, player2);
            assert(game.emit.notCalled);
            player3.role.cycleReady = true;
            game.onCycleReady();
            assert(game.emit.calledWith('day.end', player2));
            assert.equal(game.votes.length, 0);
        });
        it('should count the mafia kill vote correctly', () => {
            var player1 = new Player({role: new Townie()});
            var player2 = new Player({role: new Townie()});
            var player3 = new Player({role: new Townie()});
            var player4 = new Player({role: new Goon()});
            var game = new Game({
                cycle: 'night',
                players: new Collection([player1, player2, player3, player4]),
                emit: sinon.stub()
            });
            game.setVote(player4, player1);
            assert(game.emit.calledWith('night.end', player1));
        });
    });
    describe('#onDayStart()/#onNightStart()', () => {
        it('should message the players', () => {
            sinon.stub(Client._client.Channels, 'getBy').returns({id: '2', sendMessage: sinon.stub()});
            var player1 = new Player({role: new Townie(), sendPrivate: sinon.stub()});
            var player2 = new Player({role: new Goon(), sendPrivate: sinon.stub()});
            var game = new Game({
                cycle: 'day',
                channel: '2',
                players: new Collection([player1, player2])
            });

            game.onDayStart();
            assert(game.channel.sendMessage.calledOnce);
            assert(game.channel.sendMessage.args[0][0].indexOf(player1.mention) >= 0);
            assert(game.channel.sendMessage.args[0][0].indexOf(player2.mention) >= 0);
            game.channel.sendMessage.reset();

            game.cycle = 'night';
            game.onNightStart();
            assert(game.channel.sendMessage.calledOnce);
            assert(player1.sendPrivate.notCalled);
            assert(player2.sendPrivate.calledOnce);
            assert(player2.sendPrivate.args[0][0].indexOf('kill') >= 0);
            Client._client.Channels.getBy.restore();
        });
    });
    describe('#onCycleEnd()', () => {
        it('should cycle between day and night', () => {
            sinon.stub(Client._client.Channels, 'getBy').returns({id: '2', sendMessage: sinon.stub()});
            var player1 = new Player({role: new Townie(), stub: sinon.stub()});
            var player2 = new Player({role: new Townie()});
            var player3 = new Player({role: new Goon()});
            var game = new Game({
                cycle: 'day',
                channel: '2',
                players: new Collection([player1, player2, player3])
            });

            game.on('night.start', player1, 'stub');
            game.onCycleEnd(null);
            assert(player1.stub.calledOnce);
            assert.equal(game.cycle, 'night');
            player1.stub.reset();

            game.on('day.start', player1, 'stub');
            game.onCycleEnd(null);
            assert(player1.stub.calledOnce);
            assert.equal(game.cycle, 'day');
            Client._client.Channels.getBy.restore();
        });
        it('should check win conditions', () => {
            sinon.stub(Client._client.Channels, 'getBy').returns({id: '2', sendMessage: sinon.stub()});
            var player1 = new Player({role: new Townie()});
            var player2 = new Player({role: new Townie()});
            var player3 = new Player({role: new Goon()});

            var game = new Game({channel: '2', players: new Collection([player1, player2, player3])});
            Client.game = game;
            game.onCycleEnd(player2);
            assert(game.channel.sendMessage.calledWith('The *Mafia* Wins! Congratulations ' + player3.mention));
            assert.equal(Client.game, null);

            player1 = new Player({role: new Townie()});
            player2 = new Player({role: new Townie()});
            player3 = new Player({role: new Goon()});
            game = new Game({channel: '2', players: new Collection([player1, player2, player3])});
            Client.game = game;
            game.onCycleEnd(player3);
            assert(game.channel.sendMessage.calledWith('The *Town* Wins! Congratulations ' + player1.mention + ' ' + player2.mention));
            assert.equal(Client.game, null);

            Client._client.Channels.getBy.restore();
        });
    });
})
