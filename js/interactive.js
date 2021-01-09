draggingElement = null;

class HTMLRepresentative {

	element;

	static newSVGElement(name, attributes){
		let el = document.createElementNS(
			"http://www.w3.org/2000/svg", name);
		HTMLRepresentative.updateAttributes(el, attributes);
		return el;
	}

	static updateAttributes(element, attributes){
		for (const [key, value] of Object.entries(attributes || {}))
			element.setAttribute(key, value);
	}

	constructor(name, attributes) {
		this.element = HTMLRepresentative.newSVGElement(name, attributes);
		this.element.jsObj = this;
	}

}

document.body.addEventListener("mousemove", (e) => {

	if(!draggingElement) return;
	draggingElement._dragging = true;

	e.preventDefault();

	let dx = draggingElement._orig_x - e.clientX;
	let dy = draggingElement._orig_y - e.clientY;
	draggingElement._orig_x = e.clientX;
	draggingElement._orig_y = e.clientY;

	draggingElement._substitute_xy(dx, dy);

});

const registerDragHandler = (handler, draggable) => {

	handler.addEventListener("mousedown", (e) =>
		draggingElement = draggable);

	handler.addEventListener("mouseup", (e) =>
		draggingElement = null);

}
