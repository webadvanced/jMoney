*Note: tests render in console. Best used with FF3+*
	
**API**

- toBe(value)

- toBeTrue()

- toBeNull()

- toBeUndefined()

- toMatch(regex)

- toBeNumeric()


**Simple usage**


```javascript	
when.('Using numbers', function() {
	spec('7 should be numberic').expect(7).toBeNumeric();
});

var returnSeven = function() {
	return 7;
};

when.('Using returnSeven', function() {
	spec('Should return 7').expect(returnSeven()).toBe(7);
	spec('Should return numeric value').expect(returnSeven()).toBeNumeric();
});

when('Using anonymous functions', function() {
	spec('Should return the number 7').expect(function() {
		return 7;
	}).toBe(7);
}):
```

**Creating your own matcher (predicate)**

```javascript
jn.Predicates.fn.toBeFoo = function(expected) {
	//expected can either be passed in as en argument i.e toBeFoo('this is the expected value');
	//Or can be explisitly set like so:
	this.expected = 'foo';
	return this.expected === this.actual; //this.actual is the returned value from the expect function
};
```

*Using it*

```javascript
when('Using toBeFoo', function() {
	spec('Should be success when function returns foo').expect(function() {
		return 'foo';
	}).toBeFoo();
}):
```