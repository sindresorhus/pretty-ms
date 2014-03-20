/*!
	pretty-ms
	Convert milliseconds to a human readable string: 1337000000 ➔ 15d 11h 23m 20s
	https://github.com/sindresorhus/pretty-ms
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';

	function add(ret, val, postfix) {
		if (val > 0) {
			ret.push(val + postfix);
		}

		return ret;
	}

	function prettyMs(ms, opts) {
		if (typeof ms !== 'number') {
			throw new TypeError('Expected a number');
		}

		if (ms < 1000) {
			return Math.ceil(ms) + 'ms';
		}

		opts = opts || {};

		var ret = [];
		var sec = ms / 1000;

		ret = add(ret, Math.floor(sec / 86400), 'd');
		ret = add(ret, Math.floor(sec / 3600 % 24), 'h');
		ret = add(ret, Math.floor(sec / 60 % 60), 'm');

		if (opts.compact) {
			ret = add(ret, Math.floor(sec % 60), 's');
			return '~' + ret[0];
		}

		ret = add(ret, (sec % 60).toFixed(1).replace(/\.0$/, ''), 's');

		return ret.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = prettyMs;
	} else {
		window.prettyMs = prettyMs;
	}
})();
