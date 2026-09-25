import test from 'ava';
import prettyMilliseconds from './index.js';

const toBigInt = milliseconds => {
	if (typeof milliseconds !== 'number') {
		return;
	}

	try {
		return BigInt(milliseconds);
	} catch {}
};

function runTests({title, defaultOptions, cases}) {
	test(title, t => {
		const format = (milliseconds, options) =>
			prettyMilliseconds(milliseconds, {...defaultOptions, ...options});

		for (const testCase of cases) {
			const [
				milliseconds,
				options,
				expected,
			] = testCase.length === 3 ? testCase : [testCase[0], undefined, testCase[1]];

			t.is(format(milliseconds, options), expected, `Number(${milliseconds})`);

			const bigint = toBigInt(milliseconds);
			if (typeof bigint === 'bigint') {
				t.is(format(bigint, options), expected, `BigInt(${bigint}n)`);
			}
		}
	});
}

runTests({
	title: 'prettify milliseconds',
	cases: [
		[0, '0ms'],
		[0.1, '1ms'],
		[1, '1ms'],
		[999, '999ms'],
		[1000, '1s'],
		[1000 + 400, '1.4s'],
		[(1000 * 2) + 400, '2.4s'],
		[1000 * 55, '55s'],
		[1000 * 67, '1m 7s'],
		[1000 * 60 * 5, '5m'],
		[1000 * 60 * 67, '1h 7m'],
		[1000 * 60 * 60 * 12, '12h'],
		[1000 * 60 * 60 * 40, '1d 16h'],
		[1000 * 60 * 60 * 999, '41d 15h'],
		[1000 * 60 * 60 * 24 * 465, '1y 100d'],
		[1000 * 60 * 67 * 24 * 465, '1y 154d 6h'],
		[119_999, '1m 59.9s'],
		[120_000, '2m'],
		[Number.MAX_SAFE_INTEGER, '285616y 151d 8h 59m 0.9s'],
	],
});

runTests({
	title: 'have a compact option',
	defaultOptions: {compact: true},
	cases: [
		[1000 + 4, '1s'],
		[1000 * 60 * 60 * 999, '41d'],
		[1000 * 60 * 60 * 24 * 465, '1y'],
		[1000 * 60 * 67 * 24 * 465, '1y'],
	],
});

runTests({
	title: 'have a unitCount option',
	cases: [
		[1000 * 60, {unitCount: 0}, '1m'],
		[1000 * 60, {unitCount: 1}, '1m'],
		[1000 * 60 * 67, {unitCount: 1}, '1h'],
		[1000 * 60 * 67, {unitCount: 2}, '1h 7m'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 1}, '1y'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 2}, '1y 154d'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 3}, '1y 154d 6h'],
	],
});

runTests({
	title: 'have a secondsDecimalDigits option',
	cases: [
		[10_000, '10s'],
		[33_333, '33.3s'],
		[999, {secondsDecimalDigits: 0}, '999ms'],
		[1000, {secondsDecimalDigits: 0}, '1s'],
		[1999, {secondsDecimalDigits: 0}, '1s'],
		[2000, {secondsDecimalDigits: 0}, '2s'],
		[33_333, {secondsDecimalDigits: 0}, '33s'],
		[33_333, {secondsDecimalDigits: 4}, '33.3330s'],
	],
});

runTests({
	title: 'have a millisecondsDecimalDigits option',
	cases: [
		[33.333, '33ms'],
		[33.333, {millisecondsDecimalDigits: 0}, '33ms'],
		[33.333, {millisecondsDecimalDigits: 4}, '33.3330ms'],
	],
});

runTests({
	title: 'have a keepDecimalsOnWholeSeconds option',
	defaultOptions: {keepDecimalsOnWholeSeconds: true},
	cases: [
		[1000 * 33, {secondsDecimalDigits: 2}, '33.00s'],
		[1000 * 33.000_04, {secondsDecimalDigits: 2}, '33.00s'],
	],
});

runTests({
	title: 'have a verbose option',
	defaultOptions: {verbose: true},
	cases: [
		[0, '0 milliseconds'],
		[0.1, '1 millisecond'],
		[1, '1 millisecond'],
		[1000, '1 second'],
		[1000 + 400, '1.4 seconds'],
		[(1000 * 2) + 400, '2.4 seconds'],
		[1000 * 5, '5 seconds'],
		[1000 * 55, '55 seconds'],
		[1000 * 67, '1 minute 7 seconds'],
		[1000 * 60 * 5, '5 minutes'],
		[1000 * 60 * 67, '1 hour 7 minutes'],
		[1000 * 60 * 60 * 12, '12 hours'],
		[1000 * 60 * 60 * 40, '1 day 16 hours'],
		[1000 * 60 * 60 * 999, '41 days 15 hours'],
		[1000 * 60 * 60 * 24 * 465, '1 year 100 days'],
		[1000 * 60 * 67 * 24 * 465, '1 year 154 days 6 hours'],
	],
});

