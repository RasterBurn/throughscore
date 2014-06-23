throughscore
============

Underscore (lodash) implemented using node streams

## Differences between throughscore and underscore/lodash ######################

#### The API is asynchronous and non-blocking

```javascript
_([1,2,3]).without(2).value() // NO!
```

```javascript
_([1,2,3]).without(2).then(function (items) {
	console.log(items); // YES!
});
```

#### Only the chainable api is available

```javascript
_.without([1,2,3], 2) // NO!
```

```javascript
_([1,2,3]).without(2) // YES!
```

#### throughscore doesn't support collections other than arrays

```javascript
_({a: 1, b: 2}).forEach(fn) // NO!
```

```javascript
_([1, 2]).forEach(fn) // YES!
```

#### See function documentation for function-specific changes

## Functions ###################################################################

### `_(value)` #################################################################

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

### `_.pipe([arg])` ############################################################

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

### `_.then(callback)` #########################################################

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

### `_.compact()` ##############################################################

Remove all falsey values from the stream. The values `false`, `null`, `0`,
`""`, `undefined`, and `NaN` are all falsey.

#### Example

```javascript
_([0, 1, false, 2, '', 3]).compact().then(function (data) {
	// data -> [1, 2, 3]
});
```

### `_.difference([values])` ###################################################

Exclude all values of the provided arrays from the stream using strict equality
for comparisons, i.e. `===`

#### Arguments

1. `[values]` (...Array): The arrays of values to exclude.

#### Example

```javascript
_([1, 2, 3, 4, 5]).difference([2], [3, 4]).then(function (data) {
	// data -> [1, 5]
});
```

### `_.filter(callback, [thisArg])` ############################################

Remove elements from the stream for which the callback returns falsey. The
callback is bound to `thisArg` and is invoked with two arguments: `(value,
index)`.

#### Arguments

1. `callback` (Function): The function called per iteration.
2. `[thisArg]` (*): The `this` binding of the callback.

#### Example

```javascript
_([1, 2, 3, 4, 5 ,6]).filter(function (num) { return num % 2 == 0; }).then(function (data) {
	// data -> [2, 4, 6]
});
```

### `_.flatten()` ##############################################################

#### Example

```javascript
_([1, [2], [3, [[4]]]]).flatten().then(function (data) {
	// data -> [1, 2, 3, 4]
});
```

### `_.forEach` #########################################################
### `_.initial` #########################################################
### `_.intersection` #########################################################
### `_.first` #########################################################
### `_.last` #########################################################
### `_.rest` #########################################################
### `_.union` #########################################################
### `_.uniq` #########################################################
### `_.without` #########################################################
### `_.zip` #########################################################
