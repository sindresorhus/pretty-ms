import test from 'ava';
import prettyMilliseconds from './index.js';

test('prettify milliseconds', t => {
	t.is(prettyMilliseconds(0), '0ms');
	t.is(prettyMilliseconds(0.1), '1ms');
	t.is(prettyMilliseconds(1), '1ms');
	t.is(prettyMilliseconds(999), '999ms');
	t.is(prettyMilliseconds(1000), '1s');
	t.is(prettyMilliseconds(1000 + 400), '1.4s');
	t.is(prettyMilliseconds((1000 * 2) + 400), '2.4s');
	t.is(prettyMilliseconds(1000 * 55), '55s');
	t.is(prettyMilliseconds(1000 * 67), '1m 7s');
	t.is(prettyMilliseconds(1000 * 60 * 5), '5m');
	t.is(prettyMilliseconds(1000 * 60 * 67), '1h 7m');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 12), '12h');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 40), '1d 16h');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 999), '41d 15h');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 24 * 465), '1y 100d');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465), '1y 154d 6h');
	t.is(prettyMilliseconds(119_999), '1m 59.9s');
	t.is(prettyMilliseconds(120_000), '2m');
	t.is(prettyMilliseconds(Number.MAX_SAFE_INTEGER), '285616y 151d 8h 59m 0.9s');
	t.is(prettyMilliseconds(Number.MAX_VALUE), '5700447535712568547083700427941645003808085225292279557374304680873482979681895890593452082909683139015032646149857723394516742095667500822861020052921074432454921864096959420926519725467567456931340929884912090099277441972878147362726992943838905852030073647982034630974035871792165820638724934142y 218d 8h 8m 48s');
});

test('have a compact option', t => {
	t.is(prettyMilliseconds(1000 + 4, {compact: true}), '1s');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 999, {compact: true}), '41d');
	t.is(prettyMilliseconds(1000 * 60 * 60 * 24 * 465, {compact: true}), '1y');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {compact: true}), '1y');
});

test('have a unitCount option', t => {
	t.is(prettyMilliseconds(1000 * 60, {unitCount: 0}), '1m');
	t.is(prettyMilliseconds(1000 * 60, {unitCount: 1}), '1m');
	t.is(prettyMilliseconds(1000 * 60 * 67, {unitCount: 1}), '1h');
	t.is(prettyMilliseconds(1000 * 60 * 67, {unitCount: 2}), '1h 7m');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {unitCount: 1}), '1y');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {unitCount: 2}), '1y 154d');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {unitCount: 3}), '1y 154d 6h');
});

test('have a secondsDecimalDigits option', t => {
	t.is(prettyMilliseconds(10_000), '10s');
	t.is(prettyMilliseconds(33_333), '33.3s');
	t.is(prettyMilliseconds(999, {secondsDecimalDigits: 0}), '999ms');
	t.is(prettyMilliseconds(1000, {secondsDecimalDigits: 0}), '1s');
	t.is(prettyMilliseconds(1999, {secondsDecimalDigits: 0}), '1s');
	t.is(prettyMilliseconds(2000, {secondsDecimalDigits: 0}), '2s');
	t.is(prettyMilliseconds(33_333, {secondsDecimalDigits: 0}), '33s');
	t.is(prettyMilliseconds(33_333, {secondsDecimalDigits: 4}), '33.3330s');
});

test('have a millisecondsDecimalDigits option', t => {
	t.is(prettyMilliseconds(33.333), '33ms');
	t.is(prettyMilliseconds(33.333, {millisecondsDecimalDigits: 0}), '33ms');
	t.is(prettyMilliseconds(33.333, {millisecondsDecimalDigits: 4}), '33.3330ms');
});

test('have a keepDecimalsOnWholeSeconds option', t => {
	t.is(prettyMilliseconds(1000 * 33, {secondsDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}), '33.00s');
	t.is(prettyMilliseconds(1000 * 33.000_04, {secondsDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}), '33.00s');
});

