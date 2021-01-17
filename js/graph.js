class GraphNode {

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

class NodeContainer extends GraphNode {

	nodeInstance;

	constructor(nodeInstance) {
		super();
		this.nodeInstance = nodeInstance;
	}

	setLinksFromInstance() {
		const mapping = instance => instance._graph_node;		
		this.incomes = this.nodeInstance.parents.map(mapping);
		this.outcomes = this.nodeInstance.children.map(mapping);
	}

	newContainer() {
		return new NodeContainer(this.nodeInstance);
	}

}

class Graph {

	nodes = [];

	addNode(node, linksFromInstance=true) {

		// Create new container of passed node
		const container = node instanceof NodeContainer
			? node.newContainer()
			: new NodeContainer(node);

		this.nodes.push(container);
		if(linksFromInstance) container.setLinksFromInstance();

		return container;

	}

	addNodes(nodes) {
		const instance = this;
		return nodes.map(node => instance.addNode(node));
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
		this.nodes.forEach(container => container.setLinksFromInstance());
	}

	/*Returns NodeContainer of the given KnotNode, or create a new one. */
	ensureNodeInGraph(node) {
		if(node instanceof KnotNode)
			return this.addNode(node)
		else
			return this.containerOf(node) || this.addNode(node);
	}

	/*Check if new link between given nodes can cause cycle in the graph.
	* Returns size of the cycle. */
	canCauseCycle(from, to) {
		
		return this.bfsSearch(to, from).length;

	}

	bfsSearch(source, goal) {

		const visited = [source],
		      queue = [],
		      traversal = new Tree();

		// Here queue will contain arrays in form
		// [node, the same node in traversal tree].

		const addToQueue = (node) => {
			let nodeInTree = traversal.addNode(node, false);
			queue.push([node, nodeInTree]);
			return nodeInTree;
		}

		addToQueue(source);

		let counter = MAXIMUM_BFS_ITERATIONS;
		while(queue.length != 0){

			if(--counter < 0)
				throw PerformanceError("MAXIMUM_BFS_ITERATIONS was reached");


			const [visiting, visitingInTraversal] = queue.shift();

			if(visiting.nodeInstance === goal.nodeInstance)
				return traversal.backtraceFrom(visitingInTraversal).reverse();

			for(const adjacent of visiting.outcomes){

				if(visited.includes(adjacent)) continue;

				visited.push(adjacent);
				const adjacentInTraversal = addToQueue(adjacent);

				visitingInTraversal.linkTo(adjacentInTraversal);

			}

		}

		return false;

	}

}

class Tree extends Graph {

	root;

	backtraceFrom(source) {

		let route = [],
		    node = source;

		let counter = MAXIMUM_TREE_BACKTRACE_ITERATIONS;
		while(node != this.root){

			if(--counter < 0)
				throw PerformanceError(
					"MAXIMUM_TREE_BACKTRACE_ITERATIONS was reached");

			route.push(node);
			node = node.incomes[0];

		}

		return route;
	}

}
