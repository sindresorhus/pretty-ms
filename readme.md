# pretty-ms [![Build Status](https://travis-ci.org/sindresorhus/pretty-ms.svg?branch=master)](https://travis-ci.org/sindresorhus/pretty-ms)

> Convert milliseconds to a human readable string: `1337000000` ➔ `15d 11h 23m 20s`


## Install

Download [manually](https://github.com/sindresorhus/pretty-ms/releases) or with a package-manager.

```bash
$ npm install --save pretty-ms
```

```bash
$ bower install --save pretty-ms
```

```bash
$ component install sindresorhus/pretty-ms
```


## Usage

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

Can be used with require, global and AMD in the browser.


## API

### prettyMs(milliseconds, options)

#### milliseconds

*Required*  
Type: `number`

#### options.compact

Type: `boolean`

Only show the first unit: `1h 10m` ➔ `~1h`.


## CLI

You can also use it as a CLI app by installing it globally:

```bash
$ npm install --global pretty-ms
```

### Usage

```bash
$ pretty-ms --help

Usage
  $ pretty-ms <milliseconds> [--compact]
  $ echo <milliseconds> | pretty-ms

Example
  $ pretty-ms 1337
  1.3s
```


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
