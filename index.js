'use strict';
var parseMs = require('parse-ms');

function add(ret, val, postfix) {
	if (val > 0) {
		ret.push(val + postfix);
	}

	return ret;
}

module.exports = function (ms, opts) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number');
	}

	var verbose = opts.verbose;

	if (ms < 1000) {
		if(verbose && Math.ceil(ms) == 1.0)
			return Math.ceil(ms) + ' millisecond';
		if(verbose)
			return Math.ceil(ms) + ' milliseconds';
		return Math.ceil(ms) + 'ms';
	}

	opts = opts || {};

	var secDecimalDigits = typeof opts.secDecimalDigits === 'number' ? opts.secDecimalDigits : 1;
	var ret = [];
	var parsed = parseMs(ms);
	/*
	console.log(parsed.days);
	console.log(parsed.hours);
	console.log(parsed.minutes);
	console.log(typeof parsed.days);
	console.log(typeof parsed.hours);
	console.log(typeof parsed.minutes);
	console.log(parsed.days == 1);
	*/

	if(verbose){
		ret = add(ret, parsed.days, parsed.days == 1 ? ' day' : ' days');
		ret = add(ret, parsed.hours, parsed.hours == 1 ? ' hour' : ' hours');
		ret = add(ret, parsed.minutes, parsed.minutes == 1 ? ' minute' : ' minutes');
	}
	else{
		ret = add(ret, parsed.days, 'd');
		ret = add(ret, parsed.hours, 'h');
		ret = add(ret, parsed.minutes, 'm');
	}

	if (opts.compact) {
		if(verbose)
			ret = add(ret, parsed.seconds, parsed.seconds === 1 ? ' second' : ' seconds');
		else
			ret = add(ret, parsed.seconds, 's');
		return '~' + ret[0];
	}

	var seconds_fixed = (ms / 1000 % 60).toFixed(secDecimalDigits);
	
	if(verbose)
		ret = add(ret, seconds_fixed.replace(/\.0$/, ''), seconds_fixed === (1).toFixed(secDecimalDigits) ? ' second' : ' seconds');
	else
		ret = add(ret, seconds_fixed.replace(/\.0$/, ''), 's');

	return ret.join(' ');
};
