var through = require('through');
var chainsaw = require('chainsaw');
var util = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var CBuffer = require('CBuffer');
require('es6-collections'); // for Set

function ArrayReader(array) {
	this.array = array;
	this.index = 0;
	this.length = array.length;
	Readable.call(this, { objectMode: true });
}

util.inherits(ArrayReader, Readable);

ArrayReader.prototype._read = function () {
	if (this.index < this.length) {
		this.push(this.array[this.index++]);
	}
	else {
		this.push(null);
	}
};


var _ = function (data) {

	var pipeline = [];
	var inputStream = new ArrayReader(data);

	return chainsaw(function (saw) {
		this.then = function (cb) {
			var stream = pipeline.reduce(function (stream, thru) {
				return stream.pipe(thru);
			}, inputStream);

			var retVal = [];
			stream.pipe(through(function (data) {
				this.queue(data);
				retVal.push(data);
			}, function () {
				this.queue(null);
				cb(retVal);
			}));
		};

		this.compact = function () {
			pipeline.push(through(function (data) {
				if (data) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.difference = function () {
			var array = Array.prototype.concat.apply([], arguments);
			pipeline.push(through(function (data) {
				if (array.indexOf(data) === -1) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.filter = function (callback, thisArg) {
			var cb = callback.bind(thisArg);
			pipeline.push(through(function (data) {
				if (cb(data)) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.flatten = function (isShallow, callback, thisArg) {
			var flatten = function (queue, a) {
				return Array.isArray(a) ? a.forEach(flatten.bind(null, queue)) : queue(a);
			};

			pipeline.push(through(function (data) {
				flatten(this.queue.bind(this), data);
			}));
			saw.next();
		};

		this.forEach = function (callback, thisArg) {
			var cb = callback.bind(thisArg);
			var exit = false;
			pipeline.push(through(function (data) {
				this.queue(data);
				if (!exit) {
					exit = cb(data) === false;
				}
			}));
			saw.next();
		};

		this.initial = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var buffer = new CBuffer(n);
			var stream = through(buffer.push.bind(buffer));
			buffer.overflow = stream.queue.bind(stream);
			pipeline.push(stream);
			saw.next();
		};

		this.intersection = function () {
			var array = Array.prototype.concat.apply([], arguments);
			pipeline.push(through(function (data) {
				if (array.indexOf(data) !== -1) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.first = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var index = 0;
			pipeline.push(through(function (data) {
				if (index++ < n) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.last = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var buffer = new CBuffer(n);
			pipeline.push(through(buffer.push.bind(buffer), function () {
				buffer.forEach(this.queue.bind(this));
				this.queue(null);
			}));
			saw.next();
		};

		this.pull = function () {
			var values = Array.prototype.slice.call(arguments);
			
			pipeline.push(through(function (data) {
				if (values.indexOf(data) === -1) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.rest = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var i = 0;
			pipeline.push(through(function (data) {
				if (i++ >= n) {
					this.queue(data);
				}
			}));
			saw.next();
		};

		this.union = function () {
			var array = Array.prototype.concat.apply([], arguments);
			var seen = new Set();
			var enq = function (data) {
				if (!seen.has(data)) {
					seen.add(data);
					stream.queue(data);
				}
			};
			var stream = through(enq, function () {
				array.forEach(enq);
				this.queue(null);
			});
			pipeline.push(stream);
			saw.next();
		};
	});
};

module.exports = _;
