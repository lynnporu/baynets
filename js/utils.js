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
