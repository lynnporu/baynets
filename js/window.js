windowTemplate = document.getElementById("node_edit_window_template");
windowsContainer = document.getElementById("windows");

class Window extends HTMLRepresentative {

	constructor(name, containerFiller, width, height) {

		let fragment = windowTemplate.content
			.cloneNode(true).querySelector(".window");
	    fragment.querySelector(".header span").innerText = name;

		windowsContainer.appendChild(fragment);
		Window.updateWindowsContainer();
		super(windowsContainer.lastChild);

	    this.element.style.width = (width || 150) + "px";
	    this.element.style.height = (height || 100) + "px";
	    this.element.style.left =
	    	(document.body.clientWidth - this.element.clientWidth) / 2 + "px";
	    this.element.style.top = "200px";

		containerFiller(this.element.querySelector(".container"));

		registerDragHandler(
			this.element.querySelector(".header"), this.element);

		let instance = this;

		this.element._substitute_xy = (dx, dy) => {
			instance.element.style.left =
				parseInt(instance.element.style.left, 10) - dx + "px";
			instance.element.style.top =
				parseInt(instance.element.style.top, 10) - dy + "px";
		}

		this.element.querySelector(".close_button").addEventListener("click",
			e => instance.destroyDOM());


	}

	destroyDOM() {
		windowsContainer.removeChild(this.element);
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
