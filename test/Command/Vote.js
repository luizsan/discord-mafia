'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Role = require('../../lib/Model/Role');
var Message = require('../../lib/Message');
var Player = require('../../lib/Model/Player');
var Vote = require('../../lib/Command/Vote');

describe('Command/Vote', () => {
    afterEach(() => {
        Client.game = null;
        Client.setup = null;
    });
    describe('#accepts()', () => {
        it ('should return true only for valid messages', () => {
            var player = {id: 1};
            var messageNPrivNGame = new Message({isPrivate: false, author: player, content: 'vote'});
            var messagePrivNGame = new Message({isPrivate: true, author: player, content: 'vote'});
            Client.game = {players: {getBy: sinon.stub().returns(player)}};
            var messageNPrivGame = new Message({isPrivate: false, author: player, content: 'vote'});
            var messagePrivGame = new Message({isPrivate: true, author: player, content: 'vote'});

            var messageOtherCommand = new Message({isPrivate: false, author: player, content: 'other'});

            assert.equal(Vote.accepts(messagePrivGame), false);
            assert.equal(Vote.accepts(messagePrivNGame), false);
            assert.equal(Vote.accepts(messageNPrivGame), true);
            assert.equal(Vote.accepts(messageNPrivNGame), false);

            assert.equal(Vote.accepts(messageOtherCommand), false);
        });
    });
    describe('#execute()', () => {
        it('should vote on a player', () => {
            var author = new Player({role: new Role() });
            var target = new Player();
            Client.game = {cycle: 'day', players: {getBy: (key, id) => id == author.id ? author : id == target.id ? target : null }, setVote: sinon.spy()};
            var message = new Message({isPrivate: false, content: 'vote <@' + target.id + '>', author: author});
            sinon.stub(message, 'reply').returns();
            sinon.stub(Client, 'getUserBy', (key, id) => id == author.id ? author : id == target.id ? target : null);

            Vote.execute(message);
            assert(Client.game.setVote.calledWith(author, target));
            assert(message.reply.calledWith('Voted on ' + target.mention));
            Client.getUserBy.restore();
        });
        it('should be able to remove a vote', () => {
            var author = new Player({role: new Role() });
            Client.game = {cycle: 'day', players: {getBy: (key, id) => id == author.id ? author : null }, setVote: sinon.spy()};
            var message = new Message({isPrivate: false, content: 'vote', author: author});
            sinon.stub(message, 'reply').returns();
            sinon.stub(Client, 'getUserBy', (key, id) => id == author.id ? author : null);

            Vote.execute(message);
            assert(Client.game.setVote.calledWith(author, null));
            assert(message.reply.calledWith('Removed Vote'));
            Client.getUserBy.restore();
        });
    });
});