test('have a verbose option', t => {
	const format = milliseconds => prettyMilliseconds(milliseconds, {verbose: true});

	t.is(format(0), '0 milliseconds');
	t.is(format(0.1), '1 millisecond');
	t.is(format(1), '1 millisecond');
	t.is(format(1000), '1 second');
	t.is(format(1000 + 400), '1.4 seconds');
	t.is(format((1000 * 2) + 400), '2.4 seconds');
	t.is(format(1000 * 5), '5 seconds');
	t.is(format(1000 * 55), '55 seconds');
	t.is(format(1000 * 67), '1 minute 7 seconds');
	t.is(format(1000 * 60 * 5), '5 minutes');
	t.is(format(1000 * 60 * 67), '1 hour 7 minutes');
	t.is(format(1000 * 60 * 60 * 12), '12 hours');
	t.is(format(1000 * 60 * 60 * 40), '1 day 16 hours');
	t.is(format(1000 * 60 * 60 * 999), '41 days 15 hours');
	t.is(format(1000 * 60 * 60 * 24 * 465), '1 year 100 days');
	t.is(format(1000 * 60 * 67 * 24 * 465), '1 year 154 days 6 hours');
});

test('have a separateMilliseconds option', t => {
	t.is(prettyMilliseconds(1100, {separateMilliseconds: false}), '1.1s');
	t.is(prettyMilliseconds(1100, {separateMilliseconds: true}), '1s 100ms');
});

test('have a formatSubMilliseconds option', t => {
	t.is(prettyMilliseconds(0.4, {formatSubMilliseconds: true}), '400µs');
	t.is(prettyMilliseconds(0.123_571, {formatSubMilliseconds: true}), '123µs 571ns');
	t.is(prettyMilliseconds(0.123_456_789, {formatSubMilliseconds: true}), '123µs 456ns');
	t.is(
		prettyMilliseconds((60 * 60 * 1000) + (23 * 1000) + 433 + 0.123_456, {
			formatSubMilliseconds: true,
		}),
		'1h 23s 433ms 123µs 456ns',
	);
});

test('work with verbose and compact options', t => {
	const format = milliseconds => prettyMilliseconds(milliseconds, {
		verbose: true,
		compact: true,
	});

	t.is(format(1000), '1 second');
	t.is(format(1000 + 400), '1 second');
	t.is(format((1000 * 2) + 400), '2 seconds');
	t.is(format(1000 * 5), '5 seconds');
	t.is(format(1000 * 55), '55 seconds');
	t.is(format(1000 * 67), '1 minute');
	t.is(format(1000 * 60 * 5), '5 minutes');
	t.is(format(1000 * 60 * 67), '1 hour');
	t.is(format(1000 * 60 * 60 * 12), '12 hours');
	t.is(format(1000 * 60 * 60 * 40), '1 day');
	t.is(format(1000 * 60 * 60 * 999), '41 days');
	t.is(format(1000 * 60 * 60 * 24 * 465), '1 year');
	t.is(format(1000 * 60 * 67 * 24 * 750), '2 years');
});

test('work with verbose and unitCount options', t => {
	t.is(prettyMilliseconds(1000 * 60, {verbose: true, unitCount: 1}), '1 minute');
	t.is(prettyMilliseconds(1000 * 60 * 67, {verbose: true, unitCount: 1}), '1 hour');
	t.is(prettyMilliseconds(1000 * 60 * 67, {verbose: true, unitCount: 2}), '1 hour 7 minutes');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, unitCount: 1}), '1 year');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, unitCount: 2}), '1 year 154 days');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, unitCount: 3}), '1 year 154 days 6 hours');
});

test('work with verbose and secondsDecimalDigits options', t => {
	const format = milliseconds => prettyMilliseconds(milliseconds, {
		verbose: true,
		secondsDecimalDigits: 4,
	});

	t.is(format(1000), '1 second');
	t.is(format(1000 + 400), '1.4000 seconds');
	t.is(format((1000 * 2) + 400), '2.4000 seconds');
	t.is(format((1000 * 5) + 254), '5.2540 seconds');
	t.is(format(33_333), '33.3330 seconds');
});

test('work with verbose and millisecondsDecimalDigits options', t => {
	const format = milliseconds => prettyMilliseconds(milliseconds, {
		verbose: true,
		millisecondsDecimalDigits: 4,
	});

	t.is(format(1), '1.0000 millisecond');
	t.is(format(1 + 0.4), '1.4000 milliseconds');
	t.is(format((1 * 2) + 0.4), '2.4000 milliseconds');
	t.is(format((1 * 5) + 0.254), '5.2540 milliseconds');
	t.is(format(33.333), '33.3330 milliseconds');
});

