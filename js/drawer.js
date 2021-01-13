sandboxContainer = document.getElementById("sandbox");
arrowsContainer = document.getElementById('arrows');
nodesContainer = document.getElementById("nodes");

draggingNode = null;

class Arrow extends HTMLRepresentative {

	fromNode;
	toNode;

	positiveProbability;

	_thickness;

	constructor(x1, y1, x2, y2, positiveProbability) {
		super(HTMLRepresentative.newSVGElement("line", {
			"x1": x1,
			"y1": y1,
			"x2": x2,
			"y2": y2,
			"_state": "regular"
		}));
		arrowsContainer.append(this.element);
		this.positiveProbability = 0 || positiveProbability;
	}

	static betweenNodes(node1, node2) {

		const arrow = new Arrow(0, 0, 0, 0);
		arrow.connectNodes(node1, node2);
		arrow.fromNode = node1;
		arrow.toNode = node2;

		return arrow;

	}

	get thickness() {
		return this._thickness;
	}

	set thickness(number) {
		if(number < 0 || number > 1)
			throw RangeError(
				"Thickness should lie in [0; 1] range"
			);
		this._thickness = number;
		this.updateArrowStyle();
	}

	updateArrowStyle() {
		const l_hex = (this._thickness * 180 + 75).toString(16),
		      stroke = this._thickness * 0.7 + 1;
		this.element.setAttribute("stroke", `#${l_hex}${l_hex}${l_hex}`);
		this.element.setAttribute("stroke-width", `${stroke}px`);
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
	
	_positiveProbability;
	_causeProbabilities;

	constructor(x, y, text, positiveProbability) {

		super(HTMLRepresentative.newSVGElement("svg", {
			"x": x,
			"y": y,
			"height": 40,
			"class": "node-group knot"
		}));

		this._text = text;

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

		this._positiveProbability = positiveProbability;

	}

	get hasCauses() {
		return this.incomeArrows.length > 0;
	}

	get causes() {
		return this.incomeArrows.map(arrow => arrow.fromNode);
	}

	get consequences() {
		return this.outcomeArrows.map(arrow => arrow.toNode);
	}

	ensureProbabilitiesVectorSize() {
		const calculatedSize = Math.pow(this.incomeArrows.length , 2);
		if(this._causeProbabilities.length > calculatedSize)
			// Oversize
			this._causeProbabilities.splice(calculatedSize);
		else
			// Size is not big enough
			this._causeProbabilities = [
				...this._causeProbabilities,
				...Array(calculatedSize - this.incomeArrows.length).fill(0)
			];
	}

	get causeProbabilities() {
		this.ensureProbabilitiesVectorSize();
		return this._causeProbabilities;
	}

	set positiveProbability(number) {
		checkProbability(number);
		if(!this.hasCauses)
			this._positiveProbability = number;
		else
			throw TypeError("Cannot set probability for node with causes.");
	}

	set negativeProbability(number) {
		checkProbability(number);
		this._positiveProbability = 1 - number;
	}

	get positiveProbability() {
		if(!this.hasCauses)
			return this._positiveProbability;
		else{
			throw Error("Not implemented for node with causes");
		}
	}

	get negativeProbability() {
		return 1 - this._positiveProbability;
	}

	showParametersWindow(){
		
		const windw = new Window(
			document.getElementById("knot_node_edit_window_template"),
			"200px", "auto"
		);
		this._openedSettingsWindow = windw;

		let instance = this;

		windw.element.querySelector(".name_input").value = this._text;

		windw.element.querySelector(".save_button").addEventListener(
			"click", (e) => {

				instance.caption =
					windw.element.querySelector(".name_input").value;

			});

	}

	get caption() {
		return this._text;
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

	get incomeNames() {
		return this.incomeArrows.map(arrow => arrow.fromNode.caption);
	}

}

class KnotNodeWindow {

	_node;
	_window;
	_table;

	constructor(node, nodes) {

		this._window = new Window(
			document.getElementById("knot_node_edit_window_template"),
			"200px", "auto"
		);
		this._nodes = nodes;
		this._table = nodes._probabilities;

	}

	generateTable() {

		let table_html = "";

		let i = 0;

		for(const combination of binaryCombinations(this._table.length)){

			i++;

			let variable_truths = combination
				.map(value => value === true ? "T" : "F")
				.map(text => `<td>${text}</td>`)
				.join("");
			
			table_html += ```
			<tr>
				${variable_truths}
				<td contenteditable>${this._table[i][0]}</td>
				<td contenteditable>${this._table[i][1]}</td>
			</tr>
			```

		}

		let element = new HTMLRepresentative(this);
		element.innerHTML = table_html;

		return element;

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
