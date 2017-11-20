import test from 'ava';
import m from '.';

test('prettify milliseconds', t => {
	t.is(m(0), '0ms');
	t.is(m(0.1), '1ms');
	t.is(m(1), '1ms');
	t.is(m(1000 + 400), '1.4s');
	t.is(m((1000 * 2) + 400), '2.4s');
	t.is(m(1000 * 55), '55s');
	t.is(m(1000 * 67), '1m 7s');
	t.is(m(1000 * 60 * 5), '5m');
	t.is(m(1000 * 60 * 67), '1h 7m');
	t.is(m(1000 * 60 * 60 * 12), '12h');
	t.is(m(1000 * 60 * 60 * 40), '1d 16h');
	t.is(m(1000 * 60 * 60 * 999), '41d 15h');
	t.is(m(1000 * 60 * 60 * 24 * 465), '1y 100d');
	t.is(m(1000 * 60 * 67 * 24 * 465), '1y 154d 6h');
});

test('have a compact option', t => {
	t.is(m(1000 + 4, {compact: true}), '~1s');
	t.is(m(1000 * 60 * 60 * 999, {compact: true}), '~41d');
	t.is(m(1000 * 60 * 60 * 24 * 465, {compact: true}), '~1y');
	t.is(m(1000 * 60 * 67 * 24 * 465, {compact: true}), '~1y');
});

test('have a secDecimalDigits option', t => {
	t.is(m(10000), '10s');
	t.is(m(33333), '33.3s');
	t.is(m(33333, {secDecimalDigits: 0}), '33s');
	t.is(m(33333, {secDecimalDigits: 4}), '33.3330s');
});

test('have a msDecimalDigits option', t => {
	t.is(m(33.333), '34ms');
	t.is(m(33.333, {msDecimalDigits: 0}), '34ms');
	t.is(m(33.333, {msDecimalDigits: 4}), '33.3330ms');
});

test('have a keepDecimalsOnWholeSeconds option', t => {
	t.is(m(1000 * 33, {secDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}), '33.00s');
	t.is(m(1000 * 33.00004, {secDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}), '33.00s');
});

test('have a verbose option', t => {
	const fn = ms => m(ms, {verbose: true});

	t.is(fn(0), '0 milliseconds');
	t.is(fn(0.1), '1 millisecond');
	t.is(fn(1), '1 millisecond');
	t.is(fn(1000), '1 second');
	t.is(fn(1000 + 400), '1.4 seconds');
	t.is(fn((1000 * 2) + 400), '2.4 seconds');
	t.is(fn(1000 * 5), '5 seconds');
	t.is(fn(1000 * 55), '55 seconds');
	t.is(fn(1000 * 67), '1 minute 7 seconds');
	t.is(fn(1000 * 60 * 5), '5 minutes');
	t.is(fn(1000 * 60 * 67), '1 hour 7 minutes');
	t.is(fn(1000 * 60 * 60 * 12), '12 hours');
	t.is(fn(1000 * 60 * 60 * 40), '1 day 16 hours');
	t.is(fn(1000 * 60 * 60 * 999), '41 days 15 hours');
	t.is(fn(1000 * 60 * 60 * 24 * 465), '1 year 100 days');
	t.is(fn(1000 * 60 * 67 * 24 * 465), '1 year 154 days 6 hours');
});

test('work with verbose and compact options', t => {
	const fn = ms => m(ms, {
		verbose: true,
		compact: true
	});

	t.is(fn(1000), '~1 second');
	t.is(fn(1000 + 400), '~1 second');
	t.is(fn((1000 * 2) + 400), '~2 seconds');
	t.is(fn(1000 * 5), '~5 seconds');
	t.is(fn(1000 * 55), '~55 seconds');
	t.is(fn(1000 * 67), '~1 minute');
	t.is(fn(1000 * 60 * 5), '~5 minutes');
	t.is(fn(1000 * 60 * 67), '~1 hour');
	t.is(fn(1000 * 60 * 60 * 12), '~12 hours');
	t.is(fn(1000 * 60 * 60 * 40), '~1 day');
	t.is(fn(1000 * 60 * 60 * 999), '~41 days');
	t.is(fn(1000 * 60 * 60 * 24 * 465), '~1 year');
	t.is(fn(1000 * 60 * 67 * 24 * 750), '~2 years');
});

test('work with verbose and secDecimalDigits options', t => {
	const fn = ms => m(ms, {
		verbose: true,
		secDecimalDigits: 4
	});

	t.is(fn(1000), '1 second');
	t.is(fn(1000 + 400), '1.4000 seconds');
	t.is(fn((1000 * 2) + 400), '2.4000 seconds');
	t.is(fn((1000 * 5) + 254), '5.2540 seconds');
	t.is(fn(33333), '33.3330 seconds');
});

test('work with verbose and msDecimalDigits options', t => {
	const fn = ms => m(ms, {
		verbose: true,
		msDecimalDigits: 4
	});

	t.is(fn(1), '1.0000 millisecond');
	t.is(fn(1 + 0.4), '1.4000 milliseconds');
	t.is(fn((1 * 2) + 0.400), '2.4000 milliseconds');
	t.is(fn((1 * 5) + 0.254), '5.2540 milliseconds');
	t.is(fn(33.333), '33.3330 milliseconds');
});

test('throw on invalid', t => {
	t.throws(() => {
		m('foo');
	});

	t.throws(() => {
		m(NaN);
	});

	t.throws(() => {
		m(Infinity);
	});
});
