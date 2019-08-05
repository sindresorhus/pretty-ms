declare namespace prettyMilliseconds {
	/* Language-specific time unit string representation */
	interface LanguageUnits {
		/**
		The unit to display for years.
		 */
		readonly y: string;
		/**
		The unit to display for days.
		 */
		readonly d: string;
		/**
		The unit to display for hours.
		 */
		readonly h: string;
		/**
		The unit to display for minutes.
		 */
		readonly m: string;
		/**
		The unit to display for seconds.
		 */
		readonly s: string;
		/**
		The unit to display for milliseconds.
		 */
		readonly ms: string;
		/**
		The unit to display for microseconds.
		 */
		readonly µs: string;
		/**
		The unit to display for nanoseconds.
		 */
		readonly ns: string;
	}

	/* Language-specific configuration. */
	interface Language {
		/**
		Short unit names (e.g. y, h, m, s, ms, µs, ns).
		*/
		readonly short: LanguageUnits;
		/**
		Long unit names (e.g. year, hour, minute, second, millisecond, microsecond, nanosecond).
		*/
		readonly long: LanguageUnits;
		/**
		 * Constructs the plural of the given word (e.g. day => days).
		 *
		 * @param word The word which should be pluralized.
		 * @param count The value which determines whether the given word should be pluralized.
		 *
		 * @default undefined
		 */
		pluralize?: (word: string, count: number) => string;
	}

	interface Options {
		/**
		Number of digits to appear after the seconds decimal point.

		@default 1
		*/
		readonly secondsDecimalDigits?: number;

		/**
		Number of digits to appear after the milliseconds decimal point.

		Useful in combination with [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime).

		@default 0
		*/
		readonly millisecondsDecimalDigits?: number;

		/**
		Keep milliseconds on whole seconds: `13s` → `13.0s`.

		Useful when you are showing a number of seconds spent on an operation and don't want the width of the output to change when hitting a whole number.

		@default false
		*/
		readonly keepDecimalsOnWholeSeconds?: boolean;

		/**
		Only show the first unit: `1h 10m` → `~1h`.

		Also ensures that `millisecondsDecimalDigits` and `secondsDecimalDigits` are both set to `0`.

		@default false
		*/
		readonly compact?: boolean;

		/**
		Number of units to show. Setting `compact` to `true` overrides this option.

		@default Infinity
		*/
		readonly unitCount?: number;

		/**
		Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`.

		@default false
		*/
		readonly verbose?: boolean;

		/**
		Show milliseconds separately. This means they won't be included in the decimal part of the seconds.

		@default false
		*/
		readonly separateMilliseconds?: boolean;

		/**
		Show microseconds and nanoseconds.

		@default false
		*/
		readonly formatSubMilliseconds?: boolean;

		/**
		The language to use when displaying units.
		By default en, fr and es are available but you can add more with the languages option described hereafter.
		This option fallbacks to en if it is undefined or if the targeted language was not found.

		@default en
		*/
		readonly language?: string;

		/**
		Allows to define additional languages (en, fr and es are already available).

		@default {}
		*/
		readonly languages?: { [language: string]: Language };
	}
}

/**
Convert milliseconds to a human readable string: `1337000000` → `15d 11h 23m 20s`.

@param milliseconds - Milliseconds to humanize.

@example
```
import prettyMilliseconds = require('pretty-ms');

prettyMilliseconds(1337000000);
//=> '15d 11h 23m 20s'

prettyMilliseconds(1337);
//=> '1.3s'

prettyMilliseconds(133);
//=> '133ms'

// `compact` option
prettyMilliseconds(1337, {compact: true});
//=> '~1s'

// `verbose` option
prettyMilliseconds(1335669000, {verbose: true});
//=> '15 days 11 hours 1 minute 9 seconds'

// `formatSubMilliseconds` option
prettyMilliseconds(100.400080, {formatSubMilliseconds: true})
//=> '100ms 400µs 80ns'

// Can be useful for time durations
prettyMilliseconds(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5))
//=> '35m'

// Internationalization support
prettyMilliseconds(1337000000, {language: 'fr'});
//=> '15j 11h 23m 20s'
```
*/
declare function prettyMilliseconds(
	milliseconds: number,
	options?: prettyMilliseconds.Options
): string;

export = prettyMilliseconds;
