*Note: tests render in console. Best used with FF3+*
	
**API**

	- toBe(value)
	- toBeTrue()
	- toBeNull()
	- toBeUndefined()
	- toMatch(regex)
	-toBeNumeric()

	
	*Simple usage*
	
		when.('Testing numbers', function() {
			spec('7 should be numberic').expect(7).toBeNumeric();
		});