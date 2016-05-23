'use strict';
var assert = require('assert');
var Collection = require('../../lib/Model/Collection');
var Model = require('../../lib/Model');

const BaseElement = {
    class: './Model',
    value: null,
};

class Element extends Model {
    constructor(data) {
        super(Model.inherit(data, BaseElement));
    }
}

describe('Model/Collection', () => {
    describe('#constructor()', () => {
        it('should allow to reference by id and instance', () => {
            var element = new Element();
            var collection = new Collection([element.id]);
            assert(collection.indexOf(element) >= 0);
            collection = new Collection([element]);
            assert(collection.indexOf(element) >= 0);
            collection = new Collection({children: [null, element]});
            assert(collection.indexOf(element) >= 0);
        });
    });
    describe('#get()/#getBy()/#find()', () => {
        it('should return the correct elements', () => {
            var elementA = new Element({value: 'a'});
            var elementB = new Element({value: 'b'});
            var elementC = new Element({value: 'c'});
            var collection = new Collection([elementA, elementB, elementC]);
            assert.strictEqual(collection.get(elementA.id).id, elementA.id);
            assert.strictEqual(collection.get(elementB.id).id, elementB.id);
            assert.strictEqual(collection.getBy('id', elementB.id).id, elementB.id);
            assert.strictEqual(collection.getBy('id', elementC.id).id, elementC.id);
            assert.strictEqual(collection.getBy('value', elementC.value).id, elementC.id);
            assert.strictEqual(collection.getBy('value', elementA.value).id, elementA.id);
            assert.strictEqual(collection.find((v) => { return v.value === elementA.value }).id, elementA.id);
            assert.strictEqual(collection.find((v) => { return v.value === elementC.value }).id, elementC.id);
        });
    });
    describe('#forEach()/#filter()/#map()', () => {
        var dataTable = [
            [],
            [new Element({value: 0})],
            [new Element({value: 0}), new Element({value: 1}), new Element({value: 2})]
        ];

        it('should iterate over the collection', () => {
            for (var data of dataTable) {
                var collection = new Collection(data);
                for (var fn of [collection.forEach, collection.filter, collection.map]) {
                    var count = 0;
                    fn.call(collection, (item, index) => { ++count; return assert.equal(index, item.value); });
                    assert.equal(count, data.length);
                }
            }
        });

        it('should filter/map the collection', () => {
            var filterResults = [
                [],
                [],
                [dataTable[2][1], dataTable[2][2]]
            ]
            var mapResults = [
                [],
                [0],
                [0,1,2]
            ]
            for (var index in dataTable) {
                var collection = new Collection(dataTable[index]);
                assert.deepEqual(collection.filter((item) => { return item.value >= 1; }), filterResults[index]);
                assert.deepEqual(collection.map((item) => { return item.value; }), mapResults[index]);
            };
        });
    });
    describe('#push()/#delete()/#clear()', () => {
        it('should be able to add/remove elements', () => {
            var elements = [new Element(), new Element(), new Element()];
            var collection = new Collection();
            assert.equal(collection.length, 0);
            assert.equal(collection.indexOf(elements[1]), -1);
            collection.push(elements[0]);
            collection.push(elements[1].id, elements[2]);
            assert.equal(collection.length, 3);
            for (var i in elements) {
                assert.equal(collection.indexOf(elements[i]), i);
            }

            collection.delete(elements[1]);
            assert.equal(collection.length, 2);
            assert.equal(collection.indexOf(elements[1]), -1);
            collection.delete(elements[2].id, elements[0]);
            assert.equal(collection.length, 0);
            for (var i in elements) {
                assert.equal(collection.indexOf(elements[i]), -1);
            }

            collection = new Collection(elements);
            collection.clear();
            assert.equal(collection.length, 0);
            for (var i in elements) {
                assert.equal(collection.indexOf(elements[i]), -1);
            }
        });
    });
});
