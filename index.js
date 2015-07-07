'use strict';
var parseMs = require('parse-ms');
var plur = require('plur');
var numberIsNan = require('number-is-nan');

module.exports = function (ms, opts) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number');
	}

	if (numberIsNan(ms)) {
		return undefined;
	}

	opts = opts || {};

	if (ms < 1000) {
		return Math.ceil(ms) + (opts.verbose ? ' ' + plur('millisecond', Math.ceil(ms)) : 'ms');
	}

	var ret = [];

	var add = function (val, long, short, valStr) {
		if (val === 0) {
			return;
		}

		var postfix = opts.verbose ? ' ' + plur(long, val) : short;

		ret.push((valStr || val) + postfix);
	};

	var parsed = parseMs(ms);

	add(parsed.days, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (opts.compact) {
		add(parsed.seconds, 'second', 's');
		return '~' + ret[0];
	}

	var sec = ms / 1000 % 60;
	var secDecimalDigits = typeof opts.secDecimalDigits === 'number' ? opts.secDecimalDigits : 1;
	var secStr = sec.toFixed(secDecimalDigits).replace(/\.0$/, '');
	add(sec, 'second', 's', secStr);

	return ret.join(' ');
};
