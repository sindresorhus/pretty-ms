# pretty-ms [![Build Status](https://travis-ci.org/sindresorhus/pretty-ms.svg?branch=master)](https://travis-ci.org/sindresorhus/pretty-ms)

> Convert milliseconds to a human readable string: `1337000000` → `15d 11h 23m 20s`


## Usage

```
$ npm install --save pretty-ms
```

```js
var prettyMs = require('pretty-ms');

prettyMs(1337000000);
//=> '15d 11h 23m 20s'

prettyMs(1337);
//=> '1.3s'

prettyMs(133);
//=> '133ms'

// compact option
prettyMs(1337, {compact: true});
//=> '~1s'

// can be useful for time durations
prettyMs(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5))
//=> '35m'
```


## API

### prettyMs(milliseconds, options)

#### milliseconds

*Required*  
Type: `number`

#### options

##### secDecimalDigits

Type: `number`  
Default: `1`

Number of digits to appear after the seconds decimal point.

##### compact

Type: `boolean`
Default: `false`

Only show the first unit: `1h 10m` ➔ `~1h`.

##### verbose

Type: `boolean`
Default: `false`

Show a detailed string: `5h 1m 45s` => `5 hours 1 minute 45 seconds`


## CLI

```
$ npm install --global pretty-ms
```

```
$ pretty-ms --help

  Usage
    pretty-ms <milliseconds> [--compact]
    echo <milliseconds> | pretty-ms

  Example
    pretty-ms 1337
    1s 337ms

  Options
    --compact    Only show the first unit
    --verbose    Show a detailed string
		             (seconds, days, hours instead of s, d, h)

```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
