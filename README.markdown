*Note: tests render in console. Best used with FF3+*
	
**API**

- toBe(value)

- toBeTrue()

- toBeNull()

- toBeUndefined()

- toMatch(regex)

-toBeNumeric()

	
**Simple usage**
	
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