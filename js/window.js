windowsContainer = document.getElementById("windows");

class Window extends HTMLRepresentative {

	constructor(template, width, height) {

		super(HTMLRepresentative.elementFromTemplate(
			template, ".window", windowsContainer));

		let header = this.element.querySelector(".header span");
		header.setAttribute("title", header.innerText);

		Window.updateWindowsContainer();

	    this.element.style.width = width || "150px";
	    this.element.style.height = height || "100px";
	    this.horizontalCenter();
	    this.verticalCenter();

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

	horizontalCenter() {
	    this.element.style.left =
	    	(window.innerWidth - this.element.clientWidth) / 2 + "px";
	}

	verticalCenter() {
	    this.element.style.top =
	    	(window.innerHeight - this.element.clientHeight) / 2 + "px";		
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
