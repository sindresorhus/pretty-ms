# pretty-ms [![Build Status](https://travis-ci.org/sindresorhus/pretty-ms.svg?branch=master)](https://travis-ci.org/sindresorhus/pretty-ms)

> Convert milliseconds to a human readable string: `1337000000` → `15d 11h 23m 20s`


## Install

```
$ npm install pretty-ms
```


## Usage

```js
const prettyMs = require('pretty-ms');

prettyMs(1337000000);
//=> '15d 11h 23m 20s'

prettyMs(1337);
//=> '1.3s'

prettyMs(133);
//=> '133ms'

// `compact` option
prettyMs(1337, {compact: true});
//=> '~1s'

// `verbose` option
prettyMs(1335669000, {verbose: true});
//=> '15 days 11 hours 1 minute 9 seconds'

// `formatSubMs` option
prettyMs(100.400080, {formatSubMs: true})
//=> '100ms 400µs 80ns'

// Can be useful for time durations
prettyMs(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5))
//=> '35m'
```


## API

### prettyMs(input, [options])

#### input

Type: `number`

Milliseconds to humanize.

#### options

Type: `Object`

##### secDecimalDigits

Type: `number`<br>
Default: `1`

Number of digits to appear after the seconds decimal point.

##### msDecimalDigits

Type: `number`<br>
Default: `0`

Number of digits to appear after the milliseconds decimal point.

Useful in combination with [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime).

##### keepDecimalsOnWholeSeconds

Type: `boolean`<br>
Default: `false`

Keep milliseconds on whole seconds: `13s` → `13.0s`.

Useful when you are showing a number of seconds spent on an operation and don't want the width of the output to change when hitting a whole number.

##### compact

Type: `boolean`<br>
Default: `false`

Only show the first unit: `1h 10m` → `~1h`.
Also ensures that `msDecimalDigits` and `secDecimalDigits` are both set to `0`.

##### unitCount

Type: `number`<br>
Default: `Infinity`

Number of units to show. Setting `compact` to `true` overrides this option.

##### verbose

Type: `boolean`<br>
Default: `false`

Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`

##### separateMs

Type: `boolean`<br>
Default: `false`

Show milliseconds separately. This means they won't be included in the decimal part of the seconds.

##### formatSubMs

Type: `boolean`<br>
Default: `false`

Show microseconds and nanoseconds.


## Related

- [pretty-ms-cli](https://github.com/sindresorhus/pretty-ms-cli) - CLI for this module
- [parse-ms](https://github.com/sindresorhus/parse-ms) - Parse milliseconds into an object
- [to-milliseconds](https://github.com/sindresorhus/to-milliseconds) - Convert an object of time properties to milliseconds


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
