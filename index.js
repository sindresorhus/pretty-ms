import parseMilliseconds from 'parse-ms';

const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.000_000_1;
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ONE_DAY_IN_BIGINT_MILLISECONDS = BigInt(ONE_DAY_IN_MILLISECONDS);
const MAX_DECIMAL_DIGITS = 100; // The most `Number#toFixed()` accepts.

// `toFixed()` throws for anything outside 0-100, and a `NaN` count would leak into the output as `NaN`.
const decimalDigits = (value, defaultValue) => typeof value === 'number' && !Number.isNaN(value)
	? Math.min(Math.max(Math.trunc(value), 0), MAX_DECIMAL_DIGITS)
	: defaultValue;

export default function prettyMilliseconds(milliseconds, options) {
	const isBigInt = typeof milliseconds === 'bigint';
	if (!isBigInt && !Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number or bigint');
	}

	options = {...options};

	const sign = milliseconds < 0 ? '-' : '';
	milliseconds = milliseconds < 0 ? -milliseconds : milliseconds; // Cannot use `Math.abs()` because of BigInt support.

	if (options.colonNotation) {
		options.compact = false;
		options.formatSubMilliseconds = false;
		options.separateMilliseconds = false;
		options.verbose = false;
	}

	if (options.compact) {
		options.unitCount = 1;
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

		valueString ??= String(value);
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
	const days = BigInt(parsed.days);

	if (options.hideYearAndDays) {
		add((BigInt(days) * 24n) + BigInt(parsed.hours), 'hour', 'h');
	} else {
		if (options.hideYear) {
			add(days, 'day', 'd');
		} else {
			add(days / 365n, 'year', 'y');
			add(days % 365n, 'day', 'd');
		}

		add(Number(parsed.hours), 'hour', 'h');
	}

	add(Number(parsed.minutes), 'minute', 'm');

	if (!options.hideSeconds) {
		if (
			options.separateMilliseconds
			|| options.formatSubMilliseconds
			|| (!options.colonNotation && milliseconds < 1000 && !options.subSecondsAsDecimals)
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
					= decimalDigits(options.millisecondsDecimalDigits, 0);

				const roundedMilliseconds = millisecondsAndBelow >= 1
					? Math.round(millisecondsAndBelow)
					: Math.ceil(millisecondsAndBelow);
				const maximumMilliseconds = 1000 - (10 ** -millisecondsDecimalDigits);

				const millisecondsString = millisecondsDecimalDigits
					? Math.min(millisecondsAndBelow, maximumMilliseconds).toFixed(millisecondsDecimalDigits)
					: Math.min(roundedMilliseconds, maximumMilliseconds);

				add(
					Number.parseFloat(millisecondsString),
					'millisecond',
					'ms',
					millisecondsString,
				);
			}
		} else {
			// Reduce modulo a day before dividing, as `milliseconds / 1000` loses its sub-second precision at large magnitudes.
			const seconds = (
				(isBigInt ? Number(milliseconds % ONE_DAY_IN_BIGINT_MILLISECONDS) : milliseconds % ONE_DAY_IN_MILLISECONDS)
				/ 1000
			) % 60;
			const secondsDecimalDigits
				= decimalDigits(options.secondsDecimalDigits, 1);
			const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
			const secondsString = options.keepDecimalsOnWholeSeconds
				? secondsFixed
				: secondsFixed.replace(/\.0+$/, '');
			add(Number.parseFloat(secondsString), 'second', 's', secondsString);
		}
	}

	if (result.length === 0) {
		return sign + '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	const separator = options.colonNotation ? ':' : ' ';
	if (typeof options.unitCount === 'number') {
		// `Math.max()` propagates `NaN`, and `slice(0, NaN)` is an empty slice, which would drop every unit.
		result = result.slice(0, Math.max(options.unitCount, 1) || Infinity);
	}

	return sign + result.join(separator);
}
