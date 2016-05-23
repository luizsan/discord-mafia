'use strict';
var assert = require('assert');
var fs = require('fs');
var options = require('../lib/Options')();
var Model = require('../lib/Model');

const BaseChild = {
    class: './Model',
    ref: null,
    normal: null,
};

class Child extends Model {
    constructor(data) {
        super(Model.inherit(data, BaseChild));
        this._relation('ref');
    }
}

describe('Model', () => {
    describe('#constructor()', () => {
        it('should allow to reference each other using ids', () => {
            var child1 = new Child();
            var child2 = new Child({
                ref: child1.id
            });
            child1.ref = child2.id;

            assert.strictEqual(child1.ref.id, child2.id);
            assert.strictEqual(child2.ref.id, child1.id);
        });
        it('should allow to reference each other using instances', () => {
            var child1 = new Child();
            var child2 = new Child({
                ref: child1
            });
            child1.ref = child2;

            assert.strictEqual(child1.ref.id, child2.id);
            assert.strictEqual(child2.ref.id, child1.id);
        });
        it('should allow to access others properties normally', () => {
            var child = new Child();
            child.normal = 1;
            assert.strictEqual(child.normal, 1);
            child.normal = 'mystring';
            assert.strictEqual(child.normal, 'mystring');
            child.normal = null;
            assert.strictEqual(child.normal, null);
        });
    });
    describe('#persist()/#destroy()', () => {
        it('should delete and create files', () => {
            var child = new Child();
            assert.ok(fs.existsSync(options.dir.data + '/' + child.id + '.json'));
            child.destroy();
            assert.ok(!fs.existsSync(options.dir.data + '/' + child.id + '.json'));
            child.persist();
            assert.ok(fs.existsSync(options.dir.data + '/' + child.id + '.json'));
            assert.deepEqual(JSON.parse(fs.readFileSync(options.dir.data + '/' + child.id + '.json')), child);
        });
        it('should insert/remove from cache', () => {
            var child = new Child();
            child.destroy();
            assert.strictEqual(Model.find(child.id), null);
            child.persist();
            fs.unlinkSync(options.dir.data + '/' + child.id + '.json');
            assert.deepEqual(Model.find(child.id), child);
        });
    });
    describe('.find()', () => {
        it('should load objects from cache', () => {
            var child = new Child();
            fs.unlinkSync(options.dir.data + '/' + child.id + '.json');
            assert.strictEqual(Model.find(child.id), child);
        });
    });
});
