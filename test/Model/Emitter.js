'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Collection = require('../../lib/Model/Collection');
var Emitter = require('../../lib/Model/Emitter');
var Model = require('../../lib/Model');

describe('Model/Emitter', () => {
    describe('#on()', () => {
        it('should add listeners', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one', val); },
                _event2: (val) => { calls.push('two', val); }
            });
            var calls = [];
            emitter.on('foo', emitter, '_event');
            emitter.on('foo', emitter, '_event2');

            emitter.emit('foo', 1);
            emitter.emit('bar', 1);
            emitter.emit('foo', 2);

            assert.deepEqual(calls, [ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
        });

        it('should add listeners for events which are same names with methods of Object.prototype', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one', val); },
                _event2: (val) => { calls.push('two', val); }
            });
            var calls = [];

            emitter.on('constructor', emitter, '_event');
            emitter.on('__proto__', emitter, '_event2');

            emitter.emit('constructor', 1);
            emitter.emit('__proto__', 2);

            assert.deepEqual(calls, [ 'one', 1, 'two', 2 ]);
        });
    });
    describe('#once()', () => {
        it('should add a single-shot listener', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one', val); }
            });
            var calls = [];

            emitter.once('foo', emitter, '_event');

            emitter.emit('foo', 1);
            emitter.emit('foo', 2);
            emitter.emit('foo', 3);
            emitter.emit('bar', 1);

            assert.deepEqual(calls, [ 'one', 1 ]);
        });
    });
    describe('#emit()', () => {
        it('should remove a destroyed listener', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one', val); }
            });

            emitter._event = sinon.spy();
            emitter.on('foo', emitter, '_event');

            emitter.destroy();
            emitter.emit('foo');

            assert(emitter._event.notCalled);
            assert(!emitter.hasListeners('foo'));
        });
    });
    describe('#off()', () => {
        it('should remove a listener', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one'); },
                _event2: (val) => { calls.push('two'); }
            });
            var calls = [];
            emitter.on('foo', emitter, '_event');
            emitter.on('foo', emitter, '_event2');
            emitter.off('foo', emitter, '_event2');

            emitter.emit('foo');

            assert.deepEqual(calls, [ 'one' ]);
        });
        it('should work with #once()', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one'); }
            });
            var calls = [];
            emitter.once('foo', emitter, '_event');
            emitter.once('bar', emitter, '_event');
            emitter.off('foo', emitter, '_event');

            emitter.emit('foo');
            assert.deepEqual(calls, []);
        });
        it('should work when called from an event', () => {
            var emitter = new Emitter({
                _event: (val) => { emitter.off('foo', emitter, '_event2'); },
                _event2: (val) => { called = true; }
            });
            var called;
            emitter.on('foo', emitter, '_event');
            emitter.on('foo', emitter, '_event2');

            emitter.emit('foo')
            assert(called);
            called = false;
            emitter.emit('foo')
            assert(!called);
        });
        it('should remove all listeners', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one'); },
                _event2: (val) => { calls.push('two'); }
            });
            var cemitter = new Emitter({
                _event: (val) => { calls.push('three'); },
            });
            var calls = [];
            emitter.on('foo', emitter, '_event');
            emitter.on('bar', emitter, '_event2');
            emitter.on('foo', cemitter, '_event');

            emitter.emit('foo');
            emitter.emit('bar');

            emitter.off();

            emitter.emit('foo');
            emitter.emit('bar');

            assert.deepEqual(calls, [ 'one', 'three', 'two' ]);
        });
        it('should remove all listeners for an event', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one'); },
                _event2: (val) => { calls.push('two'); }
            });
            var calls = [];
            emitter.on('foo', emitter, '_event');
            emitter.on('foo', emitter, '_event2');
            emitter.off('foo');

            emitter.emit('foo');
            emitter.emit('foo');

            assert.deepEqual(calls, []);
        });
        it('should remove all listeners for a listener model', () => {
            var emitter = new Emitter({
                _event: (val) => { calls.push('one'); },
                _event2: (val) => { calls.push('two'); }
            });
            var cemitter = new Emitter({
                _event: (val) => { calls.push('three'); },
            });
            var calls = [];
            sinon.stub(emitter, '_event', (val) => { calls.push('one'); });
            sinon.stub(emitter, '_event2', (val) => { calls.push('two'); });
            sinon.stub(cemitter, '_event', (val) => { calls.push('three'); });
            emitter.on('foo', emitter, '_event');
            emitter.on('foo', emitter, '_event2');
            emitter.on('foo', cemitter, '_event');
            emitter.off('foo', emitter);

            emitter.emit('foo');

            assert.deepEqual(calls, [ 'three' ]);
        });
    });
    describe('#hasListeners()', () => {
        it('should return true when a event have listeners', () => {
            var emitter = new Emitter();
            assert.strictEqual(emitter.hasListeners('foo'), false);
            emitter.on('foo', emitter, '_event');
            assert.strictEqual(emitter.hasListeners('foo'), true);
            assert.strictEqual(emitter.hasListeners('bar'), false);
            emitter.off();
            assert.strictEqual(emitter.hasListeners('foo'), false);
        });
    });
});
