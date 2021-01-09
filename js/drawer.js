sandboxContainer = document.getElementById("sandbox");
arrowsContainer = document.getElementById('arrows');
nodesContainer = document.getElementById("nodes");

draggingNode = null;

class Arrow extends HTMLRepresentative {

	fromNode;
	toNode;

	_probability;

	constructor(x1, y1, x2, y2, probability) {
		super(HTMLRepresentative.newSVGElement("line", {
			"x1": x1,
			"y1": y1,
			"x2": x2,
			"y2": y2,
			"_state": "regular"
		}));
		arrowsContainer.append(this.element);
		this.probability = 0;
	}

	static betweenNodes(node1, node2) {

		const arrow = new Arrow(0, 0, 0, 0);
		arrow.connectNodes(node1, node2);
		arrow.fromNode = node1;
		arrow.toNode = node2;

		return arrow;

	}

	get probability() {
		return this._probability;
	}

	set probability(number) {
		if(number < 0 || number > 1)
			throw RangeError(
				"Probability should lie in [0; 1] range"
			);
		this._probability = number;
		this.updateArrowColor();
	}

	updateArrowColor() {
		const l_hex = ((this.probability * 160) + 95).toString(16),
		      color = `#${l_hex}${l_hex}${l_hex}`;
		this.element.setAttribute("stroke", color);
	}

	connectNodes(node1, node2) {
		/*This update only coordinates, not this.fromNode and this.toNode. */

		const
			possibleArrows = [
				...combinations_no_repetition(
					node1.connectors, node2.connectors)
			],

			shortestArrow = possibleArrows
				.map((points) => distance(...points[0], ...points[1]))
				.min_index(),

			[point1, point2] = [...possibleArrows[shortestArrow]];

		HTMLRepresentative.updateAttributes(this.element, {
			"x1": point1[0],
			"y1": point1[1],
			"x2": point2[0],
			"y2": point2[1]
		});

	}

	updateNodeRelations() {
		this.connectNodes(this.fromNode, this.toNode);
	}

	get state() {
		return this.element.getAttribute("_state");
	}

	set state(name) {
		if(!["regular", "income", "outcome"].includes(name))
			throw TypeError(
				"Arrow can onle have `regular`, `income` or " +
				"`outcome` state"
			);
		this.element.setAttribute("_state", name);
	}

}

class Node extends HTMLRepresentative {

	outcomeArrows = [];
	incomeArrows = [];
	_boundingRect;
	_openedSettingsWindow = null;
	// moving properties
	_orig_x = 0;
	_orig_y = 0;

	// Redefines HTMLRepresentative constructor
	constructor() {

		super(...arguments);

		let instance = this;

		this.element.addEventListener("mousedown", (e) => {
			instance.toUpperLayer();
		});

		registerDragHandler(this.element, this.element);

		this.element.addEventListener("mouseover", (e) => {
			instance.outcomeArrows.forEach((arrow) =>
				arrow.state = "outcome");
			instance.incomeArrows.forEach((arrow) =>
				arrow.state = "income");
		});

		this.element.addEventListener("mouseleave", (e) => {
			instance.outcomeArrows.forEach((arrow) =>
				arrow.state = "regular");
			instance.incomeArrows.forEach((arrow) =>
				arrow.state = "regular");
		});

		this.element.addEventListener("click", (e) => {
			if(!instance.element._dragging)
				instance.showParametersWindow();
			else
				instance.element._dragging = false;			
		});

		this.element._substitute_xy = (dx, dy) => {

			HTMLRepresentative.updateAttributes(instance.element, {
				"x": instance.element.getAttribute("x") - dx,
				"y": instance.element.getAttribute("y") - dy
			});

			const updateArrows = (arrow) => arrow.updateNodeRelations();
			instance.updateBounds();
			instance.outcomeArrows.forEach(updateArrows);
			instance.incomeArrows.forEach(updateArrows);

		}

	}

	toUpperLayer(){
		// The old element will be automatically removed;
		nodesContainer.append(this.element);
	}

	updateBounds(){
		this._boundingRect = this.element.getBoundingClientRect();
	}

	get bound(){
		if(!this._boundingRect) this.updateBounds();
		return this._boundingRect;
	}

	get northPoint(){
		return [
			this.bound.left + (this.bound.width / 2),
			this.bound.top
		];
	}

	get southPoint(){
		return [
			this.bound.left + (this.bound.width / 2),
			this.bound.top + this.bound.height
		];
	}

	get eastPoint(){
		return [
			this.bound.left + this.bound.width,
			this.bound.top + (this.bound.height / 2)
		];
	}

	get westPoint(){
		return [
			this.bound.left,
			this.bound.top + (this.bound.height / 2)
		];
	}

	get connectors(){
		return [
			this.northPoint, this.southPoint, this.eastPoint, this.westPoint
		];
	}

	connectTo(other){

		const arrow = Arrow.betweenNodes(this, other);
		arrow.fromNode = this;
		arrow.toNode = other;
		this.outcomeArrows.push(arrow);
		other.incomeArrows.push(arrow);
		return arrow;

	}

}

class KnotNode extends Node {

	_text;
	rectElement;
	textElement;

	constructor(x, y, text) {

		super(HTMLRepresentative.newSVGElement("svg", {
			"x": x,
			"y": y,
			"height": 40,
			"class": "node-group knot"
		}));

		this.text = text;

		this.rectElement = HTMLRepresentative.newSVGElement("rect", {
			"x": 0,
			"y": 0
		})

		this.textElement = HTMLRepresentative.newSVGElement("text", {
			"x": 10,
			"y": 25
		})

		this.element.append(this.rectElement);
		this.element.append(this.textElement);
		nodesContainer.append(this.element);

		this.caption = text;
		this.updateBounds();

	}


	showParametersWindow(){
		
		const windw = new Window(
			document.getElementById("knot_node_edit_window_template"),
			"200px", "auto"
		);

		this._openedSettingsWindow = windw;

	}

	set caption(text) {

		this._text = text;
		if(text.length > 50)
			text = text.slice(0, 47) + "...";
		this.textElement.innerHTML = text;

		const rectWidth = this.textElement.getBoundingClientRect().width;
		this.element.setAttribute("width", rectWidth + 30 + "px");
		this.rectElement.setAttribute("width", rectWidth + 30 + "px");
		this.textElement.setAttribute("x", (rectWidth / 2) + 15);

		this.updateBounds;

	}

}

// let n1 = new KnotNode(170, 170, "node1");
// let n2 = new KnotNode(180, 270, "node2");
// let n3 = new KnotNode(380, 370, "node3");
// let n4 = new KnotNode(10, 10, "node4");
// n1.connectTo(n2);
// n2.connectTo(n3);
// n3.connectTo(n4);
// n4.connectTo(n2);
// n3.connectTo(n4);
// n1.connectTo(n4);
// n3.connectTo(n1);