runTests({
	title: 'have a separateMilliseconds option',
	cases: [
		[1100, {separateMilliseconds: false}, '1.1s'],
		[1100, {separateMilliseconds: true}, '1s 100ms'],
	],
});

runTests({
	title: 'never round the milliseconds component to 1000',
	cases: [
		[999.5, '999ms'],
		[999.999_999, '999ms'],
		[1999.5, {separateMilliseconds: true}, '1s 999ms'],
		[59_999.5, {separateMilliseconds: true}, '59s 999ms'],
		[86_399_999.5, {separateMilliseconds: true}, '23h 59m 59s 999ms'],
		[1999.5, {separateMilliseconds: true, millisecondsDecimalDigits: 0}, '1s 999ms'],
		[999.95, {millisecondsDecimalDigits: 1}, '999.9ms'],
		[1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '1s 999.9ms'],
		[59_999.996, {separateMilliseconds: true, millisecondsDecimalDigits: 2}, '59s 999.99ms'],
		[86_399_999.9996, {separateMilliseconds: true, millisecondsDecimalDigits: 3}, '23h 59m 59s 999.999ms'],
		[999.999_96, {millisecondsDecimalDigits: 4}, '999.9999ms'],
		[1999.999_996, {separateMilliseconds: true, millisecondsDecimalDigits: 5}, '1s 999.99999ms'],
		[-1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '-1s 999.9ms'],
		[1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1, verbose: true}, '1 second 999.9 milliseconds'],
		[998.96, {millisecondsDecimalDigits: 1}, '999.0ms'],
		[999.9, {millisecondsDecimalDigits: 1}, '999.9ms'],
		[1999, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '1s 999.0ms'],
		[0.999_999, {millisecondsDecimalDigits: 3}, '1.000ms'],
		[1999.5, {formatSubMilliseconds: true}, '1s 999ms 500µs'],
		[33.666, '34ms'],
		[0.1, '1ms'],
	],
});

runTests({
	title: 'have a formatSubMilliseconds option',
	defaultOptions: {formatSubMilliseconds: true},
	cases: [
		[0.4, '400µs'],
		[0.123_571, '123µs 571ns'],
		[0.123_456_789, '123µs 456ns'],
		[(60 * 60 * 1000) + (23 * 1000) + 433 + 0.123_456, '1h 23s 433ms 123µs 456ns'],
	],
});

runTests({
	title: 'work with verbose and compact options',
	defaultOptions: {verbose: true, compact: true},
	cases: [
		[1000, '1 second'],
		[1000 + 400, '1 second'],
		[(1000 * 2) + 400, '2 seconds'],
		[1000 * 5, '5 seconds'],
		[1000 * 55, '55 seconds'],
		[1000 * 67, '1 minute'],
		[1000 * 60 * 5, '5 minutes'],
		[1000 * 60 * 67, '1 hour'],
		[1000 * 60 * 60 * 12, '12 hours'],
		[1000 * 60 * 60 * 40, '1 day'],
		[1000 * 60 * 60 * 999, '41 days'],
		[1000 * 60 * 60 * 24 * 465, '1 year'],
		[1000 * 60 * 67 * 24 * 750, '2 years'],
	],
});

runTests({
	title: 'work with verbose and unitCount options',
	defaultOptions: {verbose: true},
	cases: [
		[1000 * 60, {unitCount: 1}, '1 minute'],
		[1000 * 60 * 67, {unitCount: 1}, '1 hour'],
		[1000 * 60 * 67, {unitCount: 2}, '1 hour 7 minutes'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 1}, '1 year'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 2}, '1 year 154 days'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 3}, '1 year 154 days 6 hours'],
	],
});

runTests({
	title: 'work with verbose and secondsDecimalDigits options',
	defaultOptions: {verbose: true, secondsDecimalDigits: 4},
	cases: [
		[1000, '1 second'],
		[1000 + 400, '1.4000 seconds'],
		[(1000 * 2) + 400, '2.4000 seconds'],
		[(1000 * 5) + 254, '5.2540 seconds'],
		[33_333, '33.3330 seconds'],
	],
});

runTests({
	title: 'work with verbose and millisecondsDecimalDigits options',
	defaultOptions: {verbose: true, millisecondsDecimalDigits: 4},
	cases: [
		[1, '1.0000 millisecond'],
		[1 + 0.4, '1.4000 milliseconds'],
		[(1 * 2) + 0.4, '2.4000 milliseconds'],
		[(1 * 5) + 0.254, '5.2540 milliseconds'],
		[33.333, '33.3330 milliseconds'],
	],
});

runTests({
	title: 'work with verbose and formatSubMilliseconds options',
	defaultOptions: {formatSubMilliseconds: true, verbose: true},
	cases: [
		[0.4, '400 microseconds'],
		[0.123_571, '123 microseconds 571 nanoseconds'],
		[0.123_456_789, '123 microseconds 456 nanoseconds'],
		[0.001, '1 microsecond'],
	],
});

