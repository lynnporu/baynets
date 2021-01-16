const sandboxContainer = document.getElementById("sandbox");
const arrowsContainer = document.getElementById('arrows');
const nodesContainer = document.getElementById("nodes");

let draggingNode = null;

let nodesCounter = 1;

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

		registerClickEvent(this.element, (e) => {
			if(!instance.element._dragging)
				instance.knotParametersWindow();
			else
				instance.element._dragging = false;	
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

		nodesCounter++;

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

		let instance = this;

		this.element.append(this.rectElement);
		this.element.append(this.textElement);
		nodesContainer.append(this.element);

		this.caption = text;
		this.updateBounds();

		this._positiveProbability = positiveProbability;
		this._causeProbabilities = [];

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

		const calculatedSize = Math.pow(2, this.incomeArrows.length);

		// Oversize
		if(this._causeProbabilities.length > calculatedSize)
			this._causeProbabilities.splice(calculatedSize);

		// Size is not big enough
		else if (this._causeProbabilities.length < calculatedSize)
			this._causeProbabilities = [
				...this._causeProbabilities,
				...Array(
					calculatedSize - this._causeProbabilities.length
				).fill(0)
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

	positiveConditionalProbability(causes, bools) {
		/*Calculates
		* P(
		*	this node |
		*	cause is bool
		*	for causes, bool
		*	in zip(causes, bools)
		* )
		* For example, conditionalProbability([a1, a2], [true, false]) means
		* P(this node | a1, not a2)
		*/
		const nodeCauses = this.causes;
		const indices = causes.map(cause => nodeCauses.indexOf(cause));
		const trueIndices = [], falseIndices = [];
		for(const [i, bool] of bools.entries())
			(bool ? trueIndices : falseIndices).push(indices[i]);

		let probability = 0;

		combinationsWithFix(
			nodeCauses.length, trueIndices, falseIndices
		).forEach(
			combination =>
				probability += this._positiveProbability(combination)
		);

		return probability;

	}

	negativeConditionalProbability(causes, bools) {
		return 1 - this.positiveProbability(causes, bools);
	}

	knotParametersWindow(){

		this._openedSettingsWindow = new KnotNodeWindow(this);

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

	_valid = true;

	constructor(node) {

		this._window = new Window(
			document.getElementById("knot_node_edit_window_template"),
			"auto", "auto"
		);
		this._node = node;

		this.setElements();

	}

	setElements() {
		let instance = this;

		this._window.element.querySelector(".name_input").value = this._node.caption;

        this._window.element.querySelector("table")
            .replaceWith(this.generateTable().element);

		this._window.element.querySelector(".save_button").addEventListener(
			"click", (e) => instance.saveAndClose());
	}

	saveAndClose() {
		if(!this._valid) return;
		this._node.caption = this._window.element.querySelector(".name_input").value;
		this._window.destroyDOM();
	}

	generateTable() {

        let instance = this;
		let htmlinstance = HTMLRepresentative.newHTMLInstance("table");
		let width = this._node.incomeArrows.length;

		if(width == 0)
			htmlinstance.element.classList.toggle("noCauses");

        const probabilityInput = `<input type="number" step="0.01">`;

        htmlinstance.element.innerHTML = [
            "<tr>",
                this._node.causes
                	.map(node => `<td>${node.caption}</td>`).join(""),
                `<td>${this._node.caption}</td>`,
                `<td>\u00ac${this._node.caption}</td>`,
            "</tr>"
        ].join("");

        for(
            const [bools, probab]
            of zip(
                [...binaryCombinations(width)],
                this._node.causeProbabilities
            )
        ){

        	let row = htmlinstance.element.insertRow();

        	row.innerHTML = bools
				.toBinaryArray(width)
				.map(binary => `<td>${binary ? "T" : "F"}</td>`)
				.join("");

           ;

			let positiveCell = document.createElement("td");
			positiveCell.innerHTML = probabilityInput;
			let positiveInput = positiveCell.children[0];

			positiveInput.value = probab;

			let negativeCell = document.createElement("td");
			negativeCell.innerHTML = probabilityInput;
			let negativeInput = negativeCell.children[0];

			negativeInput.value = (1 - probab).toString();

			row.appendChild(positiveCell);
			row.appendChild(negativeCell);

			const markError = () => {
				KnotNodeWindow.markErrorInput(positiveInput);
				KnotNodeWindow.markErrorInput(negativeInput);
				this._valid = false;
			}

			const hideError = () => {
				KnotNodeWindow.hideErrorInput(positiveInput);
				KnotNodeWindow.hideErrorInput(negativeInput);
				this._valid = true;
			}

			positiveInput.onchange = (e) => {

				const newProbab = positiveInput.value * 1;

				if(newProbab < 0 || newProbab > 1)
				    markError();
				else
				    hideError();

				instance._node.causeProbabilities[bools] = newProbab;
				negativeInput.value = (1 - newProbab).toFixed(3);

			}

			negativeInput.onchange = (e) => {

				const newProbab = negativeInput.value * 1;

				if(newProbab < 0 || newProbab > 1)
				    markError();
				else
				    hideError();

				instance._node.causeProbabilities[bools] = 1 - newProbab;

				positiveInput.value = (1 - newProbab).toFixed(3);

			}

        }

		return htmlinstance;

	}

	static markErrorInput(input) {
		input.setAttribute("_state", "error");
		input.setAttribute("title", getLocString("probability_invalid"));
	}

	static hideErrorInput(input) {
		input.setAttribute("_state", "");
		input.setAttribute("title", "");
	}

}
