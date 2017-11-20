'use strict';
const parseMs = require('parse-ms');
const plur = require('plur');

module.exports = (ms, opts) => {
	if (!Number.isFinite(ms)) {
		throw new TypeError('Expected a finite number');
	}

	opts = opts || {};

	if (ms < 1000) {
		const msDecimalDigits = typeof opts.msDecimalDigits === 'number' ? opts.msDecimalDigits : 0;
		return (msDecimalDigits ? ms.toFixed(msDecimalDigits) : Math.ceil(ms)) + (opts.verbose ? ' ' + plur('millisecond', Math.ceil(ms)) : 'ms');
	}

	const ret = [];

	const add = (val, long, short, valStr) => {
		if (val === 0) {
			return;
		}

		const postfix = opts.verbose ? ' ' + plur(long, val) : short;

		ret.push((valStr || val) + postfix);
	};

	const parsed = parseMs(ms);

	add(Math.trunc(parsed.days / 365), 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (opts.compact) {
		add(parsed.seconds, 'second', 's');
		return '~' + ret[0];
	}

	const sec = ms / 1000 % 60;
	const secDecimalDigits = typeof opts.secDecimalDigits === 'number' ? opts.secDecimalDigits : 1;
	const secFixed = sec.toFixed(secDecimalDigits);
	const secStr = opts.keepDecimalsOnWholeSeconds ? secFixed : secFixed.replace(/\.0+$/, '');
	add(sec, 'second', 's', secStr);

	return ret.join(' ');
};
