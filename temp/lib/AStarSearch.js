
var AStarSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
	};

(function(scope,undefined){

	var PT = {

		constructor : AStarSearch,

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


		getHeuristicCost : function(node, endNode){
			return this.getStepCost(node, endNode) ;
		},

		getStepCost: function(fromNode, toNode) {
			var dx=toNode.col-fromNode.col;
			var dy=toNode.row-fromNode.row;
			var toCost=toNode.cost;
			if (dx&&dy){
				return 1.4*toCost;
			}
			return toCost;
		},

		bubbleUp : function(list,node){
			list.bubbleUp(node);
		},

		popBest : function(list){
			return list.pop();
		},
		
		popBestFromArray : function(list){
			var min = Infinity, last=list.length-1;
			var idx = 0;
			for (var i = last ; i >0; i--) {
				var current = list[i];
				var currentCost = current.f;
				if (currentCost < min) {
					idx = i;
					min = currentCost;
				}
			}
			var c=list[idx];
			list[idx]=list[last];
			list.length=last;
			return c;
		}

	};


	for (var key in BFSearch.prototype){
		AStarSearch.prototype[key]=BFSearch.prototype[key];
	}
	for (var key in PT){
		AStarSearch.prototype[key]=PT[key];
	}

}(this));


