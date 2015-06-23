#!/usr/bin/env node
'use strict';
var getStdin = require('get-stdin');
var meow = require('meow');
var prettyMs = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ pretty-ms <milliseconds> [--compact] [--verbose] [--secDecimalDigits <number>]',
		'  echo <milliseconds> | pretty-ms',
		'',
		'Options',
		'  --compact                      Only show the first part',
		'  --verbose                      Use full-length units',
		'  --secDecimalDigits <number>    Use the specified number of digits after decimal',
		'',
		'Examples',
		'  $ pretty-ms 1337',
		'  1.3s',
		'  $ pretty-ms 1337 --verbose',
		'  1.3 seconds',
		'  $ pretty-ms 1337 --compact',
		'  ~1s',
		'  $ pretty-ms 1337 --secDecimalDigits 4',
		'  1.3370s'
	]
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
