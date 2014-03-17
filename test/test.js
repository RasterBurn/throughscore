var should = require('chai').should(),
    chai = require('chai'),
    _ = require('../lib/throughscore')
;

describe('_.compact', function () {
	it('should remove falsy values', function (done) {
		_([0, 1, false, 2, '', 3]).compact().then(function (data) {
			data.should.eql([1, 2, 3]);
			done();
		});
	});
});

describe('_.difference', function () {
	it('should exclude values of the provided arrays', function (done) {
		_([1, 2, 3, 4, 5]).difference([5, 2, 10]).then(function (data) {
			data.should.eql([1, 3, 4]);
			done();
		});
	});

	it('should use strict equality', function (done) {
		_([1, 2, 3]).difference(["2"]).then(function (data) {
			data.should.eql([1, 2, 3]);
			done();
		});
	});
	it('should accept arrays of values to exclude', function (done) {
		_([1, 2, 3, 4, 5]).difference([2], [3, 4]).then(function (data) {
			data.should.eql([1, 5]);
			done();
		});
	});
});

describe('_.filter', function () {
	it('should exclude elements that do not pass a truth test', function (done) {
		_([1, 2, 3, 4, 5 ,6]).filter(function (num) { return num % 2 == 0; }).then(function (data) {
			data.should.eql([2, 4, 6]);
			done();
		});
	});

	it('should bind `this` to `callback`', function (done) {
		_([1]).filter(function (num) {
			this.inContext.should.be.true;
			return true;
		}, { inContext: true }).then(function (data) {
			data.should.eql([1]);
			done();
		});
	});

	xit('should filter using "_.pluck" callback shorthand', function (done) {
	});

	xit('should filter using "_.where" callback shorthand', function (done) {
	});
});

describe('_.flatten', function () {
	it('should flatten a nested array of any depth', function (done) {
		_([1, [2], [3, [[4]]]]).flatten().then(function (data) {
			data.should.eql([1, 2, 3, 4]);
			done();
		});
	});

	xit('should only flatten a single level if isShallow is provided', function (done) {
		_([1, [2], [3, [[4]]]]).flatten(true).then(function (data) {
			data.should.eql([1, 2, 3, [[4]]]);
			done();
		});
	});

	xit('should pass each element through a callback, if provided');

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');
});

describe('_.forEach', function () {
	it('should iterate over each element', function (done) {
		var accum = [];

		_([1, 2, 3]).forEach(accum.push.bind(accum)).then(function (data) {
			accum.should.eql([1, 2, 3]);
			done();
		});
	});

	xit('should exit iteration early when the callback returns false', function (done) {
		var accum = []

		_([1, 2, 3]).forEach(function (i) {
			accum.push(i);
			if (i === 2) {
				return false;
			}
		}).then(function (data) {
			accum.should.eql([1, 2]);
			data.should.eq([1, 2, 3]);
			done();
		});
	});

	it('should bind `thisArg` to the callback', function (done) {
		_([1]).forEach(function () {
			this.inContext.should.be.true;
			return false;
		}, { inContext: true }).then(function (data) {
			data.should.eql([1]);
			done();
		});
	});

	xit('should operate on objects');
});

describe('_.initial', function () {
	it('should get all but the last element of the array when no argument passed', function (done) {
		_([1, 2, 3]).initial().then(function (data) {
			data.should.eql([1, 2]);
			done();
		});
	});

	it('should get the last n elements of the array', function (done) {
		_([1, 2, 3]).initial(2).then(function (data) {
			data.should.eql([1]);
			done();
		});
	});
});
