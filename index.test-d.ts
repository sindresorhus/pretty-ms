import {expectTypeOf} from 'nz';
import prettyMilliseconds from './index.js';

expectTypeOf(prettyMilliseconds(1_335_669_000)).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000n)).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {secondsDecimalDigits: 1})).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {millisecondsDecimalDigits: 2}),
).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {keepDecimalsOnWholeSeconds: true}),
).toBe<string>();
expectTypeOf(prettyMilliseconds(1337, {compact: true})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {unitCount: 2})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {verbose: true})).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {separateMilliseconds: true}),
).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {formatSubMilliseconds: true}),
).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {colonNotation: true}),
).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {hideYear: true})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {hideYearAndDays: true})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000, {hideSeconds: true})).toBe<string>();
expectTypeOf(
	prettyMilliseconds(1_335_669_000, {subSecondsAsDecimals: true}),
).toBe<string>();
expectTypeOf(prettyMilliseconds(900, {subSecondsAsDecimals: true})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000n, {hideYearAndDays: true})).toBe<string>();
expectTypeOf(prettyMilliseconds(1_335_669_000n, {colonNotation: true})).toBe<string>();

// Options are readonly.
const readonlyOptions = {secondsDecimalDigits: 2, unitCount: 2} as const;
expectTypeOf(prettyMilliseconds(1_335_669_000, readonlyOptions)).toBe<string>();
