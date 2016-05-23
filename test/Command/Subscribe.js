'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Message = require('../../lib/Message');
var Subscribe = require('../../lib/Command/Subscribe');
var Setup = require('../../lib/Setup');

describe('Command/Subscribe', () => {
    afterEach(() => {
        Client.game = null;
        Client.setup = null;
    });
    describe('#accepts()', () => {
        it ('should return true only for valid messages', () => {
            var player = {id: 1};
            var messageNPrivNGame = new Message({isPrivate: false, author: player, content: 'subscribe'});
            var messagePrivNGame = new Message({isPrivate: true, author: player, content: 'subscribe'});
            Client.game = {players: {getBy: sinon.stub().returns(player)}};
            var messageNPrivGame = new Message({isPrivate: false, author: player, content: 'subscribe'});
            var messagePrivGame = new Message({isPrivate: true, author: player, content: 'subscribe'});

            var messageOtherCommand = new Message({isPrivate: false, author: player, content: 'other'});

            assert.equal(Subscribe.accepts(messagePrivGame), false);
            assert.equal(Subscribe.accepts(messagePrivNGame), false);
            assert.equal(Subscribe.accepts(messageNPrivGame), true);
            assert.equal(Subscribe.accepts(messageNPrivNGame), true);

            assert.equal(Subscribe.accepts(messageOtherCommand), false);
        });
    });
    describe('#execute()', () => {
        it('should subscribe into a game', () => {
            var author = {id: 1};
            var message = new Message({isPrivate: false, content: 'subscribe', author: author});
            sinon.stub(message, 'reply').returns();
            var setup = Client.setup = new Setup();
            setup.onReady({});

            Subscribe.execute(message);
            assert.equal(setup.players.length, 1)
            assert.equal(setup.players.find((p) => p.id == author.id), author);
        });
    });
});
