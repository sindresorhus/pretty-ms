module.exports = {
	en: {
		short: {y: 'y', d: 'd', h: 'h', m: 'm', s: 's', ms: 'ms', µs: 'µs', ns: 'ns'},
		long: {
			y: 'year',
			d: 'day',
			h: 'hour',
			m: 'minute',
			s: 'second',
			ms: 'millisecond',
			µs: 'microsecond',
			ns: 'nanosecond'
		},
		pluralize: (word, count) => count === 1 ? word : word + 's'
	},
	fr: {
		short: {y: 'a', d: 'j', h: 'h', m: 'm', s: 's', ms: 'ms', µs: 'µs', ns: 'ns'},
		long: {
			y: 'année',
			d: 'jour',
			h: 'heure',
			m: 'minute',
			s: 'seconde',
			ms: 'milliseconde',
			µs: 'microseconde',
			ns: 'nanoseconde'
		}
	},
	es: {
		short: {y: 'a', d: 'd', h: 'h', m: 'm', s: 's', ms: 'ms', µs: 'µs', ns: 'ns'},
		long: {
			y: 'año',
			d: 'día',
			h: 'hora',
			m: 'minuto',
			s: 'segundo',
			ms: 'milisegundo',
			µs: 'microsecondo',
			ns: 'nanosegundo'
		}
	}
};
