const isZero = value => value === 0 || value === 0n;
const pluralize = (word, count) => (count === 1 || count === 1n) ? word : `${word}s`;

const ONE_SECOND_IN_MILLISECONDS = 1000n;
const ONE_MINUTE_IN_MILLISECONDS = 60n * ONE_SECOND_IN_MILLISECONDS;
const ONE_HOUR_IN_MILLISECONDS = 60n * ONE_MINUTE_IN_MILLISECONDS;
const ONE_DAY_IN_MILLISECONDS = 24n * ONE_HOUR_IN_MILLISECONDS;
const MAX_DECIMAL_DIGITS = 100; // The same limit as `Number#toFixed()`, which keeps the output a sensible size.

// A negative or fractional count is not a digit count, and a `NaN` count would leak into the output as `NaN`.
const decimalDigits = (value, defaultValue) => typeof value === 'number' && !Number.isNaN(value)
	? Math.min(Math.max(Math.trunc(value), 0), MAX_DECIMAL_DIGITS)
	: defaultValue;

// The duration as the exact fraction `value / scale` milliseconds, so every field can be derived with exact BigInt arithmetic.
// An integer is exact at any size, including a number past the safe range. A fractional number is rounded to 15 significant digits, counting the whole duration, as that is all the precision a double has. This turns float noise back into the intended value: `0.57 * 100_000` is `56999.99999999999`, which is read as `57000`, and `999.9999999999999` is read as `1000`. Digits past the 15th are rounded away, so they are not exact.
const toExactMilliseconds = milliseconds => {
	// eslint-disable-next-line unicorn/prefer-number-is-safe-integer -- An integer past the safe range is still exact.
	if (typeof milliseconds === 'bigint' || Number.isInteger(milliseconds)) {
		return {value: BigInt(milliseconds), scale: 1n};
	}

	const [significand, exponent = '0'] = milliseconds.toPrecision(15).split('e', 2);
	const [whole, fraction = ''] = significand.split('.', 2);
	const digits = BigInt(whole + fraction);
	const decimals = fraction.length - Number(exponent);

	// From `1e15` up, the 15 digits end before the decimal point, so the exponent is positive. The fraction is then dropped and the duration is rounded to the nearest 10 milliseconds. A number from `2 ** 52` up is always an integer, so this only applies below that.
	return decimals < 0
		? {value: digits * (10n ** BigInt(-decimals)), scale: 1n}
		: {value: digits, scale: 10n ** BigInt(decimals)};
};

// Places the decimal point in a count of steps of `10 ** -digits`.
const formatSteps = (steps, digits) => {
	if (digits === 0) {
		return String(steps);
	}

	const padded = String(steps).padStart(digits + 1, '0');
	return `${padded.slice(0, -digits)}.${padded.slice(-digits)}`;
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
		// Dropping a field from the right would change what the remaining fields mean: `1:01:01` would become `1:01`, which reads as 1 minute.
		options.unitCount = undefined;
	}

	if (options.compact) {
		options.unitCount = 1;
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}

	let result = [];

	const add = (value, long, short, valueString) => {
		// Colon notation always shows the minutes, and the hours too when the seconds are hidden, so the last fields read as `m:ss`, or as `h:mm` without the seconds. A duration under a minute keeps its seconds, so it reads as `h:mm:ss` there.
		const isAlwaysShown = options.colonNotation && (short === 'm' || (short === 'h' && options.hideSeconds));

		if (
			!isAlwaysShown
			&& (result.length === 0 || !options.colonNotation)
			&& isZero(value)) {
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

	const {value, scale} = toExactMilliseconds(milliseconds);
	const second = ONE_SECOND_IN_MILLISECONDS * scale;
	const minute = ONE_MINUTE_IN_MILLISECONDS * scale;
	const hour = ONE_HOUR_IN_MILLISECONDS * scale;
	const day = ONE_DAY_IN_MILLISECONDS * scale;

	// The days, hours, minutes, seconds, and sub-millisecond fields are floored from the exact value, so none of them can round up into the next unit. Only the milliseconds, when they are the last unit, are rounded (see below).
	const days = value / day;
	const hoursWithinDay = (value % day) / hour;
	const minutesWithinHour = (value % hour) / minute;

	if (options.hideYearAndDays) {
		add((days * 24n) + hoursWithinDay, 'hour', 'h');
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
	const secondsStepsPerSecond = 10n ** BigInt(secondsDecimalDigits);

	// A duration under a minute has no coarser field, so hiding the seconds would leave nothing to carry its value.
	const hideSeconds = options.hideSeconds && value >= minute;

	// `subSecondsAsDecimals` moves the value into the seconds field, so it only applies when that field is rendered and can represent the value, at least one step of the seconds digits. Otherwise the value is lost.
	const canShowAsDecimalSeconds = options.subSecondsAsDecimals
		&& !hideSeconds
		&& value * secondsStepsPerSecond >= second;

	if (!hideSeconds) {
		const withinMinute = value % minute;

		if (
			options.separateMilliseconds
			|| options.formatSubMilliseconds
			|| (!canShowAsDecimalSeconds && !options.colonNotation && value < second)
		) {
			add(withinMinute / second, 'second', 's');

			if (options.formatSubMilliseconds) {
				// Floored to whole nanoseconds, the smallest unit shown. `formatSubMilliseconds` shows these as they are, so a duration under 1 nanosecond is `0ms` there.
				const subMillisecondNanoseconds = ((value % scale) * 1_000_000n) / scale;

				add((value % second) / scale, 'millisecond', 'ms');
				add(subMillisecondNanoseconds / 1000n, 'microsecond', 'µs');
				add(subMillisecondNanoseconds % 1000n, 'nanosecond', 'ns');
			} else {
				const millisecondsDecimalDigits
					= decimalDigits(options.millisecondsDecimalDigits, 0);
				const stepsPerMillisecond = 10n ** BigInt(millisecondsDecimalDigits);

				// Rounded half up in exact steps of the last digit, as a float sum of the parts can land a midpoint like `1.005` below it.
				let steps = ((2n * (value % second) * stepsPerMillisecond) + scale) / (2n * scale);

				// Under a second, the zero field is dropped entirely, so a nonzero duration is clamped to the smallest representable value instead of rounding down onto it. From a second up, the seconds field carries the value, so the milliseconds round normally.
				if (steps === 0n && value > 0n && value < second) {
					steps = 1n;
				}

				// The milliseconds are rounded, not floored, but never up to a full second, which would need the seconds field.
				const maximumSteps = (1000n * stepsPerMillisecond) - 1n;
				if (steps > maximumSteps) {
					steps = maximumSteps;
				}

				const millisecondsString = formatSteps(steps, millisecondsDecimalDigits);

				add(
					Number(millisecondsString),
					'millisecond',
					'ms',
					millisecondsString,
				);
			}
		} else {
			// Floored to the digit count, so the seconds never round up into the next step, or to `60s`.
			const secondsFixed = formatSteps((withinMinute * secondsStepsPerSecond) / second, secondsDecimalDigits);
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
