const sandboxContainer = document.getElementById("sandbox");
const arrowsContainer = document.getElementById('arrows');
const nodesContainer = document.getElementById("nodes");

let draggingNode = null;

let nodesCounter = 1;

class Arrow extends HTMLRepresentative {

	fromNode;
	toNode;

	_thickness;

	constructor(x1, y1, x2, y2, thickness) {
		super(HTMLRepresentative.newSVGElement("line", {
			"x1": x1,
			"y1": y1,
			"x2": x2,
			"y2": y2,
			"_state": "regular"
		}));
		arrowsContainer.append(this.element);
		this.element.draggingIsForbidden = false;
		this._thickness = .5 || thickness;
		this.updateArrowStyle();
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

		this.updateAttributes({
			"x1": point1[0],
			"y1": point1[1],
			"x2": point2[0],
			"y2": point2[1]
		});

	}

	connectNodeToPoint(node, point) {
		/*Update coordinates of the Arrow. */

		const shortestArrow = node.connectors.map(
			connector => distance(...connector, ...point)
		).min_index(),

		      pointFrom = node.connectors[shortestArrow];

		this.updateAttributes({
			"x1": pointFrom[0],
			"y1": pointFrom[1],
			"x2": point[0],
			"y2": point[1]
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
			instance.element.setAttribute("_state", "pressed");
			// This method renew the element in DOM, so event listeners
			// disappears.
			// instance.toUpperLayer();
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
			instance.updateArrows();

		}

		nodesCounter++;

	}

	updateArrows() {
		const updater = (arrow) => arrow.updateNodeRelations();
		this.updateBounds();
		this.outcomeArrows.forEach(updater);
		this.incomeArrows.forEach(updater);
	}

	delete(){

		document.body.removeEventListener("mouseup", this._mouseup_listener);
		nodesContainer.removeChild(this.element);

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

	static template = document.getElementById("knot_node_template");
	
	_positiveProbability;
	_causeProbabilities;

	_connecting_arrow = undefined;

	_mouseup_listener = () => {};
	_mousemove_listener = () => {};
	_polyline_is_clicked = false;

	constructor(x, y, text, positiveProbability) {

		super(HTMLRepresentative.elementFromTemplate(
			KnotNode.template, "svg", nodesContainer));

		const instance = this;

		this.updateAttributes({
			"x": x,
			"y": y
		});

		this._text = text;

		this.rectElement = this.element.querySelector("rect");
		this.textElement = this.element.querySelector("text");
		this.polylineElement = this.element.querySelector("polyline");

		this.polylineElement.addEventListener(
			"mousedown", KnotNode.polylineMousedown.bind(this));
		this.polylineElement.dropSource = this;

		this._mouseup_listener = KnotNode.polylineMouseup.bind(this);
		document.body.addEventListener("mouseup", this._mouseup_listener);

		this.caption = text;
		this.updateBounds();

		this._positiveProbability = positiveProbability;
		this._causeProbabilities = [];

	}

	static polylineMousedown(e) {
		// e.preventDefault();
		this._polyline_is_clicked = true;
		this.polylineElement.setAttribute("_state", "dragging");
		this.element.draggingIsForbidden = true;
		this._connecting_arrow = new Arrow(0, 0, 0, 0);
		this._connecting_arrow.connectNodeToPoint(this, [e.clientX, e.clientY]);
		this._mousemove_listener = KnotNode.polylineMousemove.bind(this);
		document.body.addEventListener("mousemove", this._mousemove_listener);
	}

	static polylineMouseup(e) {
		this.element.setAttribute("_state", "");
		this.polylineElement.setAttribute("_state", "");
		if(!this._polyline_is_clicked) return;
		else this._polyline_is_clicked = false;

		this.element.draggingIsForbidden = false;
		document.body.removeEventListener("mousemove", this._mousemove_listener);
		this._mousemove_listener = undefined;

		this._connecting_arrow.element.remove();
		delete this._connecting_arrow;

		let elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
		if(
			elementUnderMouse.tagName == "polyline" &&
			!!elementUnderMouse.dropSource
		){
			this.connectTo(elementUnderMouse.dropSource);
		}
	}

	static polylineMousemove(e) {
		this._connecting_arrow.connectNodeToPoint(this, [e.clientX, e.clientY]);

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
		if(text.length > 20)
			text = text.slice(0, 17) + "...";
		this.textElement.innerHTML = text;

		this.updateSizes();
		this.updateArrows();

	}

	updateSizes() {
		const textWidth = this.textElement.getBoundingClientRect().width;
		const rectWidth = textWidth + 30;

		this.element.setAttribute("width", rectWidth + "px");
		this.rectElement.setAttribute("width", rectWidth + "px");
		this.textElement.setAttribute("x", (textWidth / 2) + 15);

		this.polylineElement.setAttribute("points",
			`0,0 ${rectWidth},0 ${rectWidth},40 0,40 0,0`);
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
                	.map(node => 
                		`<th title="${node.caption}">
	                		${node.caption}
                		</th>`
                	).join(""),
                `<th>${this._node.caption}</th>`,
                `<th>\u00ac${this._node.caption}</th>`,
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
