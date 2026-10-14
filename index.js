import parseMilliseconds from 'parse-ms';

const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const SECOND_ROUNDING_EPSILON = 0.0000001;
// The largest scaled value whose ulp is still below 1, so a relative rounding correction cannot cross into the next integer.
const EXACT_SCALING_RANGE = 2 ** 52;
const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
const ONE_MINUTE_IN_BIGINT_MILLISECONDS = BigInt(ONE_MINUTE_IN_MILLISECONDS);
const ONE_SECOND_IN_MILLISECONDS = 1000;
const ONE_SECOND_IN_BIGINT_MILLISECONDS = BigInt(ONE_SECOND_IN_MILLISECONDS);
const ONE_HOUR_IN_MILLISECONDS = 60 * ONE_MINUTE_IN_MILLISECONDS;
const ONE_HOUR_IN_BIGINT_MILLISECONDS = BigInt(ONE_HOUR_IN_MILLISECONDS);
const ONE_DAY_IN_MILLISECONDS = 24 * ONE_HOUR_IN_MILLISECONDS;
const ONE_DAY_IN_BIGINT_MILLISECONDS = BigInt(ONE_DAY_IN_MILLISECONDS);
const MAX_DECIMAL_DIGITS = 100; // The most `Number#toFixed()` accepts.

// `toFixed()` throws for anything outside 0-100, and a `NaN` count would leak into the output as `NaN`.
const decimalDigits = (value, defaultValue) => typeof value === 'number' && !Number.isNaN(value)
	? Math.min(Math.max(Math.trunc(value), 0), MAX_DECIMAL_DIGITS)
	: defaultValue;

// Scaling by a power of ten carries up to half a ulp of error, which under-reports the last digit once it outgrows the fixed epsilon. It can only be absorbed while a ulp of the scaled value stays below 1.
const scalingEpsilon = scaledValue => Math.abs(scaledValue) < EXACT_SCALING_RANGE
	? Math.max(SECOND_ROUNDING_EPSILON, (Math.abs(scaledValue) * Number.EPSILON) / 2)
	: SECOND_ROUNDING_EPSILON;

// The value carries the float error of its own scaling, up to half a ulp, and of the input it was reduced from, which is proportional to that input rather than to the value. A fixed epsilon is too coarse for the first and too fine for the second. Each is only corrected while it stays below half a step. Past that, the digits are beyond what that error allows, so correcting them would only move them further off.
const floorDecimals = (value, digits, inputSeconds) => {
	const scaledValue = value * (10 ** digits);
	const correction = tolerance => tolerance < 0.5 ? tolerance : 0;
	const scalingTolerance = (scaledValue / 2) * Number.EPSILON;
	const inputTolerance = inputSeconds * (10 ** digits) * Number.EPSILON;
	const flooredValue = Math.floor(scaledValue + correction(scalingTolerance) + correction(inputTolerance));

	// Dividing the floored value back by the power of ten reintroduces the error the flooring just removed, so the digits are placed directly instead.
	if (digits > 0 && Number.isSafeInteger(flooredValue)) {
		const padded = flooredValue.toFixed(0).padStart(digits + 1, '0');
		return `${padded.slice(0, -digits)}.${padded.slice(-digits)}`;
	}

	return (flooredValue / (10 ** digits)).toFixed(digits);
};

