var through = require('through');
var chainsaw = require('chainsaw');
var es = require('event-stream');
var util = require('util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;
var concat = require('concat-stream');

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

			stream.pipe(es.writeArray(function (err, data) {
				cb(data);
			}));
			/*
			var arrayWriter = Writable({ objectMode: true });
			arrayWriter._write = function (chunk, enc, next) {
			});
			//stream.pipe(concat(cb));
			*/
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
	});
};

module.exports = _;