runTests({
	title: 'compact option overrides unitCount option',
	defaultOptions: {verbose: true, compact: true},
	cases: [
		[1000 * 60 * 67 * 24 * 465, {unitCount: 1}, '1 year'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 2}, '1 year'],
		[1000 * 60 * 67 * 24 * 465, {unitCount: 3}, '1 year'],
	],
});

runTests({
	title: 'work with separateMilliseconds and formatSubMilliseconds options',
	defaultOptions: {separateMilliseconds: true, formatSubMilliseconds: true},
	cases: [
		[1010.340_067, '1s 10ms 340µs 67ns'],
		[(60 * 1000) + 34 + 0.000_005, '1m 34ms 5ns'],
	],
});

test('never drop every unit', t => {
	// `slice(0, NaN)` is an empty slice, which used to produce an empty string.
	t.is(prettyMilliseconds(1000 * 60 * 67, {unitCount: Number.NaN}), '1h 7m');
	t.is(prettyMilliseconds(1000 * 60 * 67, {unitCount: Number.POSITIVE_INFINITY}), '1h 7m');
	t.is(prettyMilliseconds(1000 * 60 * 67, {unitCount: -1}), '1h');
});

test('clamp the decimal digit options to what toFixed accepts', t => {
	// `toFixed()` throws a RangeError outside 0-100, and a NaN digit count leaked into the output as `NaNs`.
	t.is(prettyMilliseconds(1500, {secondsDecimalDigits: -1}), '1s');
	t.is(prettyMilliseconds(1500, {secondsDecimalDigits: Number.NaN}), '1.5s');
	t.is(prettyMilliseconds(1500, {secondsDecimalDigits: Number.POSITIVE_INFINITY}), prettyMilliseconds(1500, {secondsDecimalDigits: 100}));
	t.is(prettyMilliseconds(500, {millisecondsDecimalDigits: -1}), '500ms');
	t.is(prettyMilliseconds(500, {millisecondsDecimalDigits: Number.NaN}), '500ms');
	t.is(prettyMilliseconds(500, {millisecondsDecimalDigits: 101}), prettyMilliseconds(500, {millisecondsDecimalDigits: 100}));

	// A fractional count is truncated, not rejected.
	t.is(prettyMilliseconds(1500, {secondsDecimalDigits: 0.5}), '1s');
	t.is(prettyMilliseconds(500, {millisecondsDecimalDigits: 0.5}), '500ms');
});

test('keep the seconds component precise for large values', t => {
	// `milliseconds / 1000` loses sub-second precision above ~2^22ms, so the same 2.9s used to render as `2.89s`.
	t.is(prettyMilliseconds(2900, {secondsDecimalDigits: 2}), '2.90s');
	t.is(prettyMilliseconds(40_176_002_900, {secondsDecimalDigits: 2}), '1y 100d 2.90s');

	// The seconds component must not depend on the magnitude it is embedded in.
	for (const days of [0, 1, 100, 999, 10_000, 1_000_000]) {
		t.is(
			prettyMilliseconds((days * 86_400_000) + 2900, {secondsDecimalDigits: 2}).split(' ').at(-1),
			'2.90s',
			`${days} days`,
		);
	}
});

test('keep the seconds component exact at high decimal digit counts', t => {
	// Reducing modulo 60 after dividing left a ulp-sized error that the fixed 1e-7 epsilon could not absorb from 6 digits up.
	t.is(prettyMilliseconds(10_802_900, {secondsDecimalDigits: 6}), '3h 2.900000s');
	t.is(prettyMilliseconds(10_802_900, {secondsDecimalDigits: 7}), '3h 2.9000000s');
	t.is(prettyMilliseconds(3_607_700, {secondsDecimalDigits: 6}), '1h 7.700000s');
	t.is(prettyMilliseconds(10_802_900n, {secondsDecimalDigits: 6}), '3h 2.900000s');
	t.is(prettyMilliseconds(BigInt(Number.MAX_VALUE), {secondsDecimalDigits: 6}).split(' ').at(-1), '18.368000s');

	// A whole number of seconds must never render a non-zero fraction at any digit count.
	for (const seconds of [1, 2, 7, 13, 33, 59]) {
		for (let digits = 0; digits <= 9; digits++) {
			const milliseconds = (10_802_900 - 2900) + (seconds * 1000);
			const fraction = digits > 0 ? `.${'0'.repeat(digits)}` : '';
			t.is(
				prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits, keepDecimalsOnWholeSeconds: true}).split(' ').at(-1),
				`${seconds}${fraction}s`,
				`${seconds}s at ${digits} digits`,
			);
		}
	}
});

