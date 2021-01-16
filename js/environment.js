const controllersContainer = document.getElementById("controllers");

const ribbonTemplate = document.getElementById("ribbon_template");

let windowCenterX = window.innerWidth / 2;

const getWindowCenter = () => {
	return [
		window.innerWidth / 2,  // x
		window.innerHeight / 2  // y
	]
}

class Ribbon extends HTMLRepresentative {

	constructor() {

		super(HTMLRepresentative.elementFromTemplate(
			ribbonTemplate, ".ribbon", controllersContainer));

		this.element.querySelector(".add_node_button").addEventListener(
			"click", Ribbon.createNode);

	}

	static createNode(e) {

		const node = new KnotNode(
			...getWindowCenter(), `node ${nodesCounter}`);

	}

}

const initializeControllers = () => {

	window.ribbon = new Ribbon();

}
