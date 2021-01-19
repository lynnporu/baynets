const checkProbability = (number) => {
	if(number < 0 || number > 1)
		throw RangeError("Probability should lie in [0; 1] range");
}
