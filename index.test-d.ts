import {expectType} from 'tsd';
import prettyMilliseconds from './index.js';

expectType<string>(prettyMilliseconds(1_335_669_000));
expectType<string>(prettyMilliseconds(1_335_669_000n));
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
expectType<string>(prettyMilliseconds(1_335_669_000, {hideYear: true}));
expectType<string>(prettyMilliseconds(1_335_669_000, {hideYearAndDays: true}));
expectType<string>(prettyMilliseconds(1_335_669_000, {hideSeconds: true}));
expectType<string>(
	prettyMilliseconds(1_335_669_000, {subSecondsAsDecimals: true}),
);
expectType<string>(prettyMilliseconds(900, {subSecondsAsDecimals: true}));
expectType<string>(prettyMilliseconds(1_335_669_000n, {hideYearAndDays: true}));
expectType<string>(prettyMilliseconds(1_335_669_000n, {colonNotation: true}));

// Options are readonly.
const readonlyOptions = {secondsDecimalDigits: 2, unitCount: 2} as const;
expectType<string>(prettyMilliseconds(1_335_669_000, readonlyOptions));
