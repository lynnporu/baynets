sandboxContainer = document.getElementById("sandbox");
arrowsContainer = document.getElementById('arrows');
nodesContainer = document.getElementById("nodes");

class SVGElement {

	element;

	constructor(name, attributes) {
		this.element = document.createElementNS(
			"http://www.w3.org/2000/svg", name);
		this.updateAttributes(attributes);
	}

	updateAttributes(attributes){
		for (const [key, value] of Object.entries(attributes))
			el.setAttribute(key, value);

	}

}

class Arrow extends SVGElement {

	constructor(x1, y1, x2, y2) {
		super("line", {
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

class Node extends SVGElement {

	outcomeArrows;
	incomeArrows;
	_boundingRect;

	refreshBound(){
		this._boundingRect = this.element.getBoundingClientRect();
	}

	get bound(){
		if(!this._boundingRect) this.refreshBound();
		return this._boundingRect;
	}

	get northPoint(){
		console.log(this.bound);
		return [
			this.bound.left + (this.bound.width / 2),
			this.bound.top
		];
	}

	get southPoint(){
		return [
			this.bound.left + (this.bound.width / 2),
			this.bound.top + this.bound.height
		];
	}

	get eastPoint(){
		return [
			this.bound.left + this.bound.width,
			this.bound.top + (this.bound.height / 2)
		];
	}

	get westPoint(){
		return [
			this.bound.left,
			this.bound.top + (this.bound.height / 2)
		];
	}

}

class KnotNode extends Node {

	_text;
	rectElement;
	textElement;

	constructor(x, y, text) {

		super("svg", {
			"x": x,
			"y": y,
			"height": 40,
			"class": "node-group knot"
		});

		this.text = text;

		this.rectElement = SVGElement.createElement("rect", {
			"x": 0,
			"y": 0
		})

		this.textElement = SVGElement.createElement("text", {
			"x": 10,
			"y": 25
		})

		this.element.appendChild(this.rectElement);
		this.element.appendChild(this.textElement);
		nodesContainer.appendChild(this.element);

		this.caption = text;
		this.refreshBound();

	}

	set caption(text) {

		this._text = text;
		if(text.length > 90)
			text = text.slice(0, 87) + "...";
		this.textElement.innerHTML = text;

		const rectWidth = this.textElement.getBoundingClientRect().width;
		this.element.setAttribute("width", rectWidth + 30 + "px");
		this.rectElement.setAttribute("width", rectWidth + 30 + "px");
		this.textElement.setAttribute("x", (rectWidth / 2) + 15);

		this.refreshBound;

	}

}