test('never round the seconds component up to 60', t => {
	// The rounding epsilon is added to the scaled value, so a value just under a minute was carried over into a `60` field.
	t.is(prettyMilliseconds(59_999.999_99), '59.9s');
	t.is(prettyMilliseconds(59_999.9999, {secondsDecimalDigits: 0}), '59s');
	t.is(prettyMilliseconds(59_999.9999, {compact: true}), '59s');
	t.is(prettyMilliseconds(59_999.9999, {colonNotation: true, secondsDecimalDigits: 0}), '0:59');
	t.is(prettyMilliseconds(3_599_999.999_999_9), '59m 59.9s');
	t.is(prettyMilliseconds(86_399_999.999_999_9), '23h 59m 59.9s');
	t.is(prettyMilliseconds(59_999.999_999_9, {secondsDecimalDigits: 3}), '59.999s');
	t.is(prettyMilliseconds(59_999.999_999_99, {secondsDecimalDigits: 4}), '59.9999s');
	t.is(prettyMilliseconds(59_999.999_999_999, {secondsDecimalDigits: 5}), '59.99999s');
	t.is(prettyMilliseconds(59_999.999_999_999_9, {secondsDecimalDigits: 6}), '59.999999s');

	// The seconds field must never reach 60, whatever the digit count.
	for (let digits = 0; digits <= 9; digits++) {
		for (const milliseconds of [59_999.999_99, 59_999.999_999, 59_999.999_999_99, 59_999.999_999_999_9]) {
			const seconds = Number(prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits}).split(' ').at(-1).replace('s', ''));
			t.true(seconds < 60, `${milliseconds}ms at ${digits} digits rendered ${seconds}s`);
		}
	}
});

test('never drop a nonzero duration to zero milliseconds', t => {
	// The zero field is dropped entirely, so a nonzero duration must never round down onto it.
	t.is(prettyMilliseconds(0.0001), '1ms');
	t.is(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 0}), '1ms');
	t.is(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 1}), '0.1ms');
	t.is(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 2}), '0.01ms');
	t.is(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 3}), '0.001ms');
	t.is(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 4}), '0.0001ms');
	t.is(prettyMilliseconds(0.0001, {separateMilliseconds: true, millisecondsDecimalDigits: 3}), '0.001ms');
	t.is(prettyMilliseconds(0.9994, {millisecondsDecimalDigits: 1}), '1.0ms');
	t.is(prettyMilliseconds(0.9994, {separateMilliseconds: true, millisecondsDecimalDigits: 1}), '1.0ms');

	// A real zero stays zero.
	t.is(prettyMilliseconds(0, {millisecondsDecimalDigits: 3}), '0ms');
	t.is(prettyMilliseconds(0n, {millisecondsDecimalDigits: 3}), '0ms');
	t.is(prettyMilliseconds(0, {verbose: true, millisecondsDecimalDigits: 3}), '0 milliseconds');
});

