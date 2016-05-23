'use strict';
var Model = require('../Model');

const BaseCollection = {
    class: __filename,
    /** @return {Array} - copy this collection as Array */
    children: [],
    _children: null
};

module.exports =
/**
 * Generic collection of Model
 */
class Collection extends Model {
    /**
     * @param {Object|Array} data - Under class model structure or Array of elements
     */
    constructor(data) {
        if (Array.isArray(data)) data = {children: data};
        super(Model.inherit(data, BaseCollection));
        this._relation('children',
            (v) => v.map(this._instanceGetter),
            (v) => this._children = v.map(this._instanceSetter));
    }

    _instanceGetter(v) { return Model.find(v); }
    _instanceSetter(v) { return v instanceof Model ? v.id : v; }

    /**
     * Number of elements in this collection.
     * @return {Number}
     * @readonly
     */
    get length() {
        return this._children ? this._children.length : 0;
    }

    /**
     * Returns an an element, if `key` of an element in the collection
     * with exact `value` can be found.
     * Otherwise null is returned.
     * @param {String} key
     * @param value
     * @return {Model}
     */
    getBy(key, value) {
        if (key == 'id') {
            for (var child of this._children) {
                if (child == value) return this._instanceGetter(child)
            }
        } else {
            for (var child of this._children) {
                child = this._instanceGetter(child);
                if (child[key] == value) return child;
            }
        }
        return null;
    }

    /**
     * Returns an element with requested `id`, if exists in the collection.
     * Otherwise null is returned.
     * @param {Number} id
     * @return {Model}
     */
    get(id) {
        return this.getBy('id', id);
    }

    /**
     * Adds one or more elements to the end of an array.
     * @param {...Model|Number} models
     */
    push(models) {
        for (var i in arguments) {
            arguments[i] = this._instanceSetter(arguments[i]);
        }

        var result = this._children.push(...arguments);
        this.persist();
        return result;
    }

    /**
     * Returns the first index at which a given element can be found
     * in the array, or -1 if it is not present.
     * @param {Model|Number} value - model object or id value
     * @return {Number}
     */
    indexOf(value) {
        return this._children.indexOf(this._instanceSetter(value));
    }

    /**
     * Executes a provided function once per element.
     * @param {Function} fn - Function with signature fn(item, index, collectionObj)
     */
    forEach(fn) {
        for (var index in this._children) {
            fn(this._instanceGetter(this._children[index]), index, this);
        }
    }

    /**
     * Returns a value in the collection, if an element in the collection
     * satisfies the provided testing function. Otherwise null is returned.
     * @param {Function} fn - Function with signature fn(item, index, collectionObj)
     * @returns {Model|null}
     */
    find(fn) {
        for (var index in this._children) {
            var item = this._instanceGetter(this._children[index]);
            if (fn(item, index, this)) return item;
        }
        return null;
    }

    /**
     * Creates a new array with all elements that pass the test implemented
     * by the provided function.
     * @param {Function} fn - Function with signature fn(item, index, collectionObj)
     * @returns {Array}
     */
    filter(fn) {
        const items = [];
        for (var index in this._children) {
            var item = this._instanceGetter(this._children[index]);
            if (fn(item, index, this))
                items.push(item);
        }
        return items;
    }

    /**
     * Creates a array with the results of calling a provided function on
     * every element in this collection.
     * @param {Function} fn - Function with signature fn(item, index, collectionObj)
     * @returns {Array}
     */
    map(fn) {
        const items = [];
        for (var index in this._children) {
            items.push(fn(this._instanceGetter(this._children[index]), index, this));
        }
        return items;
    }

    /**
     * Delete elements in this collection.
     * @param {...Model|Number} models - Ids or Objects to be deleted.
     */
    delete(models) {
        var deleted = false;
        for (var i in arguments) {
            arguments[i] = this._instanceSetter(arguments[i]);
        }

        for (var i in arguments) {
            var index = this._children.indexOf(arguments[i]);
            if (index >= 0) {
                this._children.splice(index, 1);
                deleted = true;
            }
        }

        if (deleted) {
            this.persist();
        }
        return deleted;
    }

    /**
     * Removes all elements from the collection.
     */
    clear() {
        this.children = [];
        this.persist();
    }

    /**
     * Destroy this collection.
     * @param {Boolean} children - Also destroy its elements.
     */
    destroy(children) {
        if (children) {
            this.forEach((child) => child.destroy(children));
        }
        super.destroy();
    }
}
