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

	_caption_element;
	_old_caption = "";
	_locked = false;
	_locked_with = undefined;

	constructor() {

		super(
			document.getElementById("state_string_template"), ".state_string");
		this._caption_element = this.element.querySelector("span");

	}

	get caption() {
		return this._caption_element.innerText;
	}

	set caption(text) {
		if(this._locked) return;
		this._caption_element.innerText = text;
	}

	lock(key=1) {
		if(this._locked) return;
		this._locked = true;
		this._locked_with = key;
	}

	unlock(key=1) {
		if(this._locked_with !== key) return;
		this._locked = false;
	}

	clear() {
		this.caption = "";
	}

	setTempCaption(text, time=2000) {
		this._old_caption = this.caption;
		this.caption = text;
		this.lock("temp");
		setTimeout(StateString.setOldCaption.bind(this), time);
	}

	static setOldCaption() {
		this.unlock("temp");
		this.caption = this._old_caption;
		this._old_caption = "";
	}

}

const initializeControllers = () => {

	window.ribbon = new Ribbon();
	window.stateString = new StateString();
	Node.setDefaultStateString();

}
