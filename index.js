import parseMilliseconds from 'parse-ms';

const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.000_000_1;
const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n;

export default function prettyMilliseconds(milliseconds, options = {}) {
	const isBigInt = typeof milliseconds === 'bigint';
	if (!Number.isFinite(milliseconds) && !isBigInt) {
		throw new TypeError('Expected a finite number or bigint');
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

	const parsed = parseMilliseconds(milliseconds);
	const days = BigInt(parsed.days);

	add(days / 365n, 'year', 'y');
	add(days % 365n, 'day', 'd');
	add(Number(parsed.hours), 'hour', 'h');
	add(Number(parsed.minutes), 'minute', 'm');

	if (
		options.separateMilliseconds
		|| options.formatSubMilliseconds
		|| (!options.colonNotation && milliseconds < 1000)
	) {
		const seconds = Number(parsed.seconds);
		const milliseconds = Number(parsed.milliseconds);
		const microseconds = Number(parsed.microseconds);
		const nanoseconds = Number(parsed.nanoseconds);

		add(seconds, 'second', 's');

		if (options.formatSubMilliseconds) {
			add(milliseconds, 'millisecond', 'ms');
			add(microseconds, 'microsecond', 'µs');
			add(nanoseconds, 'nanosecond', 'ns');
		} else {
			const millisecondsAndBelow
				= milliseconds
				+ (microseconds / 1000)
				+ (nanoseconds / 1e6);

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
		const seconds = (
			(isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds)
			/ 1000
		) % 60;
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

	if (typeof options.unitCount === 'number') {
		const separator = options.colonNotation ? '' : ' ';
		return result.slice(0, Math.max(options.unitCount, 1)).join(separator);
	}

	return options.colonNotation ? result.join('') : result.join(' ');
}
