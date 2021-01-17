class Graph {

	nodes = [];

	cosntructor(nodes) {
		this.nodes = (nodes || []);
	}

	addNode(node) {
		this.nodes.push(node);
	}

	deleteNode(node) {
		this.nodes.delete(node);
	}

}
