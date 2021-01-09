windowsContainer = document.getElementById("windows");

class Window extends HTMLRepresentative {

	constructor(name, template, width, height) {

		let fragment = template.content
			.cloneNode(true).querySelector(".window");

		Window.localizeElement(fragment);

	    fragment.querySelector(".header span").innerText = name;

		windowsContainer.appendChild(fragment);
		Window.updateWindowsContainer();
		super(windowsContainer.lastChild);

	    this.element.style.width = width || "150px";
	    this.element.style.height = height || "100px";
	    this.element.style.left =
	    	(document.body.clientWidth - this.element.clientWidth) / 2 + "px";
	    this.element.style.top = "200px";

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

	static localizeElement(element) {
		/*Replace strings like `$LOC:...` to locale strings.
		* DO NOT USE this method on elements you don't want to lose event
		* handlers of.
		*/
		element.innerHTML = element.innerHTML.replace(
			/\$LOC:[\w]+/g,
			match => getLocString(match.substring(5))
		);

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
