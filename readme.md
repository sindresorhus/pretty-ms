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

// verbose option
prettyMs(1335669000, {verbose: true});
//=> '15 days 11 hours 1 minute 9 seconds'

// can be useful for time durations
prettyMs(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5))
//=> '35m'
```


## API

### prettyMs(milliseconds, [options])

#### milliseconds

*Required*  
Type: `number`

Milliseconds to humanize.

#### options

##### secDecimalDigits

Type: `number`  
Default: `1`

Number of digits to appear after the seconds decimal point.

##### compact

Type: `boolean`  
Default: `false`

Only show the first unit: `1h 10m` → `~1h`.

##### verbose

Type: `boolean`  
Default: `false`

Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`


## CLI

```
$ npm install --global pretty-ms
```

```
$ pretty-ms --help

  Usage
    $ pretty-ms <milliseconds> [--compact] [--verbose] [--sec-decimal-digits <number>]
    echo <milliseconds> | pretty-ms

  Options
    -c, --compact              Only show the first part
    -v, --verbose              Use full-length units
    -d, --sec-decimal-digits   Number of digits to appear after the seconds decimal point

  Examples
    $ pretty-ms 1337
    1.3s
    $ pretty-ms 1337 --verbose
    1.3 seconds
    $ pretty-ms 1337 --compact
    ~1s
    $ pretty-ms 1337 --sec-decimal-digits 4
    1.3370s
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
