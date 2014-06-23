var through2 = require('through2');
var chainsaw = require('chainsaw');
var util = require('util');
var Readable = require('readable-stream').Readable;
var CBuffer = require('CBuffer');
var isReadable = require('isstream').isReadable;
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

function identity(data) { return data; }

var _ = function (data) {

	var pipeline = [];
	var inputStream;

	if (util.isArray(data)) {
		inputStream = new ArrayReader(data);
	}
	else if (isReadable(data)) {
		inputStream = data;
	}
	else {
		throw new Error('Not a readable stream');
	}

	return chainsaw(function (saw) {
		this.asStream = function () {
			return pipeline.reduce(function (stream, thru) {
				return stream.pipe(thru);
			}, inputStream);
		};

		this.pipe = function () {
			var stream = this.asStream();
			return stream.pipe.apply(stream, arguments);
		};

		this.then = function (cb) {
			var retVal = [];
			this.pipe(through2.obj(function (data, enc, done) {
				this.push(data);
				retVal.push(data);
				done();
			}, function (done) {
				done();
				cb(retVal);
			}));
		};

		this.compact = function () {
			pipeline.push(through2.obj(function (data, enc, done) {
				if (data) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.difference = function () {
			var values = Array.prototype.concat.apply([], arguments);
			var set = new Set();
			values.forEach(set.add.bind(set));
			pipeline.push(through2.obj(function (data, enc, done) {
				if (!set.has(data)) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.filter = function (callback, thisArg) {
			var cb = callback.bind(thisArg);
			pipeline.push(through2.obj(function (data, enc, done) {
				if (cb(data)) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.flatten = function (isShallow, callback, thisArg) {
			var flatten = function (queue, a) {
				return Array.isArray(a) ? a.forEach(flatten.bind(null, queue)) : queue(a);
			};

			pipeline.push(through2.obj(function (data, enc, done) {
				flatten(this.push.bind(this), data);
				done();
			}));
			saw.next();
		};

		this.forEach = function (callback, thisArg) {
			var cb = callback.bind(thisArg);
			var exit = false;
			pipeline.push(through2.obj(function (data, enc, done) {
				this.push(data);
				if (!exit) {
					exit = cb(data) === false;
				}
				done();
			}));
			saw.next();
		};

		this.initial = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var buffer = new CBuffer(n);
			var stream = through2.obj(function (data, enc, done) {
				buffer.push(data);
				done();
			});
			buffer.overflow = stream.push.bind(stream);
			pipeline.push(stream);
			saw.next();
		};

		this.intersection = function () {
			var values = Array.prototype.concat.apply([], arguments);
			var set = new Set();
			values.forEach(set.add.bind(set));
			pipeline.push(through2.obj(function (data, enc, done) {
				if (set.has(data)) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.first = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var index = 0;
			pipeline.push(through2.obj(function (data, enc, done) {
				if (index++ < n) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.last = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var buffer = new CBuffer(n);
			pipeline.push(through2.obj(function (data, enc, done) {
				buffer.push(data);
				done();
			}, function (done) {
				buffer.forEach(this.push.bind(this));
				done();
			}));
			saw.next();
		};

		this.rest = function (n) {
			if (!n && n !== 0) {
				n = 1;
			}
			var i = 0;
			pipeline.push(through2.obj(function (data, enc, done) {
				if (i++ >= n) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.union = function () {
			var array = Array.prototype.concat.apply([], arguments);
			var seen = new Set();
			var enq = function (data) {
				if (!seen.has(data)) {
					seen.add(data);
					stream.push(data);
				}
			};
			var stream = through2.obj(function (data, enc, done) {
				enq(data);
				done();
			}, function (done) {
				array.forEach(enq);
				done();
			});
			pipeline.push(stream);
			saw.next();
		};

		this.uniq = function () {
			var args = Array.prototype.slice.call(arguments);
			var isSorted = false;
			var callback = identity;
			var context = null;
			if (args.length && typeof args[0] === 'boolean') {
				isSorted = args.shift();
			}
			if (args.length && typeof args[0] === 'function') {
				callback = args.shift();
			}
			if (args.length) {
				context = args.shift();
			}
			if (context) {
				callback = callback.bind(context);
			}

			var enq = (function () {
				if (isSorted) {
					var last;
					return function (data, enc, done) {
						var value = callback(data);
						if (isSorted) {
							if (last !== value) {
								stream.push(data);
							}
							last = value;
						}
						done();
					};
				}
				else {
					var seen = new Set();
					return function (data, enc, done) {
						var value = callback(data);
						if (!seen.has(value)) {
							seen.add(value);
							stream.push(data);
						}
						done();
					};
				}
			})();

			var stream = through2.obj(enq);
			pipeline.push(stream);
			saw.next();
		};

		this.without = function () {
			var values = Array.prototype.slice.call(arguments);
			var set = new Set();
			values.forEach(set.add.bind(set));
			pipeline.push(through2.obj(function (data, enc, done) {
				if (!set.has(data)) {
					this.push(data);
				}
				done();
			}));
			saw.next();
		};

		this.zip = function () {
			var arrays = Array.prototype.slice.call(arguments);
			var index = 0;
			pipeline.push(through2.obj(function (data, enc, done) {
				var retval = [data];
				arrays.forEach(function (array) {
					retval.push(array[index]);
				});
				this.push(retval);
				index++;
				done();
			}));
			saw.next();
		};
	});
};

module.exports = _;
