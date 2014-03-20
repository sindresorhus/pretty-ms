!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.prettyMs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Focm2+":[function(_dereq_,module,exports){
'use strict';
var parseMs = _dereq_('parse-ms');

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

	if (ms < 1000) {
		return Math.ceil(ms) + 'ms';
	}

	opts = opts || {};

	var ret = [];
	var parsed = parseMs(ms);

	ret = add(ret, parsed.days, 'd');
	ret = add(ret, parsed.hours, 'h');
	ret = add(ret, parsed.minutes, 'm');

	if (opts.compact) {
		ret = add(ret, parsed.seconds, 's');
		return '~' + ret[0];
	}

	ret = add(ret, (ms / 1000 % 60).toFixed(1).replace(/\.0$/, ''), 's');

	return ret.join(' ');
};

},{"parse-ms":3}],"pretty-ms":[function(_dereq_,module,exports){
module.exports=_dereq_('Focm2+');
},{}],3:[function(_dereq_,module,exports){
'use strict';
module.exports = function (ms) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number');
	}

	return {
		days: Math.floor(ms / 86400000),
		hours: Math.floor(ms / 3600000 % 24),
		minutes: Math.floor(ms / 60000 % 60),
		seconds: Math.floor(ms / 1000 % 60),
		milliseconds: Math.floor(ms % 1000)
	};
};

},{}]},{},["Focm2+"])
("Focm2+")
});