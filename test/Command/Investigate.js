'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Cop = require('../../lib/Model/Role/Cop');
var Message = require('../../lib/Message');
var Player = require('../../lib/Model/Player');
var Investigate = require('../../lib/Command/Investigate');

describe('Command/Investigate', () => {
    afterEach(() => {
        Client.game = null;
        Client.setup = null;
    });
    describe('#accepts()', () => {
        it ('should return true only for valid messages', () => {
            var player = {id: 1};
            var messageNPrivNGame = new Message({isPrivate: false, author: player, content: 'investigate'});
            var messagePrivNGame = new Message({isPrivate: true, author: player, content: 'investigate'});
            Client.game = {players: {getBy: sinon.stub().returns(player)}};
            var messageNPrivGame = new Message({isPrivate: false, author: player, content: 'investigate'});
            var messagePrivGame = new Message({isPrivate: true, author: player, content: 'investigate'});

            var messageOtherCommand = new Message({isPrivate: true, author: player, content: 'other'});

            assert.equal(Investigate.accepts(messagePrivGame), true);
            assert.equal(Investigate.accepts(messagePrivNGame), false);
            assert.equal(Investigate.accepts(messageNPrivGame), false);
            assert.equal(Investigate.accepts(messageNPrivNGame), false);

            assert.equal(Investigate.accepts(messageOtherCommand), false);
        });
    });
    describe('#execute()', () => {
        it('should mark another player to be investigated', () => {
            var author = new Player({role: new Cop({cycleReady: false}) });
            var target = new Player();
            Client.game = {cycle: 'night', players: {getBy: (key, id) => id == author.id ? author : id == target.id ? target : null }};
            var message = new Message({isPrivate: true, content: 'investigate <@' + target.id + '>', author: author});
            sinon.stub(message, 'reply').returns();
            sinon.stub(Client, 'getUserBy', (key, id) => id == author.id ? author : id == target.id ? target : null);

            Investigate.execute(message);
            assert.equal(author.role.investigate.id, target.id);
            assert.equal(author.role.cycleReady, true);
            assert(message.reply.calledWith('You will investigate ' + target.mention));
            Client.getUserBy.restore();
        });
    });
});
