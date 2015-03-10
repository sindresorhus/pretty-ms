'use strict';
var assert = require('assert');
var prettyMs = require('./');

it('should prettify milliseconds', function () {
	assert.strictEqual(prettyMs(0), '0ms');
	assert.strictEqual(prettyMs(0.1), '1ms');
	assert.strictEqual(prettyMs(1), '1ms');
	assert.strictEqual(prettyMs(1000 + 400), '1.4s');
	assert.strictEqual(prettyMs(1000 * 2 + 400), '2.4s');
	assert.strictEqual(prettyMs(1000 * 55), '55s');
	assert.strictEqual(prettyMs(1000 * 67), '1m 7s');
	assert.strictEqual(prettyMs(1000 * 60 * 5), '5m');
	assert.strictEqual(prettyMs(1000 * 60 * 67), '1h 7m');
	assert.strictEqual(prettyMs(1000 * 60 * 60 * 12), '12h');
	assert.strictEqual(prettyMs(1000 * 60 * 60 * 40), '1d 16h');
	assert.strictEqual(prettyMs(1000 * 60 * 60 * 999), '41d 15h');
});

it('should have a compact option', function () {
	assert.strictEqual(prettyMs(1000 + 4, {compact: true}), '~1s');
	assert.strictEqual(prettyMs(1000 * 60 * 60 * 999, {compact: true}), '~41d');
});

it('should have a secDecimalDigits option', function () {
	assert.strictEqual(prettyMs(33333), '33.3s');
	assert.strictEqual(prettyMs(33333, {secDecimalDigits: 0}), '33s');
	assert.strictEqual(prettyMs(33333, {secDecimalDigits: 4}), '33.3330s');
});
