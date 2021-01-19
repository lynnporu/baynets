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

		this.element.querySelector(".settings_button")
			.addEventListener("click", Settings.showWindow);

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

	host;

	constructor(host, list) {

		super(
			document.getElementById("context_menu_template"), ".context_menu");

		this.host = host;

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

		this.host.element.draggingIsForbidden = true;

		this.element.style.top = y + "px";
		this.element.style.left = x + "px";
		this.element.setAttribute("_state", "visible");

	}

	hide() {
		this.host.element.draggingIsForbidden = false;
		this.element.setAttribute("_state", "hidden");
	}

}

class Settings {

	static _settings_window = undefined;

	static defaultSettings = {
		"MAXIMUM_BFS_ITERATIONS": 1000,
		"MAXIMUM_TREE_BACKTRACE_ITERATIONS": 1000
	}

	static getSetting(key) {

		if(!(key in Settings.defaultSettings))
			throw TypeError(`Setting ${key} does not exist`);

		let value = localStorage.getItem(key);
		if(!value){
			value = Settings.defaultSettings[key];
			localStorage.setItem(key, value);
		}

		return value;

	}

	static redefineSetting(key, value) {

		if(!(key in Settings.defaultSettings))
			throw TypeError(`Setting ${key} does not exist`);

		localStorage.setItem(key, value);

	}

	static showWindow() {

		if(Settings._settings_window) return;

		const windw = new Window(
			document.getElementById("settings_template"),
			"auto", "auto");
		Settings._settings_window = windw;

		Settings.resetWindow();

		windw.element.querySelector(".save_button").addEventListener(
			"click", Settings.applySettings);

	}

	static resetWindow() {

		const windw = Settings._settings_window;
		if(!windw) return;

		windw.element.querySelector(".language").value = currentLocalization;
		windw.element.querySelector(".maximum_bfs").value =
			Settings.getSetting("MAXIMUM_BFS_ITERATIONS")
		windw.element.querySelector(".maximum_backtrace").value =
			Settings.getSetting("MAXIMUM_TREE_BACKTRACE_ITERATIONS")

	}

	static applySettings() {

		const windw = Settings._settings_window;

		Settings.redefineSetting(
			"MAXIMUM_BFS_ITERATIONS",
			windw.element.querySelector(".maximum_bfs").value
		);

		Settings.redefineSetting(
			"MAXIMUM_TREE_BACKTRACE_ITERATIONS",
			windw.element.querySelector(".maximum_backtrace").value
		);

		const newLocalization = windw.element.querySelector(".language").value;

		if(newLocalization != currentLocalization){
			setLocalization(newLocalization);
			alert(getLocString("reload_to_apply_language"));
		}

		windw.destroyDOM();
		Settings._settings_window = undefined;

	}

}

document.body.addEventListener("contextmenu", (e) => {

	const element = document.elementFromPoint(e.clientX, e.clientY);

	if(
		!!element.contextMenuInvoker &&
		element.contextMenuInvoker instanceof ContextMenu
	){
		e.preventDefault();
		e.stopPropagation();
		element.contextMenuInvoker.showAt(e.clientX, e.clientY);
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
	window.settings = new Settings();
	Node.setDefaultStateString();

}
