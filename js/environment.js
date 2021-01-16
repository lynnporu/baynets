const controllersContainer = document.getElementById("controllers");

const ribbonTemplate = document.getElementById("ribbon_template");

class Ribbon extends HTMLRepresentative {

	constructor() {

		super(HTMLRepresentative.elementFromTemplate(
			ribbonTemplate, ".ribbon", controllersContainer));

	}

}

const initializeControllers = () => {

	window.ribbon = new Ribbon();

}
