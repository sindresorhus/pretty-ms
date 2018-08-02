'use strict';
const parseMs = require('parse-ms');

const pluralize = (word, count) => count === 1 ? word : word + 's';

module.exports = (ms, options = {}) => {
	if (!Number.isFinite(ms)) {
		throw new TypeError('Expected a finite number');
	}

	if (ms < 1000) {
		const msDecimalDigits = typeof options.msDecimalDigits === 'number' ? options.msDecimalDigits : 0;
		return (msDecimalDigits ? ms.toFixed(msDecimalDigits) : Math.ceil(ms)) + (options.verbose ? ' ' + pluralize('millisecond', Math.ceil(ms)) : 'ms');
	}

	const ret = [];

	const add = (value, long, short, valueString) => {
		if (value === 0) {
			return;
		}

		const postfix = options.verbose ? ' ' + pluralize(long, value) : short;

		ret.push((valueString || value) + postfix);
	};

	const secDecimalDigits = typeof options.secDecimalDigits === 'number' ? options.secDecimalDigits : 1;

	if (secDecimalDigits < 1) {
		const diff = 1000 - (ms % 1000);
		if (diff < 500) {
			ms += diff;
		}
	}

	const parsed = parseMs(ms);

	add(Math.trunc(parsed.days / 365), 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (options.compact) {
		add(parsed.seconds, 'second', 's');
		return '~' + ret[0];
	}

	const sec = ms / 1000 % 60;
	const secFixed = sec.toFixed(secDecimalDigits);
	const secStr = options.keepDecimalsOnWholeSeconds ? secFixed : secFixed.replace(/\.0+$/, '');
	add(sec, 'second', 's', secStr);

	if (typeof options.unitsToShow === 'number') {
		return ret.slice(0, options.unitsToShow).join(' ');
	}

	return ret.join(' ');
};
