'use strict';
var assert = require('assert');
var sinon = require('sinon');
var IMessage = require('discordie/lib/interfaces/IMessage');
var Client = require('../lib/Client');
var Message = require('../lib/Message');

describe('Message', () => {
    describe('#argv', () => {
        it('should split the message by spaces', () => {
            Client._client._channels.update({id: '1'});
            Client._client._messages.update({id: '1', channel_id: '1', content: 'command firstvar var2 1234 @symbol()'});
            var imessage = new IMessage(Client._client, '1');
            var message = new Message(imessage);
            assert.deepEqual(message.argv, [ 'command', 'firstvar', 'var2', '1234', '@symbol()' ]);
        });
        it('should ignore spaces in quotes', () => {
            Client._client._channels.update({id: '1'});
            Client._client._messages.update({id: '1', channel_id: '1', content: 'command "first var" "var 2" 1 2 3'});
            Client._client._messages.update({id: '2', channel_id: '1', content: 'command \'var 1\' \'second var\' <@1234>'});
            var imessage = new IMessage(Client._client, '1');
            var message = new Message(imessage);
            assert.deepEqual(message.argv, [ 'command', 'first var', 'var 2', '1', '2', '3' ]);
            imessage = new IMessage(Client._client, '2');
            message = new Message(imessage);
            assert.deepEqual(message.argv, [ 'command', 'var 1', 'second var', '<@1234>' ]);
        });
    });
    describe('#parseChannel()/#parseGuild()/#parseRole()/#parseUser()', () => {
        it('should translate names in objects', () => {
            Client._client._guilds.update({id: '1', name: 'myguild', roles: []});
            Client._client._channels.update({id: '2', name: 'mychannel', guild_id: '1'});
            Client._client._users.update({id: '3', username: 'myuser'});
            Client._client._guilds.updateRole('1', {id: '4', name: 'myrole'});
            var message = new Message({channel: Client._client.Channels.get('2'), isPrivate: false});
            assert.equal(message.parseChannel('mychannel').id, 2);
            assert.equal(message.parseGuild('myguild').id, 1);
            assert.equal(message.parseRole('myrole').id, 4);
            assert.equal(message.parseUser('myuser').id, 3);
        });
        it('should find an object by mention id', () => {
            Client._client._guilds.update({id: '1', name: 'myguild', roles: []});
            Client._client._channels.update({id: '2', name: 'mychannel', guild_id: '1'});
            Client._client._users.update({id: '3', username: 'myuser'});
            Client._client._guilds.updateRole('1', {id: '4', name: 'myrole'});
            var message = new Message({channel: Client._client.Channels.get('2'), isPrivate: false});
            assert.equal(message.parseChannel('<#2>').name, 'mychannel');
            assert.equal(message.parseRole('<@&4>').name, 'myrole');
            assert.equal(message.parseUser('<@3>').username, 'myuser');
            assert.equal(message.parseUser('<@!3>').username, 'myuser');
        });
        it('should return null when a name don\'t exists', () => {
            Client._client._guilds.update({id: '1', name: 'myguild', roles: []});
            Client._client._channels.update({id: '2', name: 'mychannel', guild_id: '1'});
            Client._client._users.update({id: '3', username: 'myuser'});
            Client._client._guilds.updateRole('1', {id: '4', name: 'myrole'});
            var message = new Message({channel: Client._client.Channels.get('2'), isPrivate: false});
            assert.equal(message.parseChannel('otherchannel'), null);
            assert.equal(message.parseGuild('otherguild'), null);
            assert.equal(message.parseRole('otherrole'), null);
            assert.equal(message.parseUser('otheruser'), null);
        });
    });
    describe('#reply()', () => {
        it('should eventually send a reply to author.', (done) => {
            var author = {mention: '<@1>'};
            var message = new Message({channel: {sendMessage: sinon.spy()}, author: author});
            message.reply('My reply');
            setTimeout(() => {
                assert(message.channel.sendMessage.calledWith('<@1>\nMy reply'));
                done();
            });
        });
        it('should concatenate many replies.', (done) => {
            var message = new Message({channel: {sendMessage: sinon.spy()}, isPrivate: true});
            message.reply('First part');
            message.reply('Another part');
            setTimeout(() => {
                assert(message.channel.sendMessage.calledWith('First part\nAnother part'));
                assert(message.channel.sendMessage.calledOnce);
                done();
            });
        });
    });
});
