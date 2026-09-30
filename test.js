import {test} from 'node:test';
import assert from 'node:assert/strict';
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
	test(title, () => {
		const format = (milliseconds, options) =>
			prettyMilliseconds(milliseconds, {...defaultOptions, ...options});

		for (const testCase of cases) {
			const [
				milliseconds,
				options,
				expected,
			] = testCase.length === 3 ? testCase : [testCase[0], undefined, testCase[1]];

			assert.strictEqual(format(milliseconds, options), expected, `Number(${milliseconds})`);

			const bigint = toBigInt(milliseconds);
			if (typeof bigint === 'bigint') {
				assert.strictEqual(format(bigint, options), expected, `BigInt(${bigint}n)`);
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
		[1000 * 33.00004, {secondsDecimalDigits: 2}, '33.00s'],
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
		[999.999999, '999ms'],
		[1999.5, {separateMilliseconds: true}, '1s 999ms'],
		[59_999.5, {separateMilliseconds: true}, '59s 999ms'],
		[86_399_999.5, {separateMilliseconds: true}, '23h 59m 59s 999ms'],
		[1999.5, {separateMilliseconds: true, millisecondsDecimalDigits: 0}, '1s 999ms'],
		[999.95, {millisecondsDecimalDigits: 1}, '999.9ms'],
		[1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '1s 999.9ms'],
		[59_999.996, {separateMilliseconds: true, millisecondsDecimalDigits: 2}, '59s 999.99ms'],
		[86_399_999.9996, {separateMilliseconds: true, millisecondsDecimalDigits: 3}, '23h 59m 59s 999.999ms'],
		[999.99996, {millisecondsDecimalDigits: 4}, '999.9999ms'],
		[1999.999996, {separateMilliseconds: true, millisecondsDecimalDigits: 5}, '1s 999.99999ms'],
		[-1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '-1s 999.9ms'],
		[1999.95, {separateMilliseconds: true, millisecondsDecimalDigits: 1, verbose: true}, '1 second 999.9 milliseconds'],
		[998.96, {millisecondsDecimalDigits: 1}, '999.0ms'],
		[999.9, {millisecondsDecimalDigits: 1}, '999.9ms'],
		[1999, {separateMilliseconds: true, millisecondsDecimalDigits: 1}, '1s 999.0ms'],
		[0.999999, {millisecondsDecimalDigits: 3}, '1.000ms'],
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
		[0.123571, '123µs 571ns'],
		[0.123456789, '123µs 456ns'],
		[(60 * 60 * 1000) + (23 * 1000) + 433 + 0.123456, '1h 23s 433ms 123µs 456ns'],
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
		[0.123571, '123 microseconds 571 nanoseconds'],
		[0.123456789, '123 microseconds 456 nanoseconds'],
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
		[1010.340067, '1s 10ms 340µs 67ns'],
		[(60 * 1000) + 34 + 0.000005, '1m 34ms 5ns'],
	],
});

test('never drop every unit', () => {
	// `slice(0, NaN)` is an empty slice, which used to produce an empty string.
	assert.strictEqual(prettyMilliseconds(1000 * 60 * 67, {unitCount: NaN}), '1h 7m');
	assert.strictEqual(prettyMilliseconds(1000 * 60 * 67, {unitCount: Infinity}), '1h 7m');
	assert.strictEqual(prettyMilliseconds(1000 * 60 * 67, {unitCount: -1}), '1h');
});

test('clamp the decimal digit options to what toFixed accepts', () => {
	// `toFixed()` throws a RangeError outside 0-100, and a NaN digit count leaked into the output as `NaNs`.
	assert.strictEqual(prettyMilliseconds(1500, {secondsDecimalDigits: -1}), '1s');
	assert.strictEqual(prettyMilliseconds(1500, {secondsDecimalDigits: NaN}), '1.5s');
	assert.strictEqual(prettyMilliseconds(1500, {secondsDecimalDigits: Infinity}), prettyMilliseconds(1500, {secondsDecimalDigits: 100}));
	assert.strictEqual(prettyMilliseconds(500, {millisecondsDecimalDigits: -1}), '500ms');
	assert.strictEqual(prettyMilliseconds(500, {millisecondsDecimalDigits: NaN}), '500ms');
	assert.strictEqual(prettyMilliseconds(500, {millisecondsDecimalDigits: 101}), prettyMilliseconds(500, {millisecondsDecimalDigits: 100}));

	// A fractional count is truncated, not rejected.
	assert.strictEqual(prettyMilliseconds(1500, {secondsDecimalDigits: 0.5}), '1s');
	assert.strictEqual(prettyMilliseconds(500, {millisecondsDecimalDigits: 0.5}), '500ms');
});

test('keep the seconds component precise for large values', () => {
	// `milliseconds / 1000` loses sub-second precision above ~2^22ms, so the same 2.9s used to render as `2.89s`.
	assert.strictEqual(prettyMilliseconds(2900, {secondsDecimalDigits: 2}), '2.90s');
	assert.strictEqual(prettyMilliseconds(40_176_002_900, {secondsDecimalDigits: 2}), '1y 100d 2.90s');

	// The seconds component must not depend on the magnitude it is embedded in.
	for (const days of [0, 1, 100, 999, 10_000, 1_000_000]) {
		assert.strictEqual(
			prettyMilliseconds((days * 86_400_000) + 2900, {secondsDecimalDigits: 2}).split(' ').at(-1),
			'2.90s',
			`${days} days`,
		);
	}
});

test('keep the seconds component exact at high decimal digit counts', () => {
	// Reducing modulo 60 after dividing left a ulp-sized error that the fixed 1e-7 epsilon could not absorb from 6 digits up.
	assert.strictEqual(prettyMilliseconds(10_802_900, {secondsDecimalDigits: 6}), '3h 2.900000s');
	assert.strictEqual(prettyMilliseconds(10_802_900, {secondsDecimalDigits: 7}), '3h 2.9000000s');
	assert.strictEqual(prettyMilliseconds(3_607_700, {secondsDecimalDigits: 6}), '1h 7.700000s');
	assert.strictEqual(prettyMilliseconds(10_802_900n, {secondsDecimalDigits: 6}), '3h 2.900000s');
	assert.strictEqual(prettyMilliseconds(BigInt(Number.MAX_VALUE), {secondsDecimalDigits: 6}).split(' ').at(-1), '18.368000s');

	// A whole number of seconds must never render a non-zero fraction at any digit count.
	for (const seconds of [1, 2, 7, 13, 33, 59]) {
		for (let digits = 0; digits <= 9; digits++) {
			const milliseconds = (10_802_900 - 2900) + (seconds * 1000);
			const fraction = digits > 0 ? `.${'0'.repeat(digits)}` : '';
			assert.strictEqual(
				prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits, keepDecimalsOnWholeSeconds: true}).split(' ').at(-1),
				`${seconds}${fraction}s`,
				`${seconds}s at ${digits} digits`,
			);
		}
	}
});

