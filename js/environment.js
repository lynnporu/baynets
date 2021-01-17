class WindowController extends HTMLRepresentative {

	constructor(
		template,
		selector,
		container=document.getElementById("controllers")
	) {
		super(
			HTMLRepresentative.elementFromTemplate(
				template, selector, container));
	}

}

class Ribbon extends WindowController {

	constructor() {

		super(
			document.getElementById("ribbon_template"), ".ribbon");

		this.element.querySelector(".add_node_button").addEventListener(
			"click", Ribbon.createNode);

	}

	static createNode(e) {

		const node = new KnotNode(
			...newSafePosition(), `node ${nodesCounter}`);

	}

}

class StateString extends WindowController {

	_caption;
	_locked = false;

	constructor() {

		super(
			document.getElementById("state_string_template"), ".state_string");
		this._caption = this.element.querySelector("span");

	}

	get caption() {
		return this._caption.innerText;
	}

	set caption(text) {
		if(this._locked) return;
		this._caption.innerText = text;
	}

	lock() {
		this._locked = true;
	}

	unlock() {
		this._locked = false;
	}

	clear() {
		this.caption = "";
	}

}

const initializeControllers = () => {

	window.ribbon = new Ribbon();
	window.stateString = new StateString();
	Node.setDefaultStateString();

}
