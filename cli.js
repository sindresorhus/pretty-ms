#!/usr/bin/env node
'use strict';
var stdin = require('get-stdin');
var pkg = require('./package.json');
var prettyMs = require('./');
var argv = process.argv.slice(2);
var input = argv[0];

function help() {
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Usage',
		'    pretty-ms <milliseconds> [--compact]',
		'    echo <milliseconds> | pretty-ms',
		'',
		'  Example',
		'    pretty-ms 1337',
		'    1s 337ms'
	].join('\n'));
}

function init(data) {
	console.log(prettyMs(Number(data), {
		compact: argv.indexOf('--compact') !== -1
	}));
}

if (argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

if (process.stdin.isTTY) {
	if (!input) {
		help();
		return;
	}

	init(input);
} else {
	stdin(init);
}
