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

it('should have a verbose option', function () {
	var fn = function (ms) {
		return prettyMs(ms, {verbose: true});
	};

	assert.strictEqual(fn(0), '0 milliseconds');
	assert.strictEqual(fn(0.1), '1 millisecond');
	assert.strictEqual(fn(1), '1 millisecond');
	assert.strictEqual(fn(1000), '1 second');
	assert.strictEqual(fn(1000 + 400), '1.4 seconds');
	assert.strictEqual(fn(1000 * 2 + 400), '2.4 seconds');
	assert.strictEqual(fn(1000 * 5), '5 seconds');
	assert.strictEqual(fn(1000 * 55), '55 seconds');
	assert.strictEqual(fn(1000 * 67), '1 minute 7 seconds');
	assert.strictEqual(fn(1000 * 60 * 5), '5 minutes');
	assert.strictEqual(fn(1000 * 60 * 67), '1 hour 7 minutes');
	assert.strictEqual(fn(1000 * 60 * 60 * 12), '12 hours');
	assert.strictEqual(fn(1000 * 60 * 60 * 40), '1 day 16 hours');
	assert.strictEqual(fn(1000 * 60 * 60 * 999), '41 days 15 hours');
});

it('should work with verbose and compact options', function () {
	var fn = function (ms) {
		return prettyMs(ms, {
			verbose: true,
			compact: true
		});
	};

	assert.strictEqual(fn(1000), '~1 second');
	assert.strictEqual(fn(1000 + 400), '~1 second');
	assert.strictEqual(fn(1000 * 2 + 400), '~2 seconds');
	assert.strictEqual(fn(1000 * 5), '~5 seconds');
	assert.strictEqual(fn(1000 * 55), '~55 seconds');
	assert.strictEqual(fn(1000 * 67), '~1 minute');
	assert.strictEqual(fn(1000 * 60 * 5), '~5 minutes');
	assert.strictEqual(fn(1000 * 60 * 67), '~1 hour');
	assert.strictEqual(fn(1000 * 60 * 60 * 12), '~12 hours');
	assert.strictEqual(fn(1000 * 60 * 60 * 40), '~1 day');
	assert.strictEqual(fn(1000 * 60 * 60 * 999), '~41 days');
});

it('should work with verbose and secDecimalDigits options', function () {
	var fn = function (ms) {
		return prettyMs(ms, {
			verbose: true,
			secDecimalDigits: 4
		});
	};

	assert.strictEqual(fn(1000), '1.0000 second');
	assert.strictEqual(fn(1000 + 400), '1.4000 seconds');
	assert.strictEqual(fn(1000 * 2 + 400), '2.4000 seconds');
	assert.strictEqual(fn(1000 * 5 + 254), '5.2540 seconds');
	assert.strictEqual(fn(33333), '33.3330 seconds');
});

it('should handle NaN input', function () {
	assert.strictEqual(prettyMs(NaN), undefined);
});