test('never round the seconds component up to 60', () => {
	// The rounding epsilon is added to the scaled value, so a value just under a minute was carried over into a `60` field.
	assert.strictEqual(prettyMilliseconds(59_999.99999), '59.9s');
	assert.strictEqual(prettyMilliseconds(59_999.9999, {secondsDecimalDigits: 0}), '59s');
	assert.strictEqual(prettyMilliseconds(59_999.9999, {compact: true}), '59s');
	assert.strictEqual(prettyMilliseconds(59_999.9999, {colonNotation: true, secondsDecimalDigits: 0}), '0:59');
	assert.strictEqual(prettyMilliseconds(3_599_999.9999999), '59m 59.9s');
	assert.strictEqual(prettyMilliseconds(86_399_999.9999999), '23h 59m 59.9s');
	assert.strictEqual(prettyMilliseconds(59_999.9999999, {secondsDecimalDigits: 3}), '59.999s');
	assert.strictEqual(prettyMilliseconds(59_999.99999999, {secondsDecimalDigits: 4}), '59.9999s');
	assert.strictEqual(prettyMilliseconds(59_999.999999999, {secondsDecimalDigits: 5}), '59.99999s');
	assert.strictEqual(prettyMilliseconds(59_999.9999999999, {secondsDecimalDigits: 6}), '59.999999s');

	// The seconds field must never reach 60, whatever the digit count.
	for (let digits = 0; digits <= 9; digits++) {
		for (const milliseconds of [59_999.99999, 59_999.999999, 59_999.99999999, 59_999.9999999999]) {
			const seconds = Number(prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits}).split(' ').at(-1).replace('s', ''));
			assert.ok(seconds < 60, `${milliseconds}ms at ${digits} digits rendered ${seconds}s`);
		}
	}
});

