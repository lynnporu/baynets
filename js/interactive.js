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
