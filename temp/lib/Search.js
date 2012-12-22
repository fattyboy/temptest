var BFSearch = function(cfg) {

		for (var key in cfg) {
			this[key] = cfg[key];
		}

	};

BFSearch.prototype = {

	constructor: BFSearch,


	init: function() {

	},
	reset: function(startNode,endNode) {

	},
	isSolution: function(node, endNode) {
		return false;
	},

	findSuccessors: function(node, openList, closedKeys, successors) {
		return [];
	},

	beforeSearch: function(startNode, endNode) {

	},
	search: function(startNode, endNode) {

		this.reset(startNode, endNode);

		this.beforeSearch(startNode, endNode);

		if (this.isSolution(startNode, endNode)) {
			return [startNode, endNode];
		}
		var openList = [];
		var closedKeys = {};

		var prevNodes = {};
	
		openList.push(startNode);

		var successors=[];
		while (openList.length) {
			var node = openList.shift();
			closedKeys[node.id] = node;

			successors = this.findSuccessors(node, openList, closedKeys,successors);

			for (var i = 0, len = successors.length; i < len; i++) {
				var successor = successors[i];
				if (!closedKeys[successor.id]) {
					closedKeys[successor.id] = successor;

					prevNodes[successor.id] = node;

					if (this.isSolution(successor, endNode)) {
						node = successor;
						var nodeList = [node];
						while ((node = prevNodes[node.id])) {
							nodeList.push(node);
						}
						return nodeList;
					}
					openList.push(successor);
				}
			}
			successors.length=0;
		}
		return false;

	}

};


var AStarSearch = function(cfg) {

		for (var key in cfg) {
			this[key] = cfg[key];
		}

	};

AStarSearch.prototype = {
	constructor: AStarSearch,


	init: function() {

	},
	reset: function() {

	},
	isSolution: function(node, endNode) {
		return false;
	},

	findSuccessors: function(node, openList, closedKeys,successors) {
		return [];
	},

	beforeSearch: function(startNode, endNode) {

	},

	insertToOpenList: function(node, openList, cost) {
		return openList.push(node);
	},

	//    diagonal : function (fromNode, toNode) {
	//        return Math.max(Math.abs(fromNode.col - toNode.col), Math.abs(fromNode.row - toNode.row));
	//    },
	//    euclidean : function(fromNode, toNode) {
	//        return Math.sqrt(Math.pow(fromNode.col - toNode.col, 2) + Math.pow(fromNode.row - toNode.row, 2));
	//    },
	//    manhattan : function (fromNode, toNode) {
	//        return Math.abs(fromNode.col - toNode.col) + Math.abs(fromNode.row - toNode.row);
	//    },

    getCostH : function(node,endNode){
        return 1;//this.euclidean(fromNode, toNode);
    },

    getStepCost : function(fromNode, toNode){
    	return 1;//this.euclidean(fromNode, toNode);
    },

	pickFromOpenList: function(openList) {
		return openList.pop();

		var min = Infinity, last=openList.length-1;
		var idx = 0;
		for (var i = last ; i >0; i--) {
			var current = openList[i];
			var currentCost = current.f;
			if (currentCost < min) {
				idx = i;
				min = currentCost;
			}
		}
		var c=openList[idx];
		openList[idx]=openList[last];
		openList.length=last;
		return c;
		// return openList.splice(idx, 1)[0];
	},

search : function(startNode, endNode, options) {

    this.finding=true;
    options=options||{};
    var path=[];
    this.startNode = startNode;
    this.endNode = endNode;
    this.grid = options.grid||this.grid;

    var openList = options.openList||new BinaryHeap(function(node){
                                    return node.f;
                                }) ;

    var openedKeys = this.openedKeys={};
    var closedKeys = this.closedKeys={};
    
    delete startNode.parent;
    startNode.g = 0;
    startNode.f = startNode.h = this.getHeuristicCost(startNode,endNode);
    openList.push(startNode);
    openedKeys[startNode.id]=true;

    // while the open list is not empty
    while (openList.length>0) {
        var node = this.popBest(openList);

        if (this.isSolution(node, endNode)) {
        	path=[node];
        	while( (node=node.parent) ){
        		path.unshift(node);
        	}
        	this.finding=false;
        	return path;
        }

        closedKeys[node.id]=true;

        var successors=this.findSuccessors(node);
        for(var i = 0, l = successors.length; i < l; i++) {
        	var successor = successors[i];
        	var id=successor.id;
        	if (closedKeys[id]) {
                continue;
            }
           	var opened=openedKeys[id];
            var g = node.g+this.getStepCost(node, successor); 
            if (!opened || g < successor.g) {
                successor.g = g;
                successor.h = successor.h || this.getHeuristicCost(successor,endNode);
                successor.f = successor.g + successor.h;
                successor.parent = node;

                if (!opened) {
			// window.successorPoints=window.successorPoints||[];
			// window.successorPoints.push(successor);

                    openList.push(successor);
                    openedKeys[id] = true;
                } else {
					this.bubbleUp(openList,successor);
                }
            }	    
        }
    }
    this.finding=false;
    return path;
},


};