test('never render a signed zero', t => {
	// Rounding can leave nothing but zeros, and a signed zero reads as a negative duration.
	t.is(prettyMilliseconds(-1, {colonNotation: true}), '0:00');
	t.is(prettyMilliseconds(-1e-300), '0ms');
	t.is(prettyMilliseconds(-5e-324), '0ms');

	// The sign still applies to anything that renders as a nonzero value.
	t.is(prettyMilliseconds(-1), '-1ms');
	t.is(prettyMilliseconds(-1, {subSecondsAsDecimals: true}), '-1ms');
	t.is(prettyMilliseconds(-0.5, {subSecondsAsDecimals: true}), '-1ms');
	t.is(prettyMilliseconds(-1, {subSecondsAsDecimals: true, verbose: true}), '-1 millisecond');
	t.is(prettyMilliseconds(-1, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '-1ms');
	t.is(prettyMilliseconds(-1, {colonNotation: true, secondsDecimalDigits: 3}), '-0:00.001');
	t.is(prettyMilliseconds(-999, {colonNotation: true}), '-0:00.9');
	t.is(prettyMilliseconds(-1000), '-1s');
	t.is(prettyMilliseconds(-0), '0ms');
});

test('keep the value when the seconds field cannot show it', t => {
	// `subSecondsAsDecimals` moves the value into the seconds field, so a field that floors to zero destroyed the value.
	t.is(prettyMilliseconds(900, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '900ms');
	t.is(prettyMilliseconds(999, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '999ms');
	t.is(prettyMilliseconds(900, {subSecondsAsDecimals: true, compact: true}), '900ms');
	t.is(prettyMilliseconds(50, {subSecondsAsDecimals: true, secondsDecimalDigits: 1}), '50ms');

	// A nonzero duration never renders as a bare zero at any digit count.
	for (const milliseconds of [1, 5, 50, 500, 900, 999]) {
		for (let digits = 0; digits <= 3; digits++) {
			const formatted = prettyMilliseconds(milliseconds, {subSecondsAsDecimals: true, secondsDecimalDigits: digits});
			t.not(formatted, '0ms', `${milliseconds}ms at ${digits} digits`);
			t.not(formatted, '0s', `${milliseconds}ms at ${digits} digits`);
		}
	}

	// The seconds field still wins whenever it can represent the value.
	t.is(prettyMilliseconds(100, {subSecondsAsDecimals: true}), '0.1s');
	t.is(prettyMilliseconds(500, {subSecondsAsDecimals: true}), '0.5s');
	t.is(prettyMilliseconds(900, {subSecondsAsDecimals: true}), '0.9s');
	t.is(prettyMilliseconds(0, {subSecondsAsDecimals: true}), '0ms');
	t.is(prettyMilliseconds(1000, {subSecondsAsDecimals: true, keepDecimalsOnWholeSeconds: true}), '1.0s');
});

test('derive the sub-millisecond fields within the exact integer range', t => {
	// `parse-ms` derives them from `milliseconds * 1000` and `milliseconds * 1e6`, which leave the exact integer range above ~9e12ms and yield phantom values.
	t.is(prettyMilliseconds(1_234_567_890_123, {formatSubMilliseconds: true}), '39y 53d 23h 31m 30s 123ms');
	t.is(prettyMilliseconds(1_234_567_890_123, {separateMilliseconds: true}), '39y 53d 23h 31m 30s 123ms');
	t.is(prettyMilliseconds(123_456_789_012_345, {formatSubMilliseconds: true}), '3914y 288d 30m 12s 345ms');
	t.is(prettyMilliseconds(123_456_789_012_345, {separateMilliseconds: true}), '3914y 288d 30m 12s 345ms');
	t.is(prettyMilliseconds(9_007_199_254_740_991, {separateMilliseconds: true}), '285616y 151d 8h 59m 991ms');
	t.is(prettyMilliseconds(9_007_199_254_740_991, {separateMilliseconds: true, millisecondsDecimalDigits: 3}), '285616y 151d 8h 59m 991.000ms');

	// An exact integer millisecond value has no sub-millisecond part at any magnitude.
	for (const milliseconds of [1, 1000, 1_000_000, 9_007_199_254_740, 9_007_199_254_740_991, 1e15]) {
		const formatted = prettyMilliseconds(milliseconds, {formatSubMilliseconds: true});
		t.false(formatted.includes('µs'), `${milliseconds}ms rendered ${formatted}`);
		t.false(formatted.includes('ns'), `${milliseconds}ms rendered ${formatted}`);
		t.is(prettyMilliseconds(milliseconds, {separateMilliseconds: true}), prettyMilliseconds(BigInt(milliseconds), {separateMilliseconds: true}), `${milliseconds}ms`);
	}
});

test('keep the last decimal digit exact at high digit counts', t => {
	// The rounding epsilon is added to the scaled value, where a ulp already exceeds 1e-7 from ~3.3e9 upward, so it became a no-op and the last digit was under-reported.
	t.is(prettyMilliseconds(33_300, {secondsDecimalDigits: 8}), '33.30000000s');
	t.is(prettyMilliseconds(33_300, {secondsDecimalDigits: 9}), '33.300000000s');
	t.is(prettyMilliseconds(33_300, {secondsDecimalDigits: 11}), '33.30000000000s');

	// A value that is a whole number of microseconds renders exactly at every digit count.
	for (const milliseconds of [33_300, 1_603_300, 93_300, 12_345_600, 1234]) {
		const exactSeconds = (milliseconds % 60_000) / 1000;
		for (let digits = 1; digits <= 13; digits++) {
			t.is(
				prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits}).split(' ').at(-1),
				`${exactSeconds.toFixed(digits)}s`,
				`${milliseconds}ms at ${digits} digits`,
			);
		}
	}
});

test('keep the seconds when hiding them would leave no field', t => {
	// A duration under a minute has no coarser field, so hiding the seconds left nothing to carry the value.
	t.is(prettyMilliseconds(45_000, {hideSeconds: true}), '45s');
	t.is(prettyMilliseconds(59_999, {hideSeconds: true}), '59.9s');
	t.is(prettyMilliseconds(1000, {hideSeconds: true}), '1s');
	t.is(prettyMilliseconds(1000, {hideSeconds: true, compact: true}), '1s');
	t.is(prettyMilliseconds(1, {hideSeconds: true}), '1ms');
	t.is(prettyMilliseconds(0, {hideSeconds: true}), '0ms');
	t.is(prettyMilliseconds(-1000, {hideSeconds: true}), '-1s');
	t.is(prettyMilliseconds(900, {hideSeconds: true, subSecondsAsDecimals: true}), '0.9s');
	t.is(prettyMilliseconds(1000, {colonNotation: true, hideSeconds: true}), '0:01');
	t.is(prettyMilliseconds(45_000, {colonNotation: true, hideSeconds: true}), '0:45');
	t.is(prettyMilliseconds(45_000, {hideSeconds: true, verbose: true}), '45 seconds');

	// From a minute up, the seconds are still hidden.
	t.is(prettyMilliseconds(60_000, {hideSeconds: true}), '1m');
	t.is(prettyMilliseconds(66_500, {hideSeconds: true}), '1m');
	t.is(prettyMilliseconds(60_000, {colonNotation: true, hideSeconds: true}), '1');
	t.is(prettyMilliseconds(66_500, {colonNotation: true, hideSeconds: true}), '1');
	t.is(prettyMilliseconds(3_661_000, {colonNotation: true, hideSeconds: true}), '1:01');
});

test('throw on invalid', t => {
	t.throws(() => {
		prettyMilliseconds('foo');
	});

	t.throws(() => {
		prettyMilliseconds(Number.NaN);
	});

	t.throws(() => {
		prettyMilliseconds(Number.POSITIVE_INFINITY);
	});
});

runTests({
	title: 'properly rounds milliseconds with secondsDecimalDigits',
	defaultOptions: {verbose: true, secondsDecimalDigits: 0},
	cases: [
		[3 * 60 * 1000, '3 minutes'],
		[(3 * 60 * 1000) - 1, '2 minutes 59 seconds'],
		[365 * 24 * 3600 * 1e3, '1 year'],
		[(365 * 24 * 3600 * 1e3) - 1, '364 days 23 hours 59 minutes 59 seconds'],
		[24 * 3600 * 1e3, '1 day'],
		[(24 * 3600 * 1e3) - 1, '23 hours 59 minutes 59 seconds'],
		[3600 * 1e3, '1 hour'],
		[(3600 * 1e3) - 1, '59 minutes 59 seconds'],
		[2 * 3600 * 1e3, '2 hours'],
		[(2 * 3600 * 1e3) - 1, '1 hour 59 minutes 59 seconds'],
	],
});

runTests({
	title: 'negative milliseconds with options',
	cases: [
		[-0, '0ms'],
		[-0.1, '-1ms'],
		[-1, '-1ms'],
		[-999, '-999ms'],
		[-1000, '-1s'],
		[-1000 + 400, '-600ms'],
		[(-1000 * 2) + 400, '-1.6s'],
		[-13_370, '-13.3s'],
		[Number.MIN_SAFE_INTEGER, '-285616y 151d 8h 59m 0.9s'],
		// With compact option
		[-1000 * 60 * 60 * 999, {compact: true}, '-41d'],
		[-1000 * 60 * 60 * 24 * 465, {compact: true}, '-1y'],
		// With unit-count
		[-1000 * 60 * 67, {unitCount: 2}, '-1h 7m'],
		[-1000 * 60 * 67 * 24 * 465, {unitCount: 1}, '-1y'],
		[-1000 * 60 * 67 * 24 * 465, {unitCount: 2}, '-1y 154d'],
		// With verbose and secondsDecimalDigits
		[(-1000 * 5) - 254, {verbose: true, secondsDecimalDigits: 4}, '-5.2540 seconds'],
		[-33_333, {verbose: true, secondsDecimalDigits: 4}, '-33.3330 seconds'],
		// With verbose and compact
		[-1000 * 60 * 5, {verbose: true, compact: true}, '-5 minutes'],
		[-1000 * 60 * 67, {verbose: true, compact: true}, '-1 hour'],
		[-1000 * 60 * 60 * 12, {verbose: true, compact: true}, '-12 hours'],
		// With separateMilliseconds option
		[-1001, {separateMilliseconds: true}, '-1s 1ms'],
		[-1234, {separateMilliseconds: true}, '-1s 234ms'],
		// With formatSubMilliseconds option
		[-1.234_567, {formatSubMilliseconds: true}, '-1ms 234µs 567ns'],
		[-1234.567, {formatSubMilliseconds: true}, '-1s 234ms 567µs'],
	],
});

runTests({
	title: '`colonNotation` option',
	defaultOptions: {colonNotation: true},
	cases: [
		// Default formats
		[1000, '0:01'],
		[1543, '0:01.5'],
		[1000 * 60, '1:00'],
		[1000 * 90, '1:30'],
		[95_543, '1:35.5'],
		[(1000 * 60 * 10) + 543, '10:00.5'],
		[(1000 * 60 * 59) + (1000 * 59) + 543, '59:59.5'],
		[(1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, '15:59:59.5'],

		// Together with `secondsDecimalDigits`
		[999, {secondsDecimalDigits: 0}, '0:00'],
		[999, {secondsDecimalDigits: 1}, '0:00.9'],
		[999, {secondsDecimalDigits: 2}, '0:00.99'],
		[999, {secondsDecimalDigits: 3}, '0:00.999'],
		[1000, {secondsDecimalDigits: 0}, '0:01'],
		[1000, {secondsDecimalDigits: 1}, '0:01'],
		[1000, {secondsDecimalDigits: 2}, '0:01'],
		[1000, {secondsDecimalDigits: 3}, '0:01'],
		[1001, {secondsDecimalDigits: 0}, '0:01'],
		[1001, {secondsDecimalDigits: 1}, '0:01'],
		[1001, {secondsDecimalDigits: 2}, '0:01'],
		[1001, {secondsDecimalDigits: 3}, '0:01.001'],
		[1543, {secondsDecimalDigits: 0}, '0:01'],
		[1543, {secondsDecimalDigits: 1}, '0:01.5'],
		[1543, {secondsDecimalDigits: 2}, '0:01.54'],
		[1543, {secondsDecimalDigits: 3}, '0:01.543'],
		[95_543, {secondsDecimalDigits: 0}, '1:35'],
		[95_543, {secondsDecimalDigits: 1}, '1:35.5'],
		[95_543, {secondsDecimalDigits: 2}, '1:35.54'],
		[95_543, {secondsDecimalDigits: 3}, '1:35.543'],
		[(1000 * 60 * 10) + 543, {secondsDecimalDigits: 3}, '10:00.543'],
		[(1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {secondsDecimalDigits: 3}, '15:59:59.543'],

		// Together with `keepDecimalsOnWholeSeconds`
		[999, {secondsDecimalDigits: 0, keepDecimalsOnWholeSeconds: true}, '0:00'],
		[999, {secondsDecimalDigits: 1, keepDecimalsOnWholeSeconds: true}, '0:00.9'],
		[999, {secondsDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}, '0:00.99'],
		[999, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}, '0:00.999'],
		[1000, {keepDecimalsOnWholeSeconds: true}, '0:01.0'],
		[1000, {secondsDecimalDigits: 0, keepDecimalsOnWholeSeconds: true}, '0:01'],
		[1000, {secondsDecimalDigits: 1, keepDecimalsOnWholeSeconds: true}, '0:01.0'],
		[1000, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}, '0:01.000'],
		[1000 * 90, {keepDecimalsOnWholeSeconds: true}, '1:30.0'],
		[1000 * 90, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}, '1:30.000'],
		[1000 * 60 * 10, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}, '10:00.000'],

		// Together with `unitCount`
		[1000 * 90, {secondsDecimalDigits: 0, unitCount: 1}, '1'],
		[1000 * 90, {secondsDecimalDigits: 0, unitCount: 2}, '1:30'],
		[1000 * 60 * 90, {secondsDecimalDigits: 0, unitCount: 3}, '1:30:00'],
		[95_543, {secondsDecimalDigits: 1, unitCount: 1}, '1'],
		[95_543, {secondsDecimalDigits: 1, unitCount: 2}, '1:35.5'],
		[95_543 + (1000 * 60 * 60), {secondsDecimalDigits: 1, unitCount: 3}, '1:01:35.5'],

		// Make sure incompatible options fall back to `colonNotation`
		[(1000 * 60 * 59) + (1000 * 59) + 543, {formatSubMilliseconds: true}, '59:59.5'],
		[(1000 * 60 * 59) + (1000 * 59) + 543, {separateMilliseconds: true}, '59:59.5'],
		[(1000 * 60 * 59) + (1000 * 59) + 543, {verbose: true}, '59:59.5'],
		[(1000 * 60 * 59) + (1000 * 59) + 543, {compact: true}, '59:59.5'],

		// Big numbers
		[Number.MAX_SAFE_INTEGER, '285616:151:08:59:00.9'],
	],
});

