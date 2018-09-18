'use strict';
const parseMs = require('parse-ms');

const pluralize = (word, count) => count === 1 ? word : word + 's';

module.exports = (ms, options = {}) => {
	if (!Number.isFinite(ms)) {
		throw new TypeError('Expected a finite number');
	}

	if (options.compact) {
		options.secDecimalDigits = 0;
		options.msDecimalDigits = 0;
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

	if (options.separateMs || options.formatSubMs || ms < 1000) {
		add(parsed.seconds, 'second', 's');
		if (options.formatSubMs) {
			add(parsed.milliseconds, 'millisecond', 'ms');
			add(parsed.microseconds, 'microsecond', 'µs');
			add(parsed.nanoseconds, 'nanosecond', 'ns');
		} else {
			const msAndBelow = parsed.milliseconds + (parsed.microseconds / 1000) + (parsed.nanoseconds / 1e6);
			const msDecimalDigits = typeof options.msDecimalDigits === 'number' ? options.msDecimalDigits : 0;
			const msStr = msDecimalDigits ? msAndBelow.toFixed(msDecimalDigits) : Math.ceil(msAndBelow);
			add(parseFloat(msStr, 10), 'millisecond', 'ms', msStr);
		}
	} else {
		const sec = ms / 1000 % 60;
		const secDecimalDigits = typeof options.secDecimalDigits === 'number' ? options.secDecimalDigits : 1;
		const secFixed = sec.toFixed(secDecimalDigits);
		const secStr = options.keepDecimalsOnWholeSeconds ? secFixed : secFixed.replace(/\.0+$/, '');
		add(parseFloat(secStr, 10), 'second', 's', secStr);
	}

	if (ret.length === 0) {
		return '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	if (options.compact) {
		return '~' + ret[0];
	}

	if (typeof options.unitCount === 'number') {
		return '~' + ret.slice(0, Math.max(options.unitCount, 1)).join(' ');
	}

	return ret.join(' ');
};
