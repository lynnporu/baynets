const sandboxContainer = document.getElementById("sandbox");
const arrowsContainer = document.getElementById('arrows');
const nodesContainer = document.getElementById("nodes");
const nodeCaptionsContainer = document.getElementById("node_captions");

let draggingNode = null;

let nodesCounter = 0;

class Arrow extends HTMLRepresentative {

	fromNode;
	toNode;

	static template = document.getElementById("arrow_template");

	_thickness;

	constructor(x1, y1, x2, y2, thickness) {

		super(HTMLRepresentative.elementFromTemplate(
			Arrow.template, "svg", arrowsContainer));

		let instance = this;

		this.lineElement = this.element.querySelector("line.stroke");
		this.shadowElement = this.element.querySelector("line.shadow");

		this.shadowElement.contextMenuInvoker =
		this.lineElement.contextMenuInvoker = new ContextMenu(this, [
			{
				"name": getLocString("arrow_delete"),
				"callback": (e) => {
					instance.delete();
				}	
			},
			{
				"name": getLocString("arrow_reverse"),
				"callback": (e) => {
					instance.reverse();
				}
			}
		]);

		this.coordinates = {
			"x1": x1,
			"y1": y1,
			"x2": x2,
			"y2": y2			
		}

		this.element.draggingIsForbidden = false;
		this._thickness = .5 || thickness;
		this.updateArrowStyle();
	}

	delete() {
		super.delete();
		this.fromNode.outcomeArrows.delete(this);
		this.toNode.incomeArrows.delete(this);
		Serializator.unregisterSerializable(this);
	}

	reverse() {
		this.fromNode.outcomeArrows.delete(this);
		this.toNode.incomeArrows.delete(this);
		this.fromNode.incomeArrows.push(this);
		this.toNode.outcomeArrows.push(this);
		[this.fromNode, this.toNode] = [this.toNode, this.fromNode];
		this.updateNodeRelations();
	}

	set coordinates(dict) {
		/*Expecting dict with x1, y1, x2, y2 keys. */
		HTMLRepresentative.updateAttributes(this.lineElement, dict);
		HTMLRepresentative.updateAttributes(this.shadowElement, dict);
	}

	get serializedObject() {
		return {
			"f": this.fromNode.uuid, /* from */
			"t": this.toNode.uuid,   /* to */
			"th": this.thickness     /* thickness */
		};
	}

	static fromSerialized(uuid, dump){
		const instance = Arrow.betweenNodes(
			HTMLRepresentative.getInstanceByUUID(dump["f"] /* from */),
			HTMLRepresentative.getInstanceByUUID(dump["t"] /* to */)
		);
		instance.thickness = dump["th"] /* thickness */;
		instance.uuid = uuid;
		HTMLRepresentative.registerInstanceByUUID(instance);
		return instance;
	}

	static betweenNodes(node1, node2) {

		const arrow = new Arrow(0, 0, 0, 0);
		node1.outcomeArrows.push(arrow);
		node2.incomeArrows.push(arrow);
		arrow.connectNodes(node1, node2);
		arrow.fromNode = node1;
		arrow.toNode = node2;
		arrow.registerSerializable(3);

		arrow.fromNode.restoreCaptionStates();
		arrow.toNode.restoreCaptionStates();

		arrow.element.setAttribute("_state", "stable");

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
		this.lineElement.setAttribute("stroke", `#${l_hex}${l_hex}${l_hex}`);
		this.lineElement.setAttribute("stroke-width", `${stroke}px`);
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

		this.coordinates = {
			"x1": point1[0],
			"y1": point1[1],
			"x2": point2[0],
			"y2": point2[1]
		};

	}

	connectNodeToPoint(node, point) {
		/*Update coordinates of the Arrow. */

		const shortestArrow = node.connectors.map(
				connector => distance(...connector, ...point)
			  ).min_index(),

		      pointFrom = node.connectors[shortestArrow];

		this.coordinates = {
			"x1": pointFrom[0],
			"y1": pointFrom[1],
			"x2": point[0],
			"y2": point[1]
		};

	}

	updateNodeRelations() {
		this.connectNodes(this.fromNode, this.toNode);
	}

	get state() {
		return this.lineElement.getAttribute("_state");
	}

