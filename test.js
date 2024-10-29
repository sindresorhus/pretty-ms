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
	title: 'have hideYearAndDays,hideSeconds and colonNotation options',
	cases: [
		[(1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '15:59'],
		[(1000 * 60 * 67 * 24 * 465) + (1000 * 60 * 60 * 15) + (1000 * 60 * 59) + (1000 * 59) + 543, {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '12477:59'],
		[BigInt(Number.MAX_VALUE), {hideSeconds: true, hideYearAndDays: true, colonNotation: true}, '49935920412842103004035395481028987999464046534956943499699299111988127994452371877941544064657466158761238598198439573398422590802628939657907651862093754718347197382375356132290413913997035817798852363459759428417939788028673041157169044258923152298554951723373534213538382550255361078125112229495590:14'],
	],
});

test('Big numbers', t => {
	t.is(
		prettyMilliseconds(Number.MAX_VALUE),
		'5700447535712568547083700427941645003808085225292279557374304680873482979681895890593452082909683139015032646149857723394516742095667500822861020052921074432454921864096959420926519725467567456931340929884912090099277441972878147362726992943838905852030073647982034630974035871792165820638724934142y 218d 8h 8m 48s',
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
