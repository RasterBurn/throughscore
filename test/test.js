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

	it('should pass the value and and index to the callback', function (done) {
		var test_one = function (idx) { idx.should.eql(0); };
		var test_two = function (idx) { idx.should.eql(1); };

		_([test_one, test_two]).filter(function (test, idx) {
			test(idx);
			return true;
		}).then(function (data) {
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

	xit('should take a callback in place of a number');

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');
});

describe('_.intersection', function () {
	it('should create an array of unique values present in all provided arrays', function (done) {
		_([1, 2, 3]).intersection([5, 2, 1, 4], [2, 1]).then(function (data) {
			data.should.eql([1, 2]);
			done();
		});
	});

	it('should use strict equality', function (done) {
		_([1, 2, 3]).intersection([1, "2"]).then(function (data) {
			data.should.eql([1]);
			done();
		});
	});
});

describe('_.first', function () {
	it('should get the first element of the array when no argument passed', function (done) {
		_([1, 2, 3]).first().then(function (data) {
			data.should.eql([1]);
			done();
		});
	});

	it('should get the first n elements of the array', function (done) {
		_([1, 2, 3]).first(2).then(function (data) {
			data.should.eql([1, 2]);
			done();
		});
	});

	xit('should take a callback in place of a number');

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');

});

describe('_.last', function () {
	it('should get the last element of the array when no argument passed', function (done) {
		_([1, 2, 3]).last().then(function (data) {
			data.should.eql([3]);
			done();
		});
	});

	it('should get the last n elements of the array', function (done) {
		_([1, 2, 3]).last(2).then(function (data) {
			data.should.eql([2, 3]);
			done();
		});
	});

	xit('should take a callback in place of a number');

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');
});

describe('_.rest', function () {
	it('should get all but the first element of the array when no argument passed', function (done) {
		_([1, 2, 3]).rest().then(function (data) {
			data.should.eql([2, 3]);
			done();
		});
	});

	it('should get all but the first n elements of the array', function (done) {
		_([1, 2, 3]).rest(2).then(function (data) {
			data.should.eql([3]);
			done();
		});
	});

	xit('should take a callback in place of a number');

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');
});

describe('_.union', function () {
	it('should create a stream of unique values', function (done) {
		_([1, 2, 3]).union([5, 2, 1, 4], [2, 1]).then(function (data) {
			data.should.eql([1, 2, 3, 5, 4]);
			done();
		});
	});

	it('should use strict equality for comparisons', function (done) {
		_([1, 2, 3]).union(["2"]).then(function (data) {
			data.should.eql([1, 2, 3, "2"]);
			done();
		});
	});
});

describe('_.uniq', function () {
	it('should create a duplicate-free version of an array', function (done) {
		_([1, 2, 1, 3, 1]).uniq().then(function (data) {
			data.should.eql([1, 2, 3]);
			done();
		});
	});

	it('should use a faster algorithm if the array is sorted', function (done) {
		_([1, 1, 2, 2, 3]).uniq(true).then(function (data) {
			data.should.eql([1, 2, 3]);
			done();
		});
	});

	it('should pass values through a callback function before uniqueness is computed', function (done) {
		_(['A', 'b', 'C', 'a', 'B', 'c']).uniq(function (letter) {
			return letter.toLowerCase();
		}).then(function (data) {
			data.should.eql(['A', 'b', 'C']);
			done();
		});
	});

	it('should bind context to that callback function', function (done) {
		_([1, 2.5, 3, 1.5, 2, 3.5]).uniq(function (num) {
			return this.floor(num);
		}, Math).then(function (data) {
			data.should.eql([1, 2.5, 3]);
			done();
		});
	});

	it('should use strict equality for comparisons', function (done) {
		_([1, "1", 1]).uniq().then(function (data) {
			data.should.eql([1, "1"]);
			done();
		});
	});

	xit('should create a "_.pluck" style callback if a property name is provided');

	xit('should create a "_.where" style callback if an object is provided');
});

describe('_.without', function () {
	it('should create an array excluding all provided values', function (done) {
		_([1, 2, 1, 0, 3, 1, 4]).without(0 ,1).then(function (data) {
			data.should.eql([2, 3, 4]);
			done();
		});
	});

	it('should use strict equality for comparisons', function (done) {
		_([1, "1"]).without("1").then(function (data) {
			data.should.eql([1]);
			done();
		});
	});
});

describe('_.zip', function () {
	it('should create an array of grouped elements, grouped by index', function (done) {
		_(['fred', 'barney']).zip([30, 40], [true, false]).then(function (data) {
			data.should.eql([['fred', 30, true], ['barney', 40, false]]);
			done();
		});
	});
});

