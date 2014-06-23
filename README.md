throughscore
============

Underscore (lodash) implemented using node streams

# Functions ####################################################################

### `_(value)`

Creates a throughscore object that wraps the given value to enable method
chaining.

#### Arguments

1. `value` (Array|ReadableStream): The value to wrap in a throughscore instance.

#### Returns

(Object): Returns a throughscore instance.

#### Example

```javascript
var wrapped = _([1, 2, 3]);

wrapped.without(2).then(function (data) {
	// data: [1, 3]
});
```

### `_.pipe([arg])`

Pulls the data out of the throughscore readable stream and writes it to the
supplied destination.

#### Arguments

1. `[arg]` (...*): Arguments to `stream.pipe`

#### Example

```javascript
var through2 = require('through2');
var accum = [];
_([1, 2, 3]).without(2).pipe(through2.obj(function (data, enc, done) {
	this.push(data);
	accum.push(data);
	done();
}, function (done) {
	done();
	console.log(accum);
}));
```

### `_.then(callback)`

Calls `callback` upon termination of the stream with the results as an array of
objects.

#### Arguments

1. `callback` (Function): The function called after the stream is ended with an
   array of all items in the stream as the first parameter.

#### Example

```javascript
_([1, 2, 3]).without(2).then(function (data) {
	// data: [1, 3]
});
```


