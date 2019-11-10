'use strict';
const parseMilliseconds = require('parse-ms');

const pluralize = (word, count) => count === 1 ? word : word + 's';

module.exports = (milliseconds, options = {}) => {
	if (!Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number');
	}

	if (options.colonNotation) {
		options.compact = false;
		options.formatSubMilliseconds = false;
		options.separateMilliseconds = false;
		options.verbose = false;
	}

	if (options.compact) {
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}

	const result = [];

	const add = (value, long, short, valueString) => {
		if ((result.length === 0 || !options.colonNotation) && value === 0 && !(options.colonNotation && short === 'm')) {
			return;
		}

		valueString = (valueString || value || '0').toString();
		let prefix;
		let suffix;
		if (options.colonNotation) {
			prefix = result.length > 0 ? ':' : '';
			suffix = '';
			const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else {
			prefix = '';
			suffix = options.verbose ? ' ' + pluralize(long, value) : short;
		}

		result.push(prefix + valueString + suffix);
	};

	const secondsDecimalDigits =
		typeof options.secondsDecimalDigits === 'number' ?
			options.secondsDecimalDigits :
			1;

	if (secondsDecimalDigits < 1) {
		const difference = 1000 - (milliseconds % 1000);
		if (difference < 500) {
			milliseconds += difference;
		}
	}

	const parsed = parseMilliseconds(milliseconds);

	add(Math.trunc(parsed.days / 365), 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (
		options.separateMilliseconds ||
		options.formatSubMilliseconds ||
		milliseconds < 1000
	) {
		add(parsed.seconds, 'second', 's');
		if (options.formatSubMilliseconds) {
			add(parsed.milliseconds, 'millisecond', 'ms');
			add(parsed.microseconds, 'microsecond', 'µs');
			add(parsed.nanoseconds, 'nanosecond', 'ns');
		} else {
			const millisecondsAndBelow =
				parsed.milliseconds +
				(parsed.microseconds / 1000) +
				(parsed.nanoseconds / 1e6);

			const millisecondsDecimalDigits =
				typeof options.millisecondsDecimalDigits === 'number' ?
					options.millisecondsDecimalDigits :
					0;

			const millisecondsString = millisecondsDecimalDigits ?
				millisecondsAndBelow.toFixed(millisecondsDecimalDigits) :
				Math.ceil(millisecondsAndBelow);

			add(
				parseFloat(millisecondsString, 10),
				'millisecond',
				'ms',
				millisecondsString
			);
		}
	} else {
		const seconds = (milliseconds / 1000) % 60;
		const secondsDecimalDigits =
			typeof options.secondsDecimalDigits === 'number' ?
				options.secondsDecimalDigits :
				1;
		const secondsFixed = seconds.toFixed(secondsDecimalDigits);
		const secondsString = options.keepDecimalsOnWholeSeconds ?
			secondsFixed :
			secondsFixed.replace(/\.0+$/, '');
		add(parseFloat(secondsString, 10), 'second', 's', secondsString);
	}

	if (result.length === 0) {
		return '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	if (options.compact) {
		return '~' + result[0];
	}

	if (typeof options.unitCount === 'number') {
		return '~' + result.slice(0, Math.max(options.unitCount, 1)).join(' ');
	}

	return options.colonNotation ? result.join('') : result.join(' ');
};
