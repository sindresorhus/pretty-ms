import parseMilliseconds from 'parse-ms';

const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.000_000_1;
// The largest scaled value whose ulp is still below 1, so a relative rounding correction cannot cross into the next integer.
const EXACT_SCALING_RANGE = 2 ** 52;
const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
const ONE_MINUTE_IN_BIGINT_MILLISECONDS = BigInt(ONE_MINUTE_IN_MILLISECONDS);
const ONE_SECOND_IN_MILLISECONDS = 1000;
const ONE_SECOND_IN_BIGINT_MILLISECONDS = BigInt(ONE_SECOND_IN_MILLISECONDS);
const MAX_DECIMAL_DIGITS = 100; // The most `Number#toFixed()` accepts.

// `toFixed()` throws for anything outside 0-100, and a `NaN` count would leak into the output as `NaN`.
const decimalDigits = (value, defaultValue) => typeof value === 'number' && !Number.isNaN(value)
	? Math.min(Math.max(Math.trunc(value), 0), MAX_DECIMAL_DIGITS)
	: defaultValue;

// Scaling by a power of ten carries up to half a ulp of error, which under-reports the last digit once it outgrows the fixed epsilon. It can only be absorbed while a ulp of the scaled value stays below 1.
const scalingEpsilon = scaledValue => Math.abs(scaledValue) < EXACT_SCALING_RANGE
	? Math.max(SECOND_ROUNDING_EPSILON, (Math.abs(scaledValue) * Number.EPSILON) / 2)
	: SECOND_ROUNDING_EPSILON;

const floorDecimals = (value, decimalDigits) => {
	const scaledValue = value * (10 ** decimalDigits);
	const flooredValue = Math.floor(scaledValue + scalingEpsilon(scaledValue));

	// Dividing the floored value back by the power of ten reintroduces the error the flooring just removed, so the digits are placed directly instead.
	if (decimalDigits > 0 && Number.isSafeInteger(flooredValue)) {
		const digits = flooredValue.toFixed(0).padStart(decimalDigits + 1, '0');
		return `${digits.slice(0, -decimalDigits)}.${digits.slice(-decimalDigits)}`;
	}

	return (flooredValue / (10 ** decimalDigits)).toFixed(decimalDigits);
};

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

	const secondsDecimalDigits = decimalDigits(options.secondsDecimalDigits, 1);

	// A duration under a minute has no coarser field, so hiding the seconds would leave nothing to carry its value.
	const hideSeconds = options.hideSeconds && milliseconds >= ONE_MINUTE_IN_MILLISECONDS;

	// The smallest value the seconds field can render, in milliseconds.
	const minimumDecimalSeconds = (10 ** -secondsDecimalDigits) * 1000;

	// `subSecondsAsDecimals` moves the value into the seconds field, so it only applies when that field is rendered and can represent the value. Otherwise the value is lost.
	const canShowAsDecimalSeconds = options.subSecondsAsDecimals
		&& !hideSeconds
		&& milliseconds >= minimumDecimalSeconds;

	if (!hideSeconds) {
		// The sub-millisecond fields come from scaling the value to nanoseconds. `parse-ms` derives them from `milliseconds * 1000` and `milliseconds * 1e6`, which truncates a product landing a hair below the integer and leaves the exact integer range above ~9e9ms. Scaling the whole value recovers the intended decimal best, so it is only reduced modulo a second where that scaling would overflow.
		const reduceSubMilliseconds = !Number.isSafeInteger(Math.trunc(Number(milliseconds)) * 1e6);
		const scaledNanoseconds = Number(
			reduceSubMilliseconds
				? (isBigInt ? milliseconds % ONE_SECOND_IN_BIGINT_MILLISECONDS : milliseconds % ONE_SECOND_IN_MILLISECONDS)
				: milliseconds,
		) * 1e6;
		const totalNanoseconds = Math.trunc(scaledNanoseconds + scalingEpsilon(scaledNanoseconds)) % 1e6;
		const microseconds = Math.floor(totalNanoseconds / 1000);
		const nanoseconds = totalNanoseconds % 1000;

		// The seconds within the minute, reduced before dividing so they stay exact at any magnitude. `parse-ms` takes them from `milliseconds / 1000 % 60`, which loses them once the quotient is large.
		const secondsWithinMinute = (
			isBigInt ? Number(milliseconds % ONE_MINUTE_IN_BIGINT_MILLISECONDS) : milliseconds % ONE_MINUTE_IN_MILLISECONDS
		) / 1000;

		if (
			options.separateMilliseconds
			|| options.formatSubMilliseconds
			|| (!options.colonNotation && milliseconds < 1000 && !canShowAsDecimalSeconds)
		) {
			const wholeMilliseconds = Number(parsed.milliseconds);

			add(Math.floor(secondsWithinMinute), 'second', 's');

			if (options.formatSubMilliseconds) {
				add(wholeMilliseconds, 'millisecond', 'ms');
				add(microseconds, 'microsecond', 'µs');
				add(nanoseconds, 'nanosecond', 'ns');
			} else {
				const millisecondsAndBelow = wholeMilliseconds + (totalNanoseconds / 1e6);

				const millisecondsDecimalDigits
					= decimalDigits(options.millisecondsDecimalDigits, 0);

				// Under a second, the zero field is dropped entirely, so a nonzero duration is clamped to the smallest representable value instead of rounding down onto it. The input is checked directly, as the sum above cannot represent a value below a nanosecond. From a second up, the seconds field carries the value, so the milliseconds round normally.
				const minimumMilliseconds = milliseconds > 0 && milliseconds < ONE_SECOND_IN_MILLISECONDS ? 10 ** -millisecondsDecimalDigits : 0;
				const maximumMilliseconds = 1000 - (10 ** -millisecondsDecimalDigits);
				const clampedMilliseconds
					= Math.min(Math.max(millisecondsAndBelow, minimumMilliseconds), maximumMilliseconds);

				const millisecondsString = (
					millisecondsDecimalDigits
						? clampedMilliseconds
						: Math.round(clampedMilliseconds)
				).toFixed(millisecondsDecimalDigits);

				add(
					Number.parseFloat(millisecondsString),
					'millisecond',
					'ms',
					millisecondsString,
				);
			}
		} else {
			// As for the milliseconds, the rounding epsilon must not carry the seconds into the next minute.
			const maximumSeconds = 60 - (10 ** -secondsDecimalDigits);
			const secondsFixed = floorDecimals(Math.min(secondsWithinMinute, maximumSeconds), secondsDecimalDigits);
			const secondsString = options.keepDecimalsOnWholeSeconds
				? secondsFixed
				: secondsFixed.replace(/\.0+$/, '');
			add(Number.parseFloat(secondsString), 'second', 's', secondsString);
		}
	}

	const separator = options.colonNotation ? ':' : ' ';
	if (typeof options.unitCount === 'number') {
		// `Math.max()` propagates `NaN`, and `slice(0, NaN)` is an empty slice, which would drop every unit.
		result = result.slice(0, Math.max(options.unitCount, 1) || Infinity);
	}

	const output = result.length === 0
		? '0' + (options.verbose ? ' milliseconds' : 'ms')
		: result.join(separator);

	// Rounding can leave nothing but zeros behind, and a signed zero reads as a negative duration.
	return /[1-9]/.test(output) ? sign + output : output;
}