test('never drop a nonzero duration to zero milliseconds', () => {
	// The zero field is dropped entirely, so a nonzero duration must never round down onto it.
	assert.strictEqual(prettyMilliseconds(0.0001), '1ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 0}), '1ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 1}), '0.1ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 2}), '0.01ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 3}), '0.001ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {millisecondsDecimalDigits: 4}), '0.0001ms');
	assert.strictEqual(prettyMilliseconds(0.0001, {separateMilliseconds: true, millisecondsDecimalDigits: 3}), '0.001ms');
	assert.strictEqual(prettyMilliseconds(0.9994, {millisecondsDecimalDigits: 1}), '1.0ms');
	assert.strictEqual(prettyMilliseconds(0.9994, {separateMilliseconds: true, millisecondsDecimalDigits: 1}), '1.0ms');

	// A real zero stays zero.
	assert.strictEqual(prettyMilliseconds(0, {millisecondsDecimalDigits: 3}), '0ms');
	assert.strictEqual(prettyMilliseconds(0n, {millisecondsDecimalDigits: 3}), '0ms');
	assert.strictEqual(prettyMilliseconds(0, {verbose: true, millisecondsDecimalDigits: 3}), '0 milliseconds');
});

test('never render a signed zero', () => {
	// Rounding can leave nothing but zeros, and a signed zero reads as a negative duration.
	assert.strictEqual(prettyMilliseconds(-1, {colonNotation: true}), '0:00');

	// The sign still applies to anything that renders as a nonzero value.
	assert.strictEqual(prettyMilliseconds(-1), '-1ms');
	assert.strictEqual(prettyMilliseconds(-1, {subSecondsAsDecimals: true}), '-1ms');
	assert.strictEqual(prettyMilliseconds(-0.5, {subSecondsAsDecimals: true}), '-1ms');
	assert.strictEqual(prettyMilliseconds(-1, {subSecondsAsDecimals: true, verbose: true}), '-1 millisecond');
	assert.strictEqual(prettyMilliseconds(-1, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '-1ms');
	assert.strictEqual(prettyMilliseconds(-1, {colonNotation: true, secondsDecimalDigits: 3}), '-0:00.001');
	assert.strictEqual(prettyMilliseconds(-999, {colonNotation: true}), '-0:00.9');
	assert.strictEqual(prettyMilliseconds(-1000), '-1s');
	assert.strictEqual(prettyMilliseconds(-0), '0ms');
});

test('keep the value when the seconds field cannot show it', () => {
	// `subSecondsAsDecimals` moves the value into the seconds field, so a field that floors to zero destroyed the value.
	assert.strictEqual(prettyMilliseconds(900, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '900ms');
	assert.strictEqual(prettyMilliseconds(999, {subSecondsAsDecimals: true, secondsDecimalDigits: 0}), '999ms');
	assert.strictEqual(prettyMilliseconds(900, {subSecondsAsDecimals: true, compact: true}), '900ms');
	assert.strictEqual(prettyMilliseconds(50, {subSecondsAsDecimals: true, secondsDecimalDigits: 1}), '50ms');

	// A nonzero duration never renders as a bare zero at any digit count.
	for (const milliseconds of [1, 5, 50, 500, 900, 999]) {
		for (let digits = 0; digits <= 3; digits++) {
			const formatted = prettyMilliseconds(milliseconds, {subSecondsAsDecimals: true, secondsDecimalDigits: digits});
			assert.notStrictEqual(formatted, '0ms', `${milliseconds}ms at ${digits} digits`);
			assert.notStrictEqual(formatted, '0s', `${milliseconds}ms at ${digits} digits`);
		}
	}

	// The seconds field still wins whenever it can represent the value.
	assert.strictEqual(prettyMilliseconds(100, {subSecondsAsDecimals: true}), '0.1s');
	assert.strictEqual(prettyMilliseconds(500, {subSecondsAsDecimals: true}), '0.5s');
	assert.strictEqual(prettyMilliseconds(900, {subSecondsAsDecimals: true}), '0.9s');
	assert.strictEqual(prettyMilliseconds(0, {subSecondsAsDecimals: true}), '0ms');
	assert.strictEqual(prettyMilliseconds(1000, {subSecondsAsDecimals: true, keepDecimalsOnWholeSeconds: true}), '1.0s');
});

test('derive the sub-millisecond fields from the exact fractional part', () => {
	// `parse-ms` derives them from `milliseconds * 1000` and `milliseconds * 1e6`, which truncates a product landing a hair below the integer and leaves the exact integer range above ~9e9ms.
	assert.strictEqual(prettyMilliseconds(0.00397, {millisecondsDecimalDigits: 6}), '0.003970ms');
	assert.strictEqual(prettyMilliseconds(0.00397, {millisecondsDecimalDigits: 9}), '0.003970000ms');
	assert.strictEqual(prettyMilliseconds(0.00397, {separateMilliseconds: true, millisecondsDecimalDigits: 6}), '0.003970ms');
	assert.strictEqual(prettyMilliseconds(0.00397, {formatSubMilliseconds: true}), '3µs 970ns');
	assert.strictEqual(prettyMilliseconds(0.00399, {millisecondsDecimalDigits: 6}), '0.003990ms');
	assert.strictEqual(prettyMilliseconds(0.00401, {formatSubMilliseconds: true}), '4µs 10ns');
	assert.strictEqual(prettyMilliseconds(0.00785, {millisecondsDecimalDigits: 6}), '0.007850ms');
	assert.strictEqual(prettyMilliseconds(-0.00397, {formatSubMilliseconds: true}), '-3µs 970ns');

	assert.strictEqual(prettyMilliseconds(1_234_567_890_123, {formatSubMilliseconds: true}), '39y 53d 23h 31m 30s 123ms');
	assert.strictEqual(prettyMilliseconds(1_234_567_890_123, {separateMilliseconds: true}), '39y 53d 23h 31m 30s 123ms');
	assert.strictEqual(prettyMilliseconds(123_456_789_012_345, {formatSubMilliseconds: true}), '3914y 288d 30m 12s 345ms');
	assert.strictEqual(prettyMilliseconds(123_456_789_012_345, {separateMilliseconds: true}), '3914y 288d 30m 12s 345ms');
	assert.strictEqual(prettyMilliseconds(9_007_199_254_740_991, {separateMilliseconds: true}), '285616y 151d 8h 59m 991ms');
	assert.strictEqual(prettyMilliseconds(9_007_199_254_740_991, {separateMilliseconds: true, millisecondsDecimalDigits: 3}), '285616y 151d 8h 59m 991.000ms');
	assert.strictEqual(prettyMilliseconds(1e13 + 0.5, {formatSubMilliseconds: true}), '317y 35d 17h 46m 40s 500µs');

	// An exact integer millisecond value has no sub-millisecond part at any magnitude.
	for (const milliseconds of [1, 1000, 1_000_000, 9_007_199_254_740, 9_007_199_254_740_991, 1e15]) {
		const formatted = prettyMilliseconds(milliseconds, {formatSubMilliseconds: true});
		assert.ok(!formatted.includes('µs'), `${milliseconds}ms rendered ${formatted}`);
		assert.ok(!formatted.includes('ns'), `${milliseconds}ms rendered ${formatted}`);
		assert.strictEqual(prettyMilliseconds(milliseconds, {separateMilliseconds: true}), prettyMilliseconds(BigInt(milliseconds), {separateMilliseconds: true}), `${milliseconds}ms`);
	}
});

test('keep the last decimal digit exact at high digit counts', () => {
	// The rounding epsilon is added to the scaled value, where a ulp already exceeds 1e-7 from ~3.3e9 upward, so it became a no-op and the last digit was under-reported.
	assert.strictEqual(prettyMilliseconds(33_300, {secondsDecimalDigits: 8}), '33.30000000s');
	assert.strictEqual(prettyMilliseconds(33_300, {secondsDecimalDigits: 9}), '33.300000000s');
	assert.strictEqual(prettyMilliseconds(33_300, {secondsDecimalDigits: 11}), '33.30000000000s');

	// A value that is a whole number of microseconds renders exactly at every digit count.
	for (const milliseconds of [33_300, 1_603_300, 93_300, 12_345_600, 1234]) {
		const exactSeconds = (milliseconds % 60_000) / 1000;
		for (let digits = 1; digits <= 13; digits++) {
			assert.strictEqual(
				prettyMilliseconds(milliseconds, {secondsDecimalDigits: digits}).split(' ').at(-1),
				`${exactSeconds.toFixed(digits)}s`,
				`${milliseconds}ms at ${digits} digits`,
			);
		}
	}
});

test('keep the seconds when hiding them would leave no field', () => {
	// A duration under a minute has no coarser field, so hiding the seconds left nothing to carry the value.
	assert.strictEqual(prettyMilliseconds(45_000, {hideSeconds: true}), '45s');
	assert.strictEqual(prettyMilliseconds(59_999, {hideSeconds: true}), '59.9s');
	assert.strictEqual(prettyMilliseconds(1000, {hideSeconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(1000, {hideSeconds: true, compact: true}), '1s');
	assert.strictEqual(prettyMilliseconds(1, {hideSeconds: true}), '1ms');
	assert.strictEqual(prettyMilliseconds(0, {hideSeconds: true}), '0ms');
	assert.strictEqual(prettyMilliseconds(-1000, {hideSeconds: true}), '-1s');
	assert.strictEqual(prettyMilliseconds(900, {hideSeconds: true, subSecondsAsDecimals: true}), '0.9s');
	assert.strictEqual(prettyMilliseconds(1000, {colonNotation: true, hideSeconds: true}), '0:01');
	assert.strictEqual(prettyMilliseconds(45_000, {colonNotation: true, hideSeconds: true}), '0:45');
	assert.strictEqual(prettyMilliseconds(45_000, {hideSeconds: true, verbose: true}), '45 seconds');

	// From a minute up, the seconds are still hidden.
	assert.strictEqual(prettyMilliseconds(60_000, {hideSeconds: true}), '1m');
	assert.strictEqual(prettyMilliseconds(66_500, {hideSeconds: true}), '1m');
	assert.strictEqual(prettyMilliseconds(60_000, {colonNotation: true, hideSeconds: true}), '1');
	assert.strictEqual(prettyMilliseconds(66_500, {colonNotation: true, hideSeconds: true}), '1');
	assert.strictEqual(prettyMilliseconds(3_661_000, {colonNotation: true, hideSeconds: true}), '1:01');
});

test('agree on the seconds across every branch', () => {
	// The whole-seconds field, taken from the first part that carries a bare `s` unit.
	const secondsField = output => {
		for (const part of output.split(' ')) {
			if (/^[\d.]+s$/v.test(part)) {
				return Math.floor(Number(part.slice(0, -1)));
			}
		}

		return 0;
	};

	// The separate-milliseconds branch took its seconds from `parse-ms`, which loses them at large magnitudes, so the same input rendered differently per branch.
	assert.strictEqual(prettyMilliseconds(Number.MAX_VALUE, {separateMilliseconds: true}), '5700447535712568836077099940756733789893155997141203595856084373514626483384973958669126034778249561502424497511237394223564222694364034207523704550467323597984839883832803211448677387442583997465622415920063861691545637902816557209722493636863373550063350653353143175061459195234630260059944318435y 207d 22h 14m 18s 368ms');
	assert.strictEqual(prettyMilliseconds(1e300, {separateMilliseconds: true}).split(' ').slice(-3).join(' '), '42m 20s 160ms');
	assert.strictEqual(prettyMilliseconds(123_456_789_012_345, {separateMilliseconds: true}), '3914y 288d 30m 12s 345ms');

	for (const milliseconds of [1234, 59_999, 60_001, 3_600_000, 86_400_001, 1e13, 1e15, 9_007_199_254_740_991, 1e300, Number.MAX_VALUE]) {
		assert.strictEqual(
			secondsField(prettyMilliseconds(milliseconds, {separateMilliseconds: true})),
			secondsField(prettyMilliseconds(milliseconds, {formatSubMilliseconds: true})),
			`${milliseconds}ms`,
		);
		assert.strictEqual(
			secondsField(prettyMilliseconds(milliseconds, {separateMilliseconds: true})),
			secondsField(prettyMilliseconds(milliseconds)),
			`${milliseconds}ms against the decimal-seconds branch`,
		);
	}
});

test('round the milliseconds normally when the seconds carry the value', () => {
	// Float noise on a whole number of seconds must not add a millisecond.
	assert.strictEqual(prettyMilliseconds(0.1 * 3 * 10_000, {separateMilliseconds: true}), '3s');
	assert.strictEqual(prettyMilliseconds(1000.0000001, {separateMilliseconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(1000.4, {separateMilliseconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(1000.6, {separateMilliseconds: true}), '1s 1ms');
	assert.strictEqual(prettyMilliseconds(1000.0004, {separateMilliseconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(1000.0004, {separateMilliseconds: true, millisecondsDecimalDigits: 3}), '1s');
});

test('never drop a sub-nanosecond duration to zero', () => {
	// The sub-millisecond sum is below one nanosecond, so it reaches the clamp as an exact zero even though the input is not.
	assert.strictEqual(prettyMilliseconds(1e-9), '1ms');
	assert.strictEqual(prettyMilliseconds(5e-7), '1ms');
	assert.strictEqual(prettyMilliseconds(5e-324), '1ms');
	assert.strictEqual(prettyMilliseconds(-1e-9), '-1ms');
	assert.strictEqual(prettyMilliseconds(1e-9, {millisecondsDecimalDigits: 3}), '0.001ms');
	assert.strictEqual(prettyMilliseconds(1e-9, {separateMilliseconds: true}), '1ms');
	assert.strictEqual(prettyMilliseconds(0, {millisecondsDecimalDigits: 3}), '0ms');
	assert.strictEqual(prettyMilliseconds(0n, {millisecondsDecimalDigits: 3}), '0ms');

	// The whole seconds carry the value, so the milliseconds must stay a real zero.
	assert.strictEqual(prettyMilliseconds(1000, {separateMilliseconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(2000, {separateMilliseconds: true}), '2s');
	assert.strictEqual(prettyMilliseconds(1000, {formatSubMilliseconds: true}), '1s');
	assert.strictEqual(prettyMilliseconds(90_000, {separateMilliseconds: true}), '1m 30s');
	assert.strictEqual(prettyMilliseconds(1999.5, {separateMilliseconds: true}), '1s 999ms');
	assert.strictEqual(prettyMilliseconds(1000, {millisecondsDecimalDigits: 3}), '1s');
});

test('compute the hours and minutes from the exact remainder', () => {
	// `parse-ms` takes them from `milliseconds / 60_000 % 60`, which loses the low digits once the quotient is large, so the fields disagreed with the seconds.
	assert.strictEqual(prettyMilliseconds(1e22), '317097919837y 235d 17h 46m 40s');
	assert.strictEqual(prettyMilliseconds(1e22), prettyMilliseconds(10n ** 22n));
	assert.strictEqual(prettyMilliseconds(2.71e20), prettyMilliseconds(271_000_000_000_000_000_000n));
	// eslint-disable-next-line unicorn/prefer-bigint-literals -- the exact double 1e23 is 99999999999999991611392n, so a decimal literal would compare two different durations.
	assert.strictEqual(prettyMilliseconds(1e23), prettyMilliseconds(BigInt(1e23)));
	assert.strictEqual(prettyMilliseconds(1e22, {hideYearAndDays: true}), prettyMilliseconds(10n ** 22n, {hideYearAndDays: true}));

	// The `parse-ms` day quotient rounds up into the next day here, while the hours are exact, so the output was a whole day too long.
	assert.strictEqual(prettyMilliseconds(7.31784889677888e19), '2320474662y 311d 23h 59m 57.9s');

	// The hours, minutes and seconds must always describe the same instant.
	// The days come from the exact integer too, so even `Number.MAX_VALUE` matches the bigint path.
	for (const milliseconds of [1, 1000, 59_999, 60_001, 3_600_000, 3_660_000, 86_400_000, 1e13, 1e18, 1e20, 1e22, 1e23, Number.MAX_VALUE]) {
		assert.strictEqual(
			prettyMilliseconds(milliseconds),
			prettyMilliseconds(BigInt(milliseconds)),
			`${milliseconds}ms`,
		);
	}
});

test('throw on invalid', () => {
	assert.throws(() => {
		prettyMilliseconds('foo');
	}, TypeError);

	assert.throws(() => {
		prettyMilliseconds(NaN);
	}, TypeError);

	assert.throws(() => {
		prettyMilliseconds(Infinity);
	}, TypeError);
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
		[-1.234567, {formatSubMilliseconds: true}, '-1ms 234µs 567ns'],
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
		[900.123456, {formatSubMilliseconds: true}, '900ms 123µs 456ns'],
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

test('Big numbers', () => {
	// The seconds are the exact remainder within the day: `BigInt(Number.MAX_VALUE) % 86_400_000n` is `80_058_368n`, so `18.3s`, not `48s`.
	assert.strictEqual(
		prettyMilliseconds(Number.MAX_VALUE),
		'5700447535712568836077099940756733789893155997141203595856084373514626483384973958669126034778249561502424497511237394223564222694364034207523704550467323597984839883832803211448677387442583997465622415920063861691545637902816557209722493636863373550063350653353143175061459195234630260059944318435y 207d 22h 14m 18.3s',
	);
	assert.strictEqual(
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
	assert.strictEqual(
		prettyMilliseconds(duration),
		'492518667085565947437061434881381799446768678152999990681965689871663728164461750029012489404840762113809476584970910860915948840793052555530048073160376758865890165963154197469165726275039257381029776735493517650149543114803350542920023450224995474725473496449711570325310074468272054469179189112833218790y 18d 4h 3m 2s',
	);
	assert.strictEqual(
		prettyMilliseconds(duration, {colonNotation: true}),
		'492518667085565947437061434881381799446768678152999990681965689871663728164461750029012489404840762113809476584970910860915948840793052555530048073160376758865890165963154197469165726275039257381029776735493517650149543114803350542920023450224995474725473496449711570325310074468272054469179189112833218790:18:04:03:02',
	);
});

test('pure', () => {
	const runTest = options => {
		const copy = {...options};
		prettyMilliseconds(1337, options);
		prettyMilliseconds(1337, options);
		assert.deepStrictEqual(options, copy);
	};

	// Every option that overrides another, plus the numeric ones, must leave the caller's object alone.
	runTest({colonNotation: true});
	runTest({compact: true});
	runTest({
		colonNotation: true,
		compact: true,
		verbose: true,
		formatSubMilliseconds: true,
		separateMilliseconds: true,
		unitCount: 3,
	});
	runTest({
		compact: true,
		unitCount: 5,
		secondsDecimalDigits: 4,
		millisecondsDecimalDigits: 4,
	});
	runTest({hideYear: true});
	runTest({hideYearAndDays: true});
	runTest({hideSeconds: true});
	runTest({subSecondsAsDecimals: true});
	runTest({
		verbose: true,
		keepDecimalsOnWholeSeconds: true,
		secondsDecimalDigits: 3,
		millisecondsDecimalDigits: 3,
	});
});

test('reject anything that is not a finite number or bigint', () => {
	const invalid = [
		'foo',
		'',
		null,
		undefined,
		true,
		false,
		{},
		[],
		[1000],
		Symbol('x'),
		() => 1000,
		new Object(1000),
		NaN,
		Infinity,
		-Infinity,
		{valueOf: () => 1000},
	];

	for (const value of invalid) {
		assert.throws(
			() => {
				prettyMilliseconds(value);
			},
			TypeError,
			typeof value,
		);
	}
});

// The base each unit is counted against. `hideYear` and `hideYearAndDays` deliberately push the day and hour fields past theirs.
const unitBases = [
	['y', undefined],
	['d', 365],
	['h', 24],
	['m', 60],
	['s', 60],
	['ms', 1000],
	['µs', 1000],
	['ns', 1000],
];

const assertUnitsInRange = (output, options) => {
	for (const part of output.split(' ')) {
		// The units are alternatives of different lengths, so a character class would drop every multi-character one and silently match nothing.
		// eslint-disable-next-line regexp/prefer-character-class
		const match = /^(?<value>[\d.]+)(?<unit>ns|µs|ms|s|m|h|d|y)$/v.exec(part);
		if (!match) {
			continue;
		}

		const {value, unit} = match.groups;
		const base = unitBases.find(([name]) => name === unit)[1];
		if ((base === undefined) || (unit === 'd' && options.hideYear) || (unit === 'h' && options.hideYearAndDays)) {
			continue;
		}

		assert.ok(Number(value) < base, `${unit} field in ${output} for ${JSON.stringify(options)}`);
	}
};

test('never let a unit reach its base', () => {
	const flagSets = [
		{},
		{hideYear: true},
		{hideYearAndDays: true},
		{hideSeconds: true},
		{formatSubMilliseconds: true},
		{subSecondsAsDecimals: true},
		{compact: true},
	];
	const optionSets = [];

	for (const secondsDecimalDigits of [0, 3]) {
		for (const millisecondsDecimalDigits of [undefined, 3]) {
			for (const flags of flagSets) {
				optionSets.push({
					...flags,
					secondsDecimalDigits,
					...(millisecondsDecimalDigits !== undefined && {millisecondsDecimalDigits}),
				});
			}
		}
	}

	for (const options of optionSets) {
		for (let milliseconds = 0; milliseconds < 4000; milliseconds += 41) {
			assertUnitsInRange(prettyMilliseconds(milliseconds, options), options);
		}
	}
});

test('keep the sign symmetric and match the bigint path', () => {
	const optionSets = [
		{},
		{verbose: true},
		{compact: true},
		{colonNotation: true},
		{secondsDecimalDigits: 0},
		{secondsDecimalDigits: 9},
		{separateMilliseconds: true},
		{formatSubMilliseconds: true},
		{millisecondsDecimalDigits: 6},
		{keepDecimalsOnWholeSeconds: true, secondsDecimalDigits: 3},
		{unitCount: 2},
		{hideYear: true},
		{hideYearAndDays: true},
		{hideSeconds: true},
		{subSecondsAsDecimals: true},
	];

	for (const options of optionSets) {
		for (let index = 0; index < 600; index++) {
			const milliseconds = ((index * 4_996_408_911) % 1e12);
			const positive = prettyMilliseconds(milliseconds, options);

			assert.strictEqual(positive, prettyMilliseconds(BigInt(milliseconds), options), `${milliseconds}ms`);

			const expected = /[1-9]/v.test(positive) ? `-${positive}` : positive;
			assert.strictEqual(prettyMilliseconds(-milliseconds, options), expected, `-${milliseconds}ms`);
		}
	}
});

test('render a whole number of microseconds exactly', () => {
	// The exact sub-millisecond digits, computed with BigInt so the expectation carries no float error.
	// The digits start at 6 so the value is exactly representable, leaving the documented rounding nothing to decide.
	const exact = (nanoseconds, digits) => {
		const floored = (nanoseconds * (10n ** BigInt(digits))) / 1_000_000n;
		const text = floored.toString().padStart(digits + 1, '0');
		return `${text.slice(0, -digits)}.${text.slice(-digits)}ms`;
	};

	for (let microseconds = 1n; microseconds < 3000n; microseconds++) {
		const nanoseconds = microseconds * 1000n;
		const milliseconds = Number(nanoseconds) / 1e6;

		for (const digits of [6, 9, 12]) {
			assert.strictEqual(
				prettyMilliseconds(milliseconds, {separateMilliseconds: true, millisecondsDecimalDigits: digits}).split(' ').at(-1),
				exact(nanoseconds, digits),
				`${milliseconds}ms at ${digits} digits`,
			);
		}
	}
});
