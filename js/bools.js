const binaryCombinations = function* (size) {
	/*Returns all possible combinations of true/false of given size. */
	for(let i = 0; i < (1 << size); i++)
		yield i;
}

Number.prototype.toBinaryArray = function(size) {
	/*Convert numbers like 0b110 with size=4 to array
	* [false, true, true, false]. */
	return (this | 1 << size).toString(2).split("").slice(1).map(
		n => n == 1 ? true : false);
}

Array.prototype.toBinaryNumber = function() {
	/*Does opposite to Number.prototype.toBinaryArray. Example:
	* [false, true, true, false, true].toBinaryNumber == 0b1101. */
	let number = 0;
	this.reverse().forEach(
		(bool, index) => number |= (!!bool << index)
	);
	return number;
}

const maskForIndices = function(size, indices) {
	/*Returns number of given size in binary, where given bits is turned
	* on.
	* Example: maskForIndices(4, [1, 2, 4]) == 0b1101 */
	let mask = 0;
	(indices || []).forEach(
		index => mask |= 1 << (size - index - 1)
	);
	return mask;
}

const flipBits = function(size, number) {
	return ~number & ((1 << size) - 1);
}

const combinationsWithFix = function* (size, trueFixIndices, falseFixIndices) {
	/*Returns combinations of true/false of given size, but only those where
	* trueFixIndices are true and falseFixIndices are false.
	* Example:
	* for(comb of combinationsWithFix(4, [1], [2, 3])) console.log(comb)
	* 	(4) [false, true, false, false]
	* 	(4) [true, true, false, false]
	* 1-nd index is fixed for `true`, 2 and 3-th is fixed for `false`.
	*/

	let trueMask = maskForIndices(size, trueFixIndices),
		falseMask = maskForIndices(size, falseFixIndices);

	for(let i = 0; i < (1 << size); i++){

		if(
			(i & trueMask) != trueMask ||
			(flipBits(size, i) & falseMask) != falseMask
		)
			continue;

		else
			yield i;

	}
}