export default function prettyMilliseconds(milliseconds, options) {
	const isBigInt = typeof milliseconds === 'bigint';
	if (!isBigInt && !Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number or bigint');
	}

	options = {...options};

	const sign = milliseconds < 0 ? '-' : '';
	// eslint-disable-next-line unicorn/prefer-math-abs -- `Math.abs()` throws on a bigint, and the bigint path reaches here.
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
			&& !(short === 'm' && options.colonNotation)) {
			return;
		}

		valueString ??= String(value);
		if (options.colonNotation) {
			const wholeDigits = valueString.includes('.') ? valueString.split('.', 1)[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else {
			valueString += options.verbose ? ' ' + pluralize(long, value) : short;
		}

		result.push(valueString);
	};

	const parsed = parseMilliseconds(milliseconds);
	// The days come from the exact integer, as the `parse-ms` quotient can round up into the next day once it is large.
	const days = (isBigInt ? milliseconds : BigInt(Math.trunc(milliseconds))) / ONE_DAY_IN_BIGINT_MILLISECONDS;

	// The hours and minutes within the day, reduced before dividing so they stay exact at any magnitude. `parse-ms` takes them from `milliseconds / 3_600_000 % 24` and `milliseconds / 60_000 % 60`, which lose their low digits once the quotient is large.
	const hoursWithinDay = Math.floor(
		Number(milliseconds % (isBigInt ? ONE_DAY_IN_BIGINT_MILLISECONDS : ONE_DAY_IN_MILLISECONDS))
		/ ONE_HOUR_IN_MILLISECONDS,
	);
	const minutesWithinHour = Math.floor(
		Number(milliseconds % (isBigInt ? ONE_HOUR_IN_BIGINT_MILLISECONDS : ONE_HOUR_IN_MILLISECONDS))
		/ ONE_MINUTE_IN_MILLISECONDS,
	);

	if (options.hideYearAndDays) {
		add((days * 24n) + BigInt(hoursWithinDay), 'hour', 'h');
	} else {
		if (options.hideYear) {
			add(days, 'day', 'd');
		} else {
			add(days / 365n, 'year', 'y');
			add(days % 365n, 'day', 'd');
		}

		add(hoursWithinDay, 'hour', 'h');
	}

	add(minutesWithinHour, 'minute', 'm');

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
		const isReduceSubMilliseconds = !Number.isSafeInteger(Math.trunc(Number(milliseconds)) * 1e6);
		const scaledNanoseconds = Number(
			isReduceSubMilliseconds
				? milliseconds % (isBigInt ? ONE_SECOND_IN_BIGINT_MILLISECONDS : ONE_SECOND_IN_MILLISECONDS)
				: milliseconds,
		) * 1e6;
		const flooredNanoseconds = Math.trunc(scaledNanoseconds + scalingEpsilon(scaledNanoseconds));
		const wholeMilliseconds = Number(parsed.milliseconds);
		// The scaling and its correction can round the value up into the next whole millisecond, which `parse-ms` does not count. Wrapping to zero would lose that millisecond, so the value is held at the last nanosecond instead.
		const totalNanoseconds = Math.floor(flooredNanoseconds / 1e6) % 1000 === wholeMilliseconds
			? flooredNanoseconds % 1e6
			: 999_999;
		const microseconds = Math.floor(totalNanoseconds / 1000);
		const nanoseconds = totalNanoseconds % 1000;

		// The seconds within the minute, reduced before dividing so they stay exact at any magnitude. `parse-ms` takes them from `milliseconds / 1000 % 60`, which loses them once the quotient is large.
		const secondsWithinMinute = (
			isBigInt ? Number(milliseconds % ONE_MINUTE_IN_BIGINT_MILLISECONDS) : milliseconds % ONE_MINUTE_IN_MILLISECONDS
		) / 1000;

		if (
			options.separateMilliseconds
			|| options.formatSubMilliseconds
			|| (!canShowAsDecimalSeconds && !options.colonNotation && milliseconds < 1000)
		) {
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
					Number(millisecondsString),
					'millisecond',
					'ms',
					millisecondsString,
				);
			}
		} else {
			// As for the milliseconds, the rounding epsilon must not carry the seconds into the next minute.
			const maximumSeconds = 60 - (10 ** -secondsDecimalDigits);
			// An integer reduces modulo a minute exactly, so only a fractional input carries error into the seconds.
			// eslint-disable-next-line unicorn/prefer-number-is-safe-integer -- Any integral number reduces exactly, including one past the safe range.
			const inputSeconds = isBigInt || Number.isInteger(milliseconds) ? 0 : milliseconds / 1000;
			const secondsFixed = floorDecimals(Math.min(secondsWithinMinute, maximumSeconds), secondsDecimalDigits, inputSeconds);
			const secondsString = options.keepDecimalsOnWholeSeconds
				? secondsFixed
				: secondsFixed.replace(/\.0+$/v, '');
			add(Number(secondsString), 'second', 's', secondsString);
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
	return /[1-9]/v.test(output) ? sign + output : output;
}
