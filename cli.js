#!/usr/bin/env node
'use strict';
var getStdin = require('get-stdin');
var meow = require('meow');
var prettyMs = require('./');

var cli = meow({
	help: [
		'Usage',
		'  pretty-ms <milliseconds> [--compact]',
		'  echo <milliseconds> | pretty-ms',
		'',
		'Example',
		'  pretty-ms 1337',
		'  1s 337ms',
		'',
		'Options',
		'  --compact    Only show the first unit',
		'  --verbose    Show a detailed string',
		'               (seconds, days, hours instead of s, d, h)'
	]
});

function init(data) {
	console.log(prettyMs(Number(data), {
		compact: cli.flags.compact,
		verbose: cli.flags.verbose
	}));
}

if (process.stdin.isTTY) {
	if (!cli.input[0]) {
		console.error('`milliseconds` required');
		process.exit(1);
	}

	init(cli.input[0]);
} else {
	getStdin(init);
}