test('work with verbose and formatSubMilliseconds options', t => {
	t.is(
		prettyMilliseconds(0.4, {formatSubMilliseconds: true, verbose: true}),
		'400 microseconds',
	);
	t.is(
		prettyMilliseconds(0.123_571, {
			formatSubMilliseconds: true,
			verbose: true,
		}),
		'123 microseconds 571 nanoseconds',
	);
	t.is(
		prettyMilliseconds(0.123_456_789, {
			formatSubMilliseconds: true,
			verbose: true,
		}),
		'123 microseconds 456 nanoseconds',
	);
	t.is(
		prettyMilliseconds(0.001, {formatSubMilliseconds: true, verbose: true}),
		'1 microsecond',
	);
});

test('compact option overrides unitCount option', t => {
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, compact: true, unitCount: 1}), '1 year');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, compact: true, unitCount: 2}), '1 year');
	t.is(prettyMilliseconds(1000 * 60 * 67 * 24 * 465, {verbose: true, compact: true, unitCount: 3}), '1 year');
});

test('work with separateMilliseconds and formatSubMilliseconds options', t => {
	t.is(
		prettyMilliseconds(1010.340_067, {
			separateMilliseconds: true,
			formatSubMilliseconds: true,
		}),
		'1s 10ms 340µs 67ns',
	);
	t.is(
		prettyMilliseconds((60 * 1000) + 34 + 0.000_005, {
			separateMilliseconds: true,
			formatSubMilliseconds: true,
		}),
		'1m 34ms 5ns',
	);
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

test('properly rounds milliseconds with secondsDecimalDigits', t => {
	const format = milliseconds =>
		prettyMilliseconds(milliseconds, {
			verbose: true,
			secondsDecimalDigits: 0,
		});
	t.is(format(3 * 60 * 1000), '3 minutes');
	t.is(format((3 * 60 * 1000) - 1), '2 minutes 59 seconds');
	t.is(format(365 * 24 * 3600 * 1e3), '1 year');
	t.is(format((365 * 24 * 3600 * 1e3) - 1), '364 days 23 hours 59 minutes 59 seconds');
	t.is(format(24 * 3600 * 1e3), '1 day');
	t.is(format((24 * 3600 * 1e3) - 1), '23 hours 59 minutes 59 seconds');
	t.is(format(3600 * 1e3), '1 hour');
	t.is(format((3600 * 1e3) - 1), '59 minutes 59 seconds');
	t.is(format(2 * 3600 * 1e3), '2 hours');
	t.is(format((2 * 3600 * 1e3) - 1), '1 hour 59 minutes 59 seconds');
});

test('`colonNotation` option', t => {
	const format = (milliseconds, options) =>
		prettyMilliseconds(milliseconds, {
			colonNotation: true,
			...options,
		});
	// Default formats
	t.is(format(1000), '0:01');
	t.is(format(1543), '0:01.5');
	t.is(format(1000 * 60), '1:00');
	t.is(format(1000 * 90), '1:30');
	t.is(format(95_543), '1:35.5');
	t.is(format((1000 * 60 * 10) + 543), '10:00.5');
	t.is(format((1000 * 60 * 59) + (1000 * 59) + 543), '59:59.5');
	t.is(format((1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543), '15:59:59.5');

	// Together with `secondsDecimalDigits`
	t.is(format(999, {secondsDecimalDigits: 0}), '0:00');
	t.is(format(999, {secondsDecimalDigits: 1}), '0:00.9');
	t.is(format(999, {secondsDecimalDigits: 2}), '0:00.99');
	t.is(format(999, {secondsDecimalDigits: 3}), '0:00.999');
	t.is(format(1000, {secondsDecimalDigits: 0}), '0:01');
	t.is(format(1000, {secondsDecimalDigits: 1}), '0:01');
	t.is(format(1000, {secondsDecimalDigits: 2}), '0:01');
	t.is(format(1000, {secondsDecimalDigits: 3}), '0:01');
	t.is(format(1001, {secondsDecimalDigits: 0}), '0:01');
	t.is(format(1001, {secondsDecimalDigits: 1}), '0:01');
	t.is(format(1001, {secondsDecimalDigits: 2}), '0:01');
	t.is(format(1001, {secondsDecimalDigits: 3}), '0:01.001');
	t.is(format(1543, {secondsDecimalDigits: 0}), '0:01');
	t.is(format(1543, {secondsDecimalDigits: 1}), '0:01.5');
	t.is(format(1543, {secondsDecimalDigits: 2}), '0:01.54');
	t.is(format(1543, {secondsDecimalDigits: 3}), '0:01.543');
	t.is(format(95_543, {secondsDecimalDigits: 0}), '1:35');
	t.is(format(95_543, {secondsDecimalDigits: 1}), '1:35.5');
	t.is(format(95_543, {secondsDecimalDigits: 2}), '1:35.54');
	t.is(format(95_543, {secondsDecimalDigits: 3}), '1:35.543');
	t.is(format((1000 * 60 * 10) + 543, {secondsDecimalDigits: 3}), '10:00.543');
	t.is(format((1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {secondsDecimalDigits: 3}), '15:59:59.543');

	// Together with `keepDecimalsOnWholeSeconds`
	t.is(format(999, {secondsDecimalDigits: 0, keepDecimalsOnWholeSeconds: true}), '0:00');
	t.is(format(999, {secondsDecimalDigits: 1, keepDecimalsOnWholeSeconds: true}), '0:00.9');
	t.is(format(999, {secondsDecimalDigits: 2, keepDecimalsOnWholeSeconds: true}), '0:00.99');
	t.is(format(999, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}), '0:00.999');
	t.is(format(1000, {keepDecimalsOnWholeSeconds: true}), '0:01.0');
	t.is(format(1000, {secondsDecimalDigits: 0, keepDecimalsOnWholeSeconds: true}), '0:01');
	t.is(format(1000, {secondsDecimalDigits: 1, keepDecimalsOnWholeSeconds: true}), '0:01.0');
	t.is(format(1000, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}), '0:01.000');
	t.is(format(1000 * 90, {keepDecimalsOnWholeSeconds: true}), '1:30.0');
	t.is(format(1000 * 90, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}), '1:30.000');
	t.is(format(1000 * 60 * 10, {secondsDecimalDigits: 3, keepDecimalsOnWholeSeconds: true}), '10:00.000');

	// Together with `unitCount`
	t.is(format(1000 * 90, {secondsDecimalDigits: 0, unitCount: 1}), '1');
	t.is(format(1000 * 90, {secondsDecimalDigits: 0, unitCount: 2}), '1:30');
	t.is(format(1000 * 60 * 90, {secondsDecimalDigits: 0, unitCount: 3}), '1:30:00');
	t.is(format(95_543, {secondsDecimalDigits: 1, unitCount: 1}), '1');
	t.is(format(95_543, {secondsDecimalDigits: 1, unitCount: 2}), '1:35.5');
	t.is(format(95_543 + (1000 * 60 * 60), {secondsDecimalDigits: 1, unitCount: 3}), '1:01:35.5');

	// Make sure incompatible options fall back to `colonNotation`
	t.is(format((1000 * 60 * 59) + (1000 * 59) + 543, {formatSubMilliseconds: true}), '59:59.5');
	t.is(format((1000 * 60 * 59) + (1000 * 59) + 543, {separateMilliseconds: true}), '59:59.5');
	t.is(format((1000 * 60 * 59) + (1000 * 59) + 543, {verbose: true}), '59:59.5');
	t.is(format((1000 * 60 * 59) + (1000 * 59) + 543, {compact: true}), '59:59.5');

	// Big numbers
	t.is(format(Number.MAX_SAFE_INTEGER), '285616:151:08:59:00.9');
	t.is(format(Number.MAX_VALUE), '5700447535712568547083700427941645003808085225292279557374304680873482979681895890593452082909683139015032646149857723394516742095667500822861020052921074432454921864096959420926519725467567456931340929884912090099277441972878147362726992943838905852030073647982034630974035871792165820638724934142:218:08:08:48');
});
