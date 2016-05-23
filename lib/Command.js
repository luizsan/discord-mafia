'use strict';

module.exports =
/**
 * Base class for commands.
 */
class Command {
    /**
     * Command name
     * @return {String}
     * @readonly
     */
    get name() { throw new TypeError('Not Implemented. (Abstract Class)'); }

    /**
     * Return true if can only accept this command via private messages.
     * @return {Boolean}
     * @readonly
     */
    get isPrivate() { throw new TypeError('Not Implemented. (Abstract Class)'); }

    /**
     * Return true if can accept this even with none game running.
     * @return {Boolean}
     * @readonly
     */
    get isGeneric() { throw new TypeError('Not Implemented. (Abstract Class)'); }

    /**
     * Return true if message is an acceptable command.
     * @param {Message}
     * @return {Boolean}
     */
    accepts(message) {
        return !!( message.argv[0] && message.argv[0].toLowerCase() == this.name && (
            (this.isGeneric || (!this.isGeneric && message.player)) &&
            ((this.isPrivate !== false && message.isPrivate) || (this.isPrivate !== true && !message.isPrivate)) ));
    }

    /**
     * Execute this command over the message.
     * @param {Message} message
     */
    execute(message) { throw new TypeError('Not Implemented. (Abstract Class)'); }

    /**
     * handle the message as a builder.
     * @param {Message} message
     */
    executeBuilder(message) { throw new TypeError('Not Implemented. (Abstract Class)'); }
};
