'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Goon = require('../../lib/Model/Role/Goon');
var Message = require('../../lib/Message');
var Player = require('../../lib/Model/Player');
var Kill = require('../../lib/Command/Kill');

describe('Command/Kill', () => {
    afterEach(() => {
        Client.game = null;
        Client.setup = null;
    });
    describe('#accepts()', () => {
        it ('should return true only for valid messages', () => {
            var player = {id: 1};
            var messageNPrivNGame = new Message({isPrivate: false, author: player, content: 'kill'});
            var messagePrivNGame = new Message({isPrivate: true, author: player, content: 'kill'});
            Client.game = {players: {getBy: sinon.stub().returns(player)}};
            var messageNPrivGame = new Message({isPrivate: false, author: player, content: 'kill'});
            var messagePrivGame = new Message({isPrivate: true, author: player, content: 'kill'});

            var messageOtherCommand = new Message({isPrivate: true, author: player, content: 'other'});

            assert.equal(Kill.accepts(messagePrivGame), true);
            assert.equal(Kill.accepts(messagePrivNGame), false);
            assert.equal(Kill.accepts(messageNPrivGame), false);
            assert.equal(Kill.accepts(messageNPrivNGame), false);

            assert.equal(Kill.accepts(messageOtherCommand), false);
        });
    });
    describe('#execute()', () => {
        it('should vote on a player to be killed', () => {
            var author = new Player({role: new Goon() });
            var target = new Player();
            Client.game = {cycle: 'night', players: {getBy: (key, id) => id == author.id ? author : id == target.id ? target : null }, setVote: sinon.spy()};
            var message = new Message({isPrivate: false, content: 'kill <@' + target.id + '>', author: author});
            sinon.stub(message, 'reply').returns();
            sinon.stub(Client, 'getUserBy', (key, id) => id == author.id ? author : id == target.id ? target : null);

            Kill.execute(message);
            assert(Client.game.setVote.calledWith(author, target));
            assert(message.reply.calledWith('You voted to kill ' + target.mention));
            Client.getUserBy.restore();
        });
        it('should be able to remove a vote', () => {
            var author = new Player({role: new Goon() });
            Client.game = {cycle: 'night', players: {getBy: (key, id) => id == author.id ? author : null }, setVote: sinon.spy()};
            var message = new Message({isPrivate: false, content: 'kill', author: author});
            sinon.stub(message, 'reply').returns();
            sinon.stub(Client, 'getUserBy', (key, id) => id == author.id ? author : null);

            Kill.execute(message);
            assert(Client.game.setVote.calledWith(author, null));
            assert(message.reply.calledWith('Removed Vote'));
            Client.getUserBy.restore();
        });
    });
});
