import {expectType} from 'tsd';
import prettyMilliseconds = require('.');

expectType<string>(prettyMilliseconds(1335669000));
expectType<string>(prettyMilliseconds(1335669000, {secondsDecimalDigits: 1}));
expectType<string>(
	prettyMilliseconds(1335669000, {millisecondsDecimalDigits: 2})
);
expectType<string>(
	prettyMilliseconds(1335669000, {keepDecimalsOnWholeSeconds: true})
);
expectType<string>(prettyMilliseconds(1337, {compact: true}));
expectType<string>(prettyMilliseconds(1335669000, {unitCount: 2}));
expectType<string>(prettyMilliseconds(1335669000, {verbose: true}));
expectType<string>(
	prettyMilliseconds(1335669000, {separateMilliseconds: true})
);
expectType<string>(
	prettyMilliseconds(1335669000, {formatSubMilliseconds: true})
);
expectType<string>(
	prettyMilliseconds(1335669000, {language: 'xx', languages: {
		xx: {
			short: { y: 'Y', d: 'D', h: 'H', m: 'M', s: 'S', ms: 'MS', µs: 'US', ns: 'NS' },
			long: { y: 'YEAR', d: 'DAY', h: 'HOUR', m: 'MINUTE', s: 'SECOND', ms: 'MILLISECOND', µs: 'MICROSECOND', ns: 'NANOSECOND' },
			pluralize: (word, count) => count === 1 ? word : word + 'S'
		}
	}})
);
