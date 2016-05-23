'use strict';
var fs = require('fs');
var path = require('path');
var options = require('./Options')();
var cache = new (require('node-cache'))({
    ttl: 21600,
    checkperiod: 3600,
    useClones: false
});

var lastId;
try {
    lastId = parseInt(fs.readFileSync(options.dir.data + '/last.id', 'utf8'));
} catch (e) {
    lastId = 0;
} function createId() {
    fs.writeFileSync(options.dir.data + '/last.id', (++lastId).toString(), 'utf8');
    return lastId;
}

function privatify(target) {
    for (var k in target) {
        if (k[0] != '_') continue;
        Object.defineProperty(target, k, {enumerable: false});
    }
}

function extend(target, data) {
    target._relationsByProp = {};
    target._valuesByProp = {};
    for (let key in data) {
        if (key[0] == '_') {
            target[key] = data[key];
            continue;
        }
        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: false,
            get: function() {
                var get = target._relationsByProp[key] && target._relationsByProp[key][0];
                if (get) {
                    return get(target._valuesByProp[key]);
                }
                return target._valuesByProp[key];
            },
            set: function(value) {
                var set = target._relationsByProp[key] && target._relationsByProp[key][1];
                if (set) {
                    target._valuesByProp[key] = set(value);
                } else {
                    target._valuesByProp[key] = value;
                }
                target.persist();
                return target._valuesByProp[key];
            }
        });
        target._valuesByProp[key] = data[key];
    }
}

module.exports =
/**
 * Persitable data model. (Base Class)
 * Properties stating with '_' aren't persisted.
 */
class Model {
    /**
     * @param {Object} data - Under class model structure
     */
    constructor(data) {
        if (!data.class) throw('Property "class" not found');
        if (data.class.startsWith('/')) {
            data.class = './' + path.relative(__dirname, data.class);
        }
        data.id = data.id || createId();

        extend(this, data);
        privatify(this);
        Object.seal(this);
        this.persist();
    }

    /**
     * Merge data model structure.
     * @param {Object} data - Under class model structure
     * @param {Object} base - implementing class model structure
     * @return {Object} - Merged structure
     */
    static inherit(data, base) {
        if (!data) data = {};
        for (let k in base) {
            if (!data.hasOwnProperty(k)) {
                data[k] = base[k];
            }
        }
        return data;
    }

    /**
     * Load and return a Model from cache or file;
     * @param {Number} id
     */
    static find(id) {
        if (!id) return id;
        var data = cache.get(id.toString());
        if (data) return data;

        try {
            data = JSON.parse(fs.readFileSync(options.dir.data + '/' + id + '.json'));
            var _class = require(data.class);
            return new _class(data);
        } catch(e) {
            return null;
        }
    }

    /**
     * Overload a structure getter and setter.
     * @param {String} key - Property key
     * @param {Function} getter
     * @param {Function} setter
     */
    _relation(key, getter, setter) {
        if (!this.hasOwnProperty(key)) {
            throw ('Property ' + key + ' is not defined.');
        }

        if (!getter) getter = (v) => Model.find(v);
        if (!setter) setter = (v) => v instanceof Model ? v.id : v;
        this._relationsByProp[key] = [getter, setter];
        this[key] = this._valuesByProp[key];
    }

    /**
     * Force persistance of the model.
     */
    persist() {
        cache.set(this.id.toString(), this);
        fs.writeFileSync(options.dir.data + '/' + this.id + '.json', JSON.stringify(this._valuesByProp));
    }

    /**
     * Destroy this model.
     */
    destroy() {
        cache.del(this.id.toString());
        fs.unlinkSync(options.dir.data + '/' + this.id + '.json');
    }
}
