draggingElement = null;

class HTMLRepresentative {

	element;

	constructor(element) {
		this.element = element;
		this.element.jsObj = this;
	}

	static newSVGElement(name, attributes){
		let el = document.createElementNS(
			"http://www.w3.org/2000/svg", name);
		HTMLRepresentative.updateAttributes(el, attributes);
		return el;
	}

	static newHTMLElement(name, attributes){
		let el = document.createElement(name);
		HTMLRepresentative.updateAttributes(el, attributes);
		return el;		
	}

	static newSVGInstance(name, attributes){
		return new HTMLRepresentative(
			HTMLRepresentative.newSVGElement(name, attributes));
	}

	static newHTMLInstance(name, attributes){
		return new HTMLRepresentative(
			HTMLRepresentative.newHTMLElement(name, attributes));
	}

	static updateAttributes(element, attributes){
		for (const [key, value] of Object.entries(attributes || {}))
			element.setAttribute(key, value);
	}

}

class AutocompleteList extends HTMLRepresentative {

	_inputs;

	constructor(name) {
		super(document.createElement("datalist"));
		this.element.setAttribute("id", name);
		document.getElementById("autocompletes").appendChild(this.element);
		this._inputs = [];
	}

	delete() {
		this.element.remove();
	}

	appendValue(value) {
		let option = document.createElement("option");
		option.setAttribute("value", value);
		this.element.appendChild(option);
	}

	clearValues() {
		let range = document.createRange();
		range.selectNodeContents(this.element);
		range.deleteContents();
	}

	get name() {
		return this.element.getAttribute("id");
	}

	set name(name) {
		this.element.setAttribute("id", name);
		for(const input of this._inputs)
			input.setAttribute("list", name);
	}

	get values() {
		return this.element.children.map(
			option => option.getAttribute("value"));
	}

	set values(list) {
		let instance = this;
		this.clearValues();
		list.forEach(value => instance.appendValue(value));
	}

	deleteValue(value) {
		for(const option of this.element.children)
			if(option.getAttribute("value") == value){
				option.remove();
				break;
			}
	}

	stickToInput(input) {
		this._inputs.push(input);
		input.setAttribute("list", this.name);
	}

	unstickInput(input) {
		this._inputs = this._inputs.filter(
			element => element !== input);
	}

}

document.body.addEventListener("mousemove", (e) => {

	if(!draggingElement) return;
	draggingElement._dragging = true;

	let dx = draggingElement._orig_x - e.clientX;
	let dy = draggingElement._orig_y - e.clientY;
	draggingElement._orig_x = e.clientX;
	draggingElement._orig_y = e.clientY;

	draggingElement._substitute_xy(dx, dy);

});

document.body.addEventListener("mouseup", (e) => draggingElement = null);

const registerDragHandler = (handler, draggable) => {

	handler.addEventListener("mousedown", (e) => {
		draggable._orig_x = e.clientX;
		draggable._orig_y = e.clientY;
		draggingElement = draggable;
	});

}
