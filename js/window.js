windowTemplate = document.getElementById("node_edit_window_template");
windowsContainer = document.getElementById("windows");

class Window extends HTMLRepresentative {

	constructor(name, containerFiller) {

		let fragment = windowTemplate.content
			.cloneNode(true).querySelector(".window");
	    fragment.querySelector(".header span").innerText = name;

		windowsContainer.appendChild(fragment);
		Window.updateWindowsContainer();
		super(windowsContainer.lastChild);

		containerFiller(this.element.querySelector(".container"));

		registerDragHandler(
			this.element.querySelector(".header"), this.element);
				this.element._substitute_xy = (dx, dy) => {

		let instance = this.element;
		this.element._substitute_xy = (dx, dy) => {
			instance.style.left = parseInt(instance.style.left, 10) - dx + "px";
			instance.style.top = parseInt(instance.style.top, 10) - dy + "px";
		}

	}

	}

	destroyDOM() {
		windowsContainer.remove(this.element);
		Window.updateWindowsContainer();
	}

	static updateWindowsContainer() {
		if(windowsContainer.children.length == 0)
			Window.deactivateWindowsContainer();
		else
			Window.activateWindowsContainer();
	}

	static activateWindowsContainer(newState) {
		windowsContainer.setAttribute("_state", "active");
	}

	static deactivateWindowsContainer(newState) {
		windowsContainer.setAttribute("_state", "inactive");
	}

}