	set state(name) {
		if(!["regular", "income", "outcome"].includes(name))
			throw TypeError(
				"Arrow can onle have `regular`, `income` or " +
				"`outcome` state"
			);
		this.lineElement.setAttribute("_state", name);
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
		nodesCounter++;
		let instance = this;

		this.registerSerializable(2);

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
			window.stateString.caption = (
				getLocNumericalLabel(
					"statestring_causes_length_cases",
					instance.incomeLength
				) + ", " +
				getLocNumericalLabel(
					"statestring_conseq_length_cases",
					instance.outcomeLength
				)
			);
		});

		this.element.addEventListener("mouseleave", (e) => {
			instance.outcomeArrows.forEach((arrow) =>
				arrow.state = "regular");
			instance.incomeArrows.forEach((arrow) =>
				arrow.state = "regular");
			if(!instance._drag_caption_is_set)
				Node.setDefaultStateString();
		});

		Node.setDefaultStateString();

	}

	static setDefaultStateString() {
		window.stateString.caption = getLocNumericalLabel(
			"statestring_nodes_cases", nodesCounter);
	}

	get incomeLength() {
		return this.incomeArrows.length;
	}

	get outcomeLength() {
		return this.outcomeArrows.length;
	}

	updateArrows() {
		const updater = (arrow) => arrow.updateNodeRelations();
		this.updateBounds();
		this.outcomeArrows.forEach(updater);
		this.incomeArrows.forEach(updater);
	}

	delete(){

		nodesCounter--;
		document.body.removeEventListener("mouseup", this._mouseup_listener);
		nodesContainer.removeChild(this.element);
		Node.setDefaultStateString();

	}

	toUpperLayer(){
		// The old element will be automatically removed;
		nodesContainer.append(this.element);
	}

	updateBounds(){
		this._boundingRect = this.rectElement.getBoundingClientRect();
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

		let cycleSize;

		if(other.isConnectedWith(this))
			window.stateString.setTempCaption(
				getLocString("node_connection_already_exists"));

		else if(this === other)
			window.stateString.setTempCaption(
				getLocString("node_connection_loop_is_not_allowed"));

		else if(
			(cycleSize = KnotNode._graph.canCauseCycle(
				this._graph_node, other._graph_node
			)) > 0
		)
			window.stateString.setTempCaption(
				getLocNumericalLabel(
					"node_connection_can_cause_cycle", cycleSize)
			);

		else{

			const arrow = Arrow.betweenNodes(this, other);
			arrow.fromNode = this;
			arrow.toNode = other;
			this._graph_node.setLinksFromInstance();
			other._graph_node.setLinksFromInstance();
			return arrow;

		}

	}

}

class KnotNode extends Node {

	static _graph = new Graph();

	_text;
	rectElement;
	textElement;

	static template = document.getElementById("knot_node_template");
	
	// _positiveProbability;
	_probabilities = [];

	_connecting_arrow = undefined;

	_mouseup_listener = () => {};
	_mousemove_listener = () => {};
	_polyline_is_clicked = false;

	_graph_node;

	_is_true = false;
	_is_false = false;

	constructor(x=0, y=0, text, positiveProbability) {

		super(HTMLRepresentative.elementFromTemplate(
			KnotNode.template, "svg", nodesContainer));

		const instance = this;

		this._graph_node = KnotNode._graph.addNode(this);

		this.updateAttributes({
			"x": x,
			"y": y
		});

		this._text = text;

		this.rectElement = this.element.querySelector(".background");
		this.textElement = this.element.querySelector(".caption");
		this.polylineElement = this.element.querySelector("polyline");

		this.captionElement = HTMLRepresentative.elementFromTemplate(
			document.getElementById("knot_node_caption_template"),
			".knot_node_caption", nodeCaptionsContainer);

		this.trueCaptionTextElement = this.captionElement.querySelector(".true_prob");
		this.trueCaptionRectElement = this.captionElement.querySelector(".true_prob_fill");
		this.falseCaptionTextElement = this.captionElement.querySelector(".false_prob");
		this.falseCaptionRectElement = this.captionElement.querySelector(".false_prob_fill");

		this.restoreCaptionStates();

		bindListener(
			this.trueCaptionTextElement, this, "click", this.activateTrue);

		bindListener(
			this.falseCaptionTextElement, this, "click", this.activateFalse);

		bindMultipleListeners(this.polylineElement, this, {
			"mousedown": KnotNode.polylineMousedown,
			"mouseenter": KnotNode.polylineMouseenter,
			"mouseleave": KnotNode.polylineMouseleave
		});

		this.polylineElement.dropSource = this;

		this._mouseup_listener = bindListener(
			document.body, this, "mouseup", KnotNode.polylineMouseup);

		this.caption = text;
		this.updateBounds();

		HTMLRepresentative.updateAttributes(this.captionElement, {
			"x": this.bound.left,
			"y": this.bound.top + this.bound.height + 5
		})

		// this._positiveProbability = positiveProbability;
		this._probabilities = [];

		this.rectElement.contextMenuInvoker = new ContextMenu(this, [
			{
				"name": getLocString("node_delete"),
				"callback": (e) => {
					instance.delete();
				}
			}
		]);

		this.element._substitute_xy = (dx, dy) => {

			this.updateAttributes({
				"x": instance.element.getAttribute("x") - dx,
				"y": instance.element.getAttribute("y") - dy
			});
			instance.updateArrows();
			instance.positionCaptions();

		}

	}