runTests({
	title: 'have a hideYear option',
	cases: [
		[1000 * 60, {hideYear: true}, '1m'],
		[1000 * 60, {hideYear: false}, '1m'],
		[1000 * 60 * 67, {hideYear: true}, '1h 7m'],
		[1000 * 60 * 67, {hideYear: false}, '1h 7m'],
		[1000 * 60 * 67 * 24 * 465, {hideYear: false}, '1y 154d 6h'],
		[1000 * 60 * 67 * 24 * 465, {hideYear: true}, '519d 6h'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: false}, '1y 154d 6h 1m 6.5s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: true}, '519d 6h 1m 6.5s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: true, secondsDecimalDigits: 0}, '519d 6h 1m 6s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6000, {hideYear: true, keepDecimalsOnWholeSeconds: true}, '519d 6h 1m 6.0s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: true, separateMilliseconds: true}, '519d 6h 1m 6s 500ms'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: true, verbose: true}, '519 days 6 hours 1 minute 6.5 seconds'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYear: true, compact: true}, '519d'],
	],
});

runTests({
	title: 'have a hideYearAndDays option',
	cases: [
		[1000 * 60, {hideYearAndDays: true}, '1m'],
		[1000 * 60, {hideYearAndDays: false}, '1m'],
		[1000 * 60 * 67, {hideYearAndDays: false}, '1h 7m'],
		[1000 * 60 * 67, {hideYearAndDays: true}, '1h 7m'],
		[1000 * 60 * 67 * 24 * 465, {hideYearAndDays: false}, '1y 154d 6h'],
		[1000 * 60 * 67 * 24 * 465, {hideYearAndDays: true}, '12462h'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: false}, '1y 154d 6h 1m 6.5s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: true}, '12462h 1m 6.5s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: true, secondsDecimalDigits: 0}, '12462h 1m 6s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6000, {hideYearAndDays: true, keepDecimalsOnWholeSeconds: true}, '12462h 1m 6.0s'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: true, separateMilliseconds: true}, '12462h 1m 6s 500ms'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: true, verbose: true}, '12462 hours 1 minute 6.5 seconds'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60) + 6500, {hideYearAndDays: true, compact: true}, '12462h'],
	],
});

