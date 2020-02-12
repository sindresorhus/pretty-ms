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
	prettyMilliseconds(1335669000, {colonNotation: true})
);
