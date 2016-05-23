'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to create a new game setup.
 */
new class Setup extends Command {
    /** @inheritdoc */
    get name() { return 'setup'; }
    /** @inheritdoc */
    get isPrivate() { return false; }
    /** @inheritdoc */
    get isGeneric() { return true; }

    /** @inheritdoc */
    execute(message) {
        if (Client.setup || Client.game) {
            message.reply('Can\'t create more than 1 game.');
            return;
        }

        var setupClass = Client.allowedSetups[message.argv[1]];
        if (!setupClass) {
            message.reply('Can\'t find this setup.');
            return;
        }

        Client.builder = this;
        this.user_id = message.author.id;
        this.setup = Client.setup = new setupClass(message.channel);
        this.options = {};

        message.reply('Preparing setup: ' + this.setup.name);
        this.printHelp(message);
    }

    /** @inheritdoc */
    executeBuilder(message) {
        var command = message.argv[0] && message.argv[0].toLowerCase();

        switch(command) {
            case 'help': this.printHelp(message); break;
            case 'info': this.printInfo(message); break;
            case 'rules': this.printRules(message); break;
            case 'set':
                if (this.setup.constraints[message.argv[1]]) {
                    this.options[message.argv[1]] = message.argv[2];
                } break;
            case 'confirm':
                var errors = this.setup.onReady(this.options);
                if (errors) {
                    message.reply('This setup contain errors:\n```json\n' + JSON.stringify(errors) + '\n```')
                    return;
                } else {
                    Client.builder = null;
                    message.reply('Setup `' + this.setup.name + '` Created!');
                    message.reply('Waiting for players to subscribe with `!subscribe`');
                    this.printRules(message);
                } break;
            case 'cancel':
                Client.setup = null;
                Client.builder = null;
                message.reply('Setup Cancelated!');
                break;
        }
    }

    /**
     * Send help information to message author.
     * @param {Message}
     */
    printHelp(message) {
        message.reply('```\nAvaliable Commands:');
        message.reply('  info                    Show the setup variables and their values.');
        message.reply('  set <variable> <value>  Change the value of a variable.');
        message.reply('  confirm                 Complete the setup creation.');
        message.reply('  cancel                  Cancel the setup creation.');
        message.reply('```');
    }

    /**
     * Send information about the custom variable to message author.
     * @param {Message}
     */
    printInfo(message) {
        message.reply('```');
        for (var index in this.setup.constraints) {
            message.reply(index + ': ' + this.options[index] ? JSON.stringify(this.options[index]) : JSON.stringify(this.setup[index]));
        }
        message.reply('```');
    }

    /**
     * Send setup rules..
     * @param {Message}
     */
    printRules(message) {
        message.reply(this.setup.rules);
    }
};
