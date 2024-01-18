import {expectType} from 'tsd';
import prettyMilliseconds from './index.js';

expectType<string>(prettyMilliseconds(1_335_669_000));
expectType<string>(prettyMilliseconds(1_335_669_000, {secondsDecimalDigits: 1}));
expectType<string>(
	prettyMilliseconds(1_335_669_000, {millisecondsDecimalDigits: 2}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000, {keepDecimalsOnWholeSeconds: true}),
);
expectType<string>(prettyMilliseconds(1337, {compact: true}));
expectType<string>(prettyMilliseconds(1_335_669_000, {unitCount: 2}));
expectType<string>(prettyMilliseconds(1_335_669_000, {verbose: true}));
expectType<string>(
	prettyMilliseconds(1_335_669_000, {separateMilliseconds: true}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000, {formatSubMilliseconds: true}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000, {colonNotation: true}),
);

expectType<string>(prettyMilliseconds(1_335_669_000n));
expectType<string>(prettyMilliseconds(1_335_669_000n, {secondsDecimalDigits: 1}));
expectType<string>(
	prettyMilliseconds(1_335_669_000n, {millisecondsDecimalDigits: 2}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000n, {keepDecimalsOnWholeSeconds: true}),
);
expectType<string>(prettyMilliseconds(1337n, {compact: true}));
expectType<string>(prettyMilliseconds(1_335_669_000n, {unitCount: 2}));
expectType<string>(prettyMilliseconds(1_335_669_000n, {verbose: true}));
expectType<string>(
	prettyMilliseconds(1_335_669_000n, {separateMilliseconds: true}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000n, {formatSubMilliseconds: true}),
);
expectType<string>(
	prettyMilliseconds(1_335_669_000n, {colonNotation: true}),
);
