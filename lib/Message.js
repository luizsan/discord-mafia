'use strict';
var Client = require('./Client');

const argSplit = /[^\s"']+|"[^"]*"|'[^']*'/g;
const userMention = /^<@!?(\d+)>$/;
const channelMention = /^<#(\d+)>$/;
const roleMention = /^<@&(\d+)>$/;

module.exports =
/**
 * Parse a discordie message and break in arguments
 */
class Message {
    constructor(dmessage, prefixLength) {
        this.author = dmessage.author;
        this.channel = dmessage.channel;
        this.content = (dmessage.content || '').slice(prefixLength);
        this.isPrivate = dmessage.isPrivate;
        this.player = Client.game && Client.game.players.getBy('userId', this.author.id);
        Object.defineProperty(this, '_argv', {writable: true});
    }

    /**
     * Array of arguments.
     * @return {Array}
     */
    get argv() {
        if(!this._argv) {
            this._argv = this.content.match(argSplit) || [];
            this._argv.forEach((v, i) => {
                if (v[0] === '"' || v[0] === "'") {
                    this._argv[i] = v.slice(1,-1);
                }
            });
        }
        return this._argv;
    }

    /**
     * Convert a name or mention in a channel object.
     * @param {String} arg
     * @return {IChannel}
     */
    parseChannel(arg) {
        var result = arg.match(channelMention);
        if (result) {
            return Client.getChannelBy('id', result[1]);
        }
        if (arg[0] == '#') arg.shift();
        if (!this.isPrivate) {
            return this.channel.guild.textChannels.find((c) => c.name == arg);
        }
        return null;
    }

    /**
     * Convert a name or mention in a guild object.
     * @param {String} arg
     * @return {IGuild}
     */
    parseGuild(arg) {
        return Client.getGuildBy('name', arg);
    }

    /**
     * Convert a name or mention in a role object.
     * @param {String} arg
     * @return {IRole}
     */
    parseRole(arg) {
        if (this.isPrivate) return null;
        var result = arg.match(roleMention);
        if (result) {
            return this.channel.guild.roles.find((r) => r.id == result[1]);
        }
        return this.channel.guild.roles.find((r) => r.name == arg);
    }

    /**
     * Convert a name or mention in a user object.
     * @param {String} arg
     * @return {IUser}
     */
    parseUser(arg) {
        var result = arg.match(userMention);
        if (result) {
            return Client.getUserBy('id', result[1]);
        }
        var member;
        if (!this.isPrivate) {
            member = this.channel.guild.members.find((m) => m.name == arg);
        }
        return member || Client.getUserBy('username', arg);
    }

    /**
     * Reply to this message
     * @param {String} content
     */
    reply(content) {
        if (this.replyContent) {
            this.replyContent += '\n' + content;
        } else {
            this.replyContent = content.slice();
            setTimeout(() => this.channel.sendMessage((this.isPrivate ? '' : this.author.mention + '\n') + this.replyContent));
        }
    }
}
