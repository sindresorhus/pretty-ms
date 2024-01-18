import parseMilliseconds from 'parse-ms';

const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.000_000_1;

export default function prettyMilliseconds(milliseconds, options = {}) {
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

	let result = [];

	const floorDecimals = (value, decimalDigits) => {
		const flooredInterimValue = Math.floor((value * (10 ** decimalDigits)) + SECOND_ROUNDING_EPSILON);
		const flooredValue = Math.round(flooredInterimValue) / (10 ** decimalDigits);
		return flooredValue.toFixed(decimalDigits);
	};

	const add = (value, long, short, valueString) => {
		if (
			(result.length === 0 || !options.colonNotation)
			&& isZero(value)
			&& !(options.colonNotation && short === 'm')) {
			return;
		}

		valueString = valueString ?? String(value);
		if (options.colonNotation) {
			const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else {
			valueString += options.verbose ? ' ' + pluralize(long, value) : short;
		}

		result.push(valueString);
	};

	const parsed = parseMilliseconds(milliseconds);

	add(BigInt(parsed.days) / 365n, 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (
		options.separateMilliseconds
		|| options.formatSubMilliseconds
		|| (!options.colonNotation && milliseconds < 1000)
	) {
		add(parsed.seconds, 'second', 's');
		if (options.formatSubMilliseconds) {
			add(parsed.milliseconds, 'millisecond', 'ms');
			add(parsed.microseconds, 'microsecond', 'µs');
			add(parsed.nanoseconds, 'nanosecond', 'ns');
		} else {
			const millisecondsAndBelow
				= parsed.milliseconds
				+ (parsed.microseconds / 1000)
				+ (parsed.nanoseconds / 1e6);

			const millisecondsDecimalDigits
				= typeof options.millisecondsDecimalDigits === 'number'
					? options.millisecondsDecimalDigits
					: 0;

			const roundedMilliseconds = millisecondsAndBelow >= 1
				? Math.round(millisecondsAndBelow)
				: Math.ceil(millisecondsAndBelow);

			const millisecondsString = millisecondsDecimalDigits
				? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
				: roundedMilliseconds;

			add(
				Number.parseFloat(millisecondsString),
				'millisecond',
				'ms',
				millisecondsString,
			);
		}
	} else {
		const seconds = (milliseconds / 1000) % 60;
		const secondsDecimalDigits
			= typeof options.secondsDecimalDigits === 'number'
				? options.secondsDecimalDigits
				: 1;
		const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
		const secondsString = options.keepDecimalsOnWholeSeconds
			? secondsFixed
			: secondsFixed.replace(/\.0+$/, '');
		add(Number.parseFloat(secondsString), 'second', 's', secondsString);
	}

	if (result.length === 0) {
		return '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	if (options.compact) {
		return result[0];
	}

	const separator = options.colonNotation ? ':' : ' ';
	if (typeof options.unitCount === 'number') {
		result = result.slice(0, Math.max(options.unitCount, 1))
	}

	return result.join(separator);
}
