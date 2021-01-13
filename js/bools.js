const binaryCombinations = function* (size) {
	/*Returns all possible combinations of true/false of given size. */
	for(let i = 0; i < (1 << size); i++)
		yield (i | 1 << size).toString(2).split("").slice(1).map(
			n => n == 1 ? true : false);
}
