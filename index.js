'use strict';
const parseMilliseconds = require('parse-ms');
const languages = require('./languages');

function loadLanguage(options) {
	if (!options.language) {
		return languages.en;
	}

	let lang;
	if (options.languages && Object.keys(options.languages).includes(options.language)) {
		lang = options.languages[options.language];
	} else if (Object.keys(languages).includes(options.language)) {
		lang = languages[options.language];
	} else {
		return languages.en;
	}

	if (!lang.pluralize) {
		lang.pluralize = languages.en.pluralize;
	}

	return lang;
}

module.exports = (milliseconds, options = {}) => {
	if (!Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number');
	}

	if (options.compact) {
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}

	const result = [];

	const lang = loadLanguage(options);

	const add = (value, unit, valueString) => {
		if (value === 0) {
			return;
		}

		const postfix = options.verbose ? ' ' + lang.pluralize(lang.long[unit], value) : lang.short[unit];

		result.push((valueString || value) + postfix);
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

	add(Math.trunc(parsed.days / 365), 'y');
	add(parsed.days % 365, 'd');
	add(parsed.hours, 'h');
	add(parsed.minutes, 'm');

	if (
		options.separateMilliseconds ||
		options.formatSubMilliseconds ||
		milliseconds < 1000
	) {
		add(parsed.seconds, 's');
		if (options.formatSubMilliseconds) {
			add(parsed.milliseconds, 'ms');
			add(parsed.microseconds, 'µs');
			add(parsed.nanoseconds, 'ns');
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
		add(parseFloat(secondsString, 10), 's', secondsString);
	}

	if (result.length === 0) {
		return '0' + (options.verbose ? ` ${lang.pluralize(lang.long.ms)}` : lang.short.ms);
	}

	if (options.compact) {
		return '~' + result[0];
	}

	if (typeof options.unitCount === 'number') {
		return '~' + result.slice(0, Math.max(options.unitCount, 1)).join(' ');
	}

	return result.join(' ');
};
