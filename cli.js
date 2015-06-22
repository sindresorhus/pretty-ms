#!/usr/bin/env node
'use strict';
var getStdin = require('get-stdin');
var meow = require('meow');
var prettyMs = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ pretty-ms <milliseconds> [--compact] [--verbose]',
		'  echo <milliseconds> | pretty-ms',
		'',
		'Options',
		'  --compact  Only show the first part',
		'  --verbose  Use full-length units',
		'',
		'Examples',
		'  $ pretty-ms 1337',
		'  1.3s',
		'  $ pretty-ms 1337 --verbose',
		'  1.3 seconds',
		'  $ ~1s'
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
