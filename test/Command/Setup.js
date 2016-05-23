'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../../lib/Client');
var Message = require('../../lib/Message');
var Setup = require('../../lib/Command/Setup');

class StubSetup extends require('../../lib/Setup') {
    get constraints() { return {
        timeout: {
            numericality: {
                onlyInteger: true,
                greatherThan: 0,
            }
        }
    }; }
};

describe('Command/Setup', () => {
    afterEach(() => {
        Client.allowedSetups = {};
        Client.game = null;
        Client.setup = null;
        Client.builder = null;
    });
    describe('#accepts()', () => {
        it ('should return true only for valid messages', () => {
            var player = {id: 1};
            var messageNPrivNGame = new Message({isPrivate: false, author: player, content: 'setup'});
            var messagePrivNGame = new Message({isPrivate: true, author: player, content: 'setup'});
            Client.game = {players: {getBy: sinon.stub().returns(player)}};
            var messageNPrivGame = new Message({isPrivate: false, author: player, content: 'setup'});
            var messagePrivGame = new Message({isPrivate: true, author: player, content: 'setup'});

            var messageOtherCommand = new Message({isPrivate: false, author: player, content: 'other'});

            assert.equal(Setup.accepts(messagePrivGame), false);
            assert.equal(Setup.accepts(messagePrivNGame), false);
            assert.equal(Setup.accepts(messageNPrivGame), true);
            assert.equal(Setup.accepts(messageNPrivNGame), true);

            assert.equal(Setup.accepts(messageOtherCommand), false);
        });
    });
    describe('#execute()', () => {
        it('should start a setup', () => {
            Client.allowedSetups = {mysetup: StubSetup};
            var author = {id: 1};
            var message = new Message({isPrivate: false, content: 'setup mysetup', author: author, channel: {}});
            sinon.stub(message, 'reply').returns();

            Setup.execute(message);
            assert(message.reply.called);
            assert(Client.setup instanceof StubSetup);
            assert.strictEqual(Client.setup.channel, message.channel);
        });
        it('should attach itself as a builder', () => {
            Client.allowedSetups = {mysetup: StubSetup};
            var author = {id: 1};
            var message = new Message({isPrivate: false, content: 'setup mysetup', author: author});
            sinon.stub(message, 'reply').returns();

            Setup.execute(message);
            assert(message.reply.called);
            assert.strictEqual(Client.builder, Setup);
            assert.equal(Client.builder.user_id, author.id);
        });
    });
    describe('#executeBuilder()', () => {
        it('should create a game with valid variables', () => {
            Client.allowedSetups = {mysetup: StubSetup};
            var author = {id: 1};

            var message = new Message({isPrivate: false, content: 'setup mysetup', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.execute(message);
            message = new Message({isPrivate: false, content: 'confirm', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.executeBuilder(message);

            assert(Client.setup.isReady)
        });
        it('shouldn\'t create a game with invalid variables', () => {
            Client.allowedSetups = {mysetup: StubSetup};
            var author = {id: 1};

            var message = new Message({isPrivate: false, content: 'setup mysetup', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.execute(message);
            message = new Message({isPrivate: false, content: 'set timeout invalid', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.executeBuilder(message);
            message = new Message({isPrivate: false, content: 'confirm', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.executeBuilder(message);

            assert(!Client.setup.isReady)
        });
        it('should be able to cancel itself', () => {
            Client.allowedSetups = {mysetup: StubSetup};
            var author = {id: 1};

            var message = new Message({isPrivate: false, content: 'setup mysetup', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.execute(message);
            message = new Message({isPrivate: false, content: 'cancel', author: author});
            sinon.stub(message, 'reply').returns();
            Setup.executeBuilder(message);

            assert(!Client.setup);
            assert(!Client.game);
            assert(!Client.builder);
        });
    });
});
