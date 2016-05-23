'use strict';
var util = require('util');
var Model = require('../Model');

const BaseEmitter = {
    class: __filename,
    /** @return - (internal) callbacks references */
    emitterCallbacks: null
};

module.exports =
/**
 * Emitter template class for models.
 */
class Emitter extends Model {
    constructor(data) {
        super(Model.inherit(data, BaseEmitter));
        this.emitterCallbacks = this.emitterCallbacks || {};
    }

    _instanceGetter(v) { return Model.find(v); }
    _instanceSetter(v) { return v instanceof Model ? v.id : v; }

    /**
     * Listen on the given event.
     * Calls a method from a model instance.
     * @param {String} event
     * @param {Model|String} instance
     * @param {String} methodName
     * @return {Emitter}
     */
    on(event, instance, methodName) {
        (this.emitterCallbacks['$' + event] = this.emitterCallbacks['$' + event] || [])
            .push([this._instanceSetter(instance), methodName, false]);
        this.persist();
        return this;
    }

    /**
     * Listen on the given event only once.
     * Calls a method from a model instance.
     * @param {String} event
     * @param {Model|String} instance
     * @param {String} methodName
     * @return {Emitter}
     */
    once(event, instance, methodName) {
        (this.emitterCallbacks['$' + event] = this.emitterCallbacks['$' + event] || [])
            .push([this._instanceSetter(instance), methodName, true]);
        this.persist();
        return this;
    }

    /**
     * Remove the given event callback.
     * @param {String} event
     * @param {Model|String} instance
     * @param {String} methodName
     * @return {Emitter}
     */
    off(event, instance, methodName) {
        if (arguments.length == 0) {
            this.emitterCallbacks = {};
            this.persist();
            return this;
        }

        if (!this.emitterCallbacks['$' + event]) return this;

        if (arguments.length == 1) {
            delete this.emitterCallbacks['$' + event];
            this.persist();
            return this;
        }

        instance = this._instanceSetter(instance);
        this.emitterCallbacks['$' + event] = this.emitterCallbacks['$' + event]
            .filter( (c) => instance != c[0] || methodName && methodName != c[1] );
        this.persist();
        return this;
    }

    /**
     * Emit an event with the given args.
     * @param {String} event
     * @param {...Mixed}
     * @return {Emitter}
     */
    emit(event) {
        if (this.emitterCallbacks['$' + event]) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var callback of this.emitterCallbacks['$' + event]) {
                var instance = this._instanceGetter(callback[0]);
                if (instance) {
                    instance[callback[1]](...args);
                    if (callback[2]) this.off(event, callback[0], callback[1]);
                } else this.off(event, callback[0]);
            }
        }
        return this;
    }

    /**
     * Check if emitter has handlers on event.
     * @param {String} event
     * @return {Boolean}
     */
    hasListeners(event) {
        return !! (this.emitterCallbacks['$' + event] && this.emitterCallbacks['$' + event].length);
    }
}