	restoreCaptionStates() {
		this._is_true = this._is_false = false;
		this.trueCaptionRectElement.setAttribute("_state", "");
		this.falseCaptionRectElement.setAttribute("_state", "");
		this.recalculateCaptions();
	}

	recalculateCaptions() {
		this.trueCaptionTextElement.innerHTML =
			`T: ${this.positiveProbability.toFixed(3)}`;
		this.falseCaptionTextElement.innerHTML =
			`F: ${this.negativeProbability.toFixed(3)}`;
		// this.parents.forEach(parent => parent.recalculateCaptions());
	}

	recalculateChildrenCaptions() {
		this.children.forEach(parent => parent.recalculateCaptions());		
	}

	activateTrue() {
		if(!this._is_true){
			this.restoreCaptionStates();
			this._is_true = true;
			this._is_false = false;
			this.trueCaptionRectElement.setAttribute("_state", "pressed");
			this.trueCaptionTextElement.innerHTML = "T: 1.000";
			this.falseCaptionTextElement.innerHTML = "F: 0.000";
			this.recalculateChildrenCaptions();
		} else{
			this.restoreCaptionStates();
			this.recalculateChildrenCaptions();
		}
		// this.recalculateCaptions();
	}

	activateFalse() {
		if(!this._is_false){
			this.restoreCaptionStates();
			this._is_true = false;
			this._is_false = true;
			this.falseCaptionRectElement.setAttribute("_state", "pressed");
			this.trueCaptionTextElement.innerHTML = "T: 0.000";
			this.falseCaptionTextElement.innerHTML = "F: 1.000";
			this.recalculateChildrenCaptions();
		} else{
			this.restoreCaptionStates();
			this.recalculateChildrenCaptions();
		}
		// this.recalculateCaptions();
	}

	positionCaptions() {
		HTMLRepresentative.updateAttributes(this.captionElement, {
			"x": this.bound.left,
			"y": this.bound.top + this.bound.height + 5
		})
	}

	get serializedObject() {
		return {
			"с": this.caption,
			"x": this.element.getAttribute("x"),
			"y": this.element.getAttribute("y"),
			"p": this.probabilities
		};
	}

	static fromSerialized(uuid, dump){
		const instance = new KnotNode(
			dump["x"],
			dump["y"],
			dump["с"] // Caption
		);
		instance._probabilities = dump["p"]; // Probabilities
		instance.uuid = uuid;
		HTMLRepresentative.registerInstanceByUUID(instance);
		return instance;
	}

	delete() {
		KnotNode._graph.deleteNode(this);
		this.rectElement.contextMenuInvoker.delete();
		super.delete();
		Serializator.unregisterSerializable(this);
		this.incomeArrows.forEach(arrow => arrow.delete());
		this.outcomeArrows.forEach(arrow => arrow.delete());
	}

	updateBounds(){
		this._boundingRect = this.rectElement.getBoundingClientRect();
	}

	static polylineMouseenter(e) {
		window.stateString.caption = getLocString("node_hold_and_drag");
	}

	static polylineMouseleave(e) {
		Node.setDefaultStateString();
	}

	static polylineMousedown(e) {
		// e.preventDefault();
		this._polyline_is_clicked = true;
		this.polylineElement.setAttribute("_state", "dragging");
		this.element.draggingIsForbidden = true;
		this._connecting_arrow = new Arrow(0, 0, 0, 0);
		this._connecting_arrow.connectNodeToPoint(this, [e.clientX, e.clientY]);
		this._mousemove_listener = bindListener(
			document.body, this, "mousemove", KnotNode.polylineMousemove);
		e.stopPropagation();
	}

	static polylineMouseup(e) {

		window.stateString.unlock();
		Node.setDefaultStateString();

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
			elementUnderMouse.tagName != "polyline" ||
			!elementUnderMouse.dropSource
		){
			return;
		}

