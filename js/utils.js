const distance = (x1, y1, x2, y2) =>
	Math.sqrt(
		Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
	);

const combinations_no_repetition = function* (arr1, arr2) {
	/* Yield combinations of two arrays. Example:
	*  ([A, B, C], [D, E, F]) ==
	*  	AE, AF, BD, BF, CD, CE
	**/

	for(const [i1, v1] of arr1.entries())
		for(const [i2, v2] of arr2.entries())
			if(i1 == i2) continue;
			else yield [v1, v2];

}

const zip = function* (...arrays) {
	let index = 0;

	outer:
	while(true){

		let row = [];

		for(const array of arrays)
			if(array.length <= index)
				break outer;
			else
				row.push(array[index]);

		yield row;
		index++;

	}
}

Array.prototype.min_index = function() {
	return this.reduce(
		(bestIndexSoFar, currentlyTestedValue, currentlyTestedIndex, array) =>
		currentlyTestedValue < array[bestIndexSoFar]
			? currentlyTestedIndex
			: bestIndexSoFar,
		0);
}

Array.prototype.delete = function(what) {
	// Cannot use Array.prototype.filter here, because this will require
	// assignment to `this`. Yay!
	const index = this.indexOf(what);
	if(index != -1)
		this.splice(index, 1);
}

const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

const getWindowCenter = () => {
	return [
		window.innerWidth / 2,  // x
		window.innerHeight / 2  // y
	]
}

const newSafePosition = (scatterRadius=80) => {
	/*Returns coordinates of center of the window with some random deviation
	of size `scatterRadius`. */
	return getWindowCenter().map(
		coord => coord + getRandomArbitrary(-scatterRadius, scatterRadius));
}

const bindListener = (element, context, type, callable) => {
	/*Creates event listener of given type with bound context. */
	const bound = callable.bind(context)
	element.addEventListener(type, bound);
	return bound
}

const bindMultipleListeners = (element, context, callables) => {
	for(const [type, callable] of Object.entries(callables))
		element.addEventListener(type, callable.bind(context));
}
