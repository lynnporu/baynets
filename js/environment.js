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

		this.element.querySelector(".add_node_button")
			.addEventListener("click", Ribbon.createNode);

		this.element.querySelector(".save_button")
			.addEventListener("click", Serializator.saveWorksheet);

		this.element.querySelector(".open_button")
			.addEventListener("click", Serializator.openWorksheet);

	}

	static createNode(e) {

		const node = new KnotNode(
			...newSafePosition(), `node ${nodesCounter + 1}`);

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

class ContextMenu extends WindowController {

	static currentVisible = undefined;

	constructor(list) {

		super(
			document.getElementById("context_menu_template"), ".context_menu");

		const instance = this,
		      ul = this.element.querySelector("ul");

		for(const position of list){
			const item = document.createElement("li");
			item.innerText = position.name;
			item.addEventListener("click", (e) => {
				instance.hide();
				position.callback(e);
			});
			ul.appendChild(item);
		}

	}

	showAt(x, y) {

		if(ContextMenu.currentVisible)
			ContextMenu.currentVisible.hide();

		ContextMenu.currentVisible = this;

		this.element.style.top = y + "px";
		this.element.style.left = x + "px";
		this.element.setAttribute("_state", "visible");

	}

	hide() {
		this.element.setAttribute("_state", "hidden");
	}

}

document.addEventListener("contextmenu", (e) => {

	const element = document.elementFromPoint(e.clientX, e.clientY);

	if(
		!!element.contextMenuInvoker &&
		element.contextMenuInvoker instanceof ContextMenu
	){
		element.contextMenuInvoker.showAt(e.clientX, e.clientY);
		e.preventDefault();
		e.stopPropagation();
	}

});

document.addEventListener("click", (e) => {

	const element = document.elementFromPoint(e.clientX, e.clientY);

	if(element.className != "context_menu")
		if(ContextMenu.currentVisible)
			ContextMenu.currentVisible.hide();

})

class PerformanceError extends Error { ; }

const initializeControllers = () => {

	window.ribbon = new Ribbon();
	window.stateString = new StateString();
	Node.setDefaultStateString();

}
