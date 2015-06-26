#!/usr/bin/env node
'use strict';
var getStdin = require('get-stdin');
var meow = require('meow');
var prettyMs = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ pretty-ms <milliseconds> [--compact] [--verbose] [--sec-decimal-digits <number>]',
		'  echo <milliseconds> | pretty-ms',
		'',
		'Options',
		'  -c, --compact              Only show the first part',
		'  -v, --verbose              Use full-length units',
		'  -d, --sec-decimal-digits   Number of digits to appear after the seconds decimal point',
		'',
		'Examples',
		'  $ pretty-ms 1337',
		'  1.3s',
		'  $ pretty-ms 1337 --verbose',
		'  1.3 seconds',
		'  $ pretty-ms 1337 --compact',
		'  ~1s',
		'  $ pretty-ms 1337 --sec-decimal-digits 4',
		'  1.3370s'
	]
}, {
	alias: {
		c: 'compact',
		v: 'verbose',
		d: 'sec-decimal-digits'
	}
});

var input = cli.input[0];

function init(data) {
	console.log(prettyMs(Number(data), cli.flags));
}

if (!input && process.stdin.isTTY) {
	console.error('`milliseconds` required');
	process.exit(1);
}

if (input) {
	init(input);
} else {
	getStdin(init);
}