runTests({
	title: 'have a hideSeconds option',
	cases: [
		[(1000 * 60) + 6500, {hideSeconds: false}, '1m 6.5s'],
		[(1000 * 60) + 6500, {hideSeconds: true}, '1m'],
		[(1000 * 60) + 6500, {hideSeconds: true, secondsDecimalDigits: 3}, '1m'],
		[(1000 * 60) + 6500, {hideSeconds: true, keepDecimalsOnWholeSeconds: true}, '1m'],
		[(1000 * 60) + 6500, {hideSeconds: true, formatSubMilliseconds: true}, '1m'],
		[(1000 * 60) + 6500, {hideSeconds: true, separateMilliseconds: true}, '1m'],
		[(1000 * 60) + 6500, {hideSeconds: true, verbose: true}, '1 minute'],
		[(1000 * 60) + 6500, {hideSeconds: true, compact: true}, '1m'],
	],
});

runTests({
	title: 'have a subSecondsAsDecimals option',
	defaultOptions: {subSecondsAsDecimals: true},
	cases: [
		// Basic functionality
		[100, '0.1s'],
		[500, '0.5s'],
		[900, '0.9s'],
		[999, '0.9s'], // Floors to 0.9s
		[-900, '-0.9s'], // Negative values
		[0, '0ms'], // Zero falls back to ms
		[1, '1ms'], // Too small, falls back to ms

		// With precision options
		[1, {secondsDecimalDigits: 3}, '0.001s'],
		[900, {secondsDecimalDigits: 2}, '0.90s'],
		[1000, {keepDecimalsOnWholeSeconds: true}, '1.0s'],

		// Only affects sub-second values
		[1500, '1.5s'],

		// Works with other options
		[900, {verbose: true}, '0.9 seconds'],
		[900, {colonNotation: true}, '0:00.9'],

		// Doesn't interfere with these options (they take precedence)
		[900.123_456, {formatSubMilliseconds: true}, '900ms 123µs 456ns'],
		[1500, {separateMilliseconds: true}, '1s 500ms'],
	],
});

