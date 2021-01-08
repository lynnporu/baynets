arrowsContainer = document.getElementById('arrows');

class SVGElement {

	element;

	static createElement(name, attributes) {
		const el = document.createElementNS(
			"http://www.w3.org/2000/svg", name);
		for (const [key, value] of Object.entries(attributes))
			el.setAttribute(key, value);
		return el;
	}

}

class Arrow {

	constructor(x1, y1, x2, y2) {
		this.element = SVGElement.createElement("line", {
			"x1": x1,
			"y1": y1,
			"x2": x2,
			"y2": y2,
			"_state": "regular"
		});
		arrowsContainer.appendChild(this.element);
	}

	get state() {
		return this.element.getAttribute("_state");
	}

	set state(name) {
		if(!["regular", "income", "outcome"].includes(name))
			throw TypeError(
				"Arrow can onle have `regular`, `income` or " +
				"`outcome` state"
			);
		this.element.setAttribute("_state", name);
	}

}