		this.connectTo(elementUnderMouse.dropSource);

	}

	static polylineMousemove(e) {
		this._connecting_arrow.connectNodeToPoint(this, [e.clientX, e.clientY]);
		window.stateString.caption = getLocString("node_keep_dragging");
		window.stateString.lock();
	}

	get hasParents() {
		return this.incomeArrows.length > 0;
	}

	get parents() {
		return this.incomeArrows.map(arrow => arrow.fromNode);
	}

	get children() {
		return this.outcomeArrows.map(arrow => arrow.toNode);
	}

	isConnectedWith(other) {
		return this.parents.includes(other) || this.children.includes(other);
	}

	ensureProbabilitiesVectorSize() {

		const calculatedSize = Math.pow(2, this.incomeArrows.length);

		// Oversize
		if(this._probabilities.length > calculatedSize)
			this._probabilities.splice(calculatedSize);

		// Size is not big enough
		else if (this._probabilities.length < calculatedSize)
			this._probabilities = [
				...this._probabilities,
				...Array(
					calculatedSize - this._probabilities.length
				).fill(0)
			];

	}

	get probabilities() {
		this.ensureProbabilitiesVectorSize();
		return this._probabilities;
	}

	set positiveProbability(number) {
		checkProbability(number);
		if(!this.hasParents)
			this.probabilities[0] = number;
		else
			throw TypeError("Cannot set probability for node with causes.");
	}

	set negativeProbability(number) {
		checkProbability(number);
		this.positiveProbability = 1 - number;
	}

	get positiveProbability() {
		if(!this.hasParents)
			return this.probabilities[0];
		else
			return this.positiveProbabilityForVector(
				this.parents.map(
					parent => (parent._is_false ^ parent._is_true) ? false : true)
			);
	}

	get negativeProbability() {
		return 1 - this.positiveProbability;
	}

	positiveProbabilityForVector(vector) {
		/*Calculates
		* P(
		* 	this node | cause is bool
		* 	for cause, bool in zip(this node parents, vector)
		* )
		* For example, if parents of this node is A, B and C, then
		* positiveProbabilityForVector([false, false, true]) means
		* P(this node | not A, not B, C)
		*/
		const index = vector.toBinaryNumber(),
		      vectors = this.probabilities;

		if(vectors.length <= index || index < 0)
			throw TypeError("Given vector is not appliable to this node");

		return vectors[index];
	}

	positiveProbabilityForParents(parents, bools, missingAsFalse) {
		/*Calculates
		* P(
		* 	this node | parent is bool
		* 	for parent, bool in zip(parents, bools)
		* )
		* For example, if parents of this node is A, B and C, then
		* positiveProbabilityForParents([A, C, B], [true, false, true]) means
		* P(this node | A, B, not C)
		* If missingAsFalse, then for all X not in parents[] such that X is
		* parent of this node, X = False.
		*/
		if(
			!missingAsFalse && (
				parents.length != this.incomeArrows.length ||
				parents.length != bools.length
			)
		)
			throw TypeError(
				"Parents and bools vectors should be length of parents of " +
				"this node."
			)

		const indices = parents.map(parent => this.parents.indexOf(parent));

		if(indices.indexOf(-1) != -1)
			throw TypeError("Some of passed objects is not parent of this node.")

		const vector = Array(this.incomeArrows.length).fill(false);
		for(const [index, bool] of zip(indices, bools))
			vector[index] = bool;

		return this.positiveProbabilityForVector(vector);

	}

	positiveConditionalProbability(causes, bools) {
		/*Calculates
		* P(
		*	this node | cause is bool
		*	for cause, bool in zip(causes, bools)
		* )
		* For example, conditionalProbability([a1, a2], [true, false]) means
		* P(this node | a1, not a2)
		*/
		// TODO: check for nodes with no causes
		const nodeCauses = this.parents;
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

		const input = this._window.element.querySelector(".name_input")

		input.value = this._node.caption;
		input.addEnterEvent(this.saveAndClose.bind(this));
		input.focus();

        this._window.element.querySelector("table")
            .replaceWith(this.generateTable().element);

		this._window.element.querySelector(".save_button").addEventListener(
			"click", this.saveAndClose.bind(this));
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
                this._node.parents
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
                this._node.probabilities
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

				instance._node.probabilities[bools] = newProbab;
				negativeInput.value = (1 - newProbab).toFixed(3);
				// instance._node.restoreCaptionStates();
				instance._node.recalculateCaptions();
				instance._node.recalculateChildrenCaptions();

			}

			negativeInput.onchange = (e) => {

				const newProbab = negativeInput.value * 1;

				if(newProbab < 0 || newProbab > 1)
				    markError();
				else
				    hideError();

				instance._node.probabilities[bools] = 1 - newProbab;

				positiveInput.value = (1 - newProbab).toFixed(3);
				// instance._node.restoreCaptionStates();
				instance._node.recalculateCaptions();
				instance._node.recalculateChildrenCaptions();

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

Serializator.classNames["KnotNode"] = KnotNode;
Serializator.classNames["Arrow"] = Arrow;