runTests({
	title: 'have hideYearAndDays,hideSeconds and colonNotation options',
	cases: [
		[(1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '15:59'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '12477:59'],
		[BigInt(Number.MAX_VALUE), {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '49935920412842103004035395481028987999464046534956943499699299111988127994452371877941544064657466158761238598198439573398422590802628939657907651862093754718347197382375356132290413913997035817798852363459759428417939788028673041157169044258923152298554951723373534213538382550255361078125112229495590:14'],
	],
});

test('Big numbers', t => {
	// The seconds are the exact remainder within the day: `BigInt(Number.MAX_VALUE) % 86_400_000n` is `80_058_368n`, so `18.3s`, not `48s`.
	t.is(
		prettyMilliseconds(Number.MAX_VALUE),
		'5700447535712568547083700427941645003808085225292279557374304680873482979681895890593452082909683139015032646149857723394516742095667500822861020052921074432454921864096959420926519725467567456931340929884912090099277441972878147362726992943838905852030073647982034630974035871792165820638724934142y 218d 8h 8m 18.3s',
	);
	t.is(
		prettyMilliseconds(BigInt(Number.MAX_VALUE)),
		'5700447535712568836077099940756733789893155997141203595856084373514626483384973958669126034778249561502424497511237394223564222694364034207523704550467323597984839883832803211448677387442583997465622415920063861691545637902816557209722493636863373550063350653353143175061459195234630260059944318435y 207d 22h 14m 18.3s',
	);

	const duration = 0n
		// 1ms
		+ 1n
		// 2s
		+ (2n * 1000n)
		// 3m
		+ (3n * 1000n * 60n)
		// 4h
		+ (4n * 1000n * 60n * 60n)
		// Days
		+ (BigInt(Number.MAX_VALUE) * 1000n * 60n * 60n * 24n);
	t.is(
		prettyMilliseconds(duration),
		'492518667085565947437061434881381799446768678152999990681965689871663728164461750029012489404840762113809476584970910860915948840793052555530048073160376758865890165963154197469165726275039257381029776735493517650149543114803350542920023450224995474725473496449711570325310074468272054469179189112833218790y 18d 4h 3m 2s',
	);
	t.is(
		prettyMilliseconds(duration, {colonNotation: true}),
		'492518667085565947437061434881381799446768678152999990681965689871663728164461750029012489404840762113809476584970910860915948840793052555530048073160376758865890165963154197469165726275039257381029776735493517650149543114803350542920023450224995474725473496449711570325310074468272054469179189112833218790:18:04:03:02',
	);
});

test('pure', t => {
	const runTest = options => {
		const copy = {...options};
		prettyMilliseconds(1, options);
		t.deepEqual(options, copy);
	};

	runTest({colonNotation: true});
	runTest({compact: true});
});
