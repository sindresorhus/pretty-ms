'use strict';
var parseMs = require('parse-ms');

function add(ret, val, postfix) {
	if (val > 0) {
		ret.push(val + postfix);
	}

	return ret;
}

module.exports = function (ms, opts) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number');
	}

	opts = opts || {};
	var plur = require('plur');

	if (ms < 1000) {
		return Math.ceil(ms) + (opts.verbose ? plur(' millisecond', Math.ceil(ms)) : 'ms');
	}

	var secDecimalDigits = typeof opts.secDecimalDigits === 'number' ? opts.secDecimalDigits : 1;
	var ret = [];
	var parsed = parseMs(ms);

	ret = add(ret, parsed.days, opts.verbose ? plur(' day', parsed.days) : 'd');
	ret = add(ret, parsed.hours, opts.verbose ? plur(' hour', parsed.hours) : 'h');
	ret = add(ret, parsed.minutes, opts.verbose ? plur(' minute', parsed.minutes) : 'm');

	if (opts.compact) {
		ret = add(ret, parsed.seconds, opts.verbose ? plur(' second', parsed.seconds) : 's');
		return '~' + ret[0];
	}

	var seconds = ms / 1000 % 60;
	var secondsFixed = seconds.toFixed(secDecimalDigits);

	ret = add(ret, secondsFixed.replace(/\.0$/, ''), opts.verbose ? plur(' second', seconds) : 's');

	return ret.join(' ');
};
