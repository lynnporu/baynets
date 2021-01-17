class Node {

	visited = false;

	incomes = [];
	outcomes = [];

	linkTo(node) {
		this.outcomes.push(node);
		node.incomes.push(this);
	}

	unlinkFrom(node) {
		this.outcomes.delete(node);
		node.incomes.delete(this);
	}

}

class NodeContainer extends Node {

	nodeInstance;

	constructor(nodeInstance) {
		super();
		this.nodeInstance = nodeInstance;
	}

	updateState() {
		this.visited = false;
		this.incomes = this.nodeInstance.incomeArrows;
		this.outcomes = this.nodeInstance.outcomeArrows;
	}

}

class Graph {

	nodes = [];

	cosntructor() {
	}

	addNode(node) {
		this.nodes.push(new NodeContainer(node));
	}

	addNodes(nodes) {
		nodes.forEach(this.addNode);
	}

	deleteNode(node) {
		this.nodes = this.nodes.filter(
			container => container.nodeInstance !== node
		);
	}

	containerOf(node) {
		return this.nodes.filter(
			container => container.nodeInstance === node
		)[0];
	}

	updateContainerStates() {
		this.nodes.forEach(container => container.updateState());
	}

	}

}
