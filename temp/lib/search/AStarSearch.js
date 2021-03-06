
var AStarSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
	};

(function(scope,undefined){

	var PT = {

		constructor : AStarSearch,

		search : function(startNode, endNode, options) {

		    options=options||{};
		    this.startNode = startNode;
		    this.endNode = endNode;

		    this.finding=true;

		    this.callback=options.callback;
		    this.grid = options.grid||this.grid;
		    var path=this.path=[];
		    var openList = this.openLost=options.openList||new BinaryHeap(function(node){
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
		        var node = this.pickFromOpenList(openList);
		        if (this.isSolution(node, endNode)) {
		        	path.length=0;
		        	do{
		        		path.unshift(node);
		        	}while((node=node.parent));
		        	this.finding=false;
		        	if (this.callback){
		        		this.callback(path);
		        	}
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
		                	this.addToOpenList(openList,successor);
		                    openedKeys[id] = true;
		                } else {
							this.resortOpenList(openList,successor);
		                }
		            }	    
		        }
		    }
		    this.finding=false;
		    if (this.callback){
        		this.callback(path);
        	}
		    return path;
		},


		getHeuristicCost : function(node, endNode){
			var dx=endNode.col-node.col,
				dy=endNode.row-node.row;
			return Math.sqrt(dx*dx+dy*dy) ;
		},

		getStepCost: function(fromNode, toNode) {
			var toCost=toNode.cost;
			if (toNode.col==fromNode.col||toNode.row==fromNode.row){
				return toCost;
			}
			return 1.4*toCost;
		},

		addToOpenList : function(list,node){
			list.push(node);
		},	

		resortOpenList : function(list,node){
			list.resortElement(node);
		},

		pickFromOpenList : function(list){
			return list.pop();
		},
	
		pickFromArray : function(list){
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


