
var AStarStepSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
		this.queue=[];
	};

(function(scope,undefined){

	var PT = {
		constructor : AStarStepSearch,

		queue : null,

		search : function(startNode, endNode, options) {

			this.queue.push([startNode, endNode, options]);

		},

		startSearch : function(startNode, endNode, options){

			options=options||{};			
		    this.startNode = startNode;
		    this.endNode = endNode;

			this.finding=true;

		    this.perstep=options.perstep||150;
		    this.callback=options.callback||function(path){ };
		    this.grid = options.grid||this.grid;

		    var path=this.path=[];
		    var openList = this.openList = options.openList||new BinaryHeap(function(node){
		                                    return node.f;
		                                }) ;
		    var openedKeys = this.openedKeys={};
		    var closedKeys = this.closedKeys={};
		    
		    delete startNode.parent;
		    startNode.g = 0;
		    startNode.f = startNode.h = this.getHeuristicCost(startNode,endNode);
		    
		    openList.push(startNode);
		    openedKeys[startNode.id]=true;

		},

		update : function(){
			if (!this.finding && this.queue.length>0){
				var args=this.queue.pop();
				this.startSearch(args[0],args[1],args[2]);
			}

			if (!this.finding){
				return;
			}
			console.time("update finder");
		    var startNode=this.startNode;
		    var endNode=this.endNode;
			var openList=this.openList;
		   	var openedKeys = this.openedKeys;
		    var closedKeys = this.closedKeys;
		    var path=this.path;

			var count=this.perstep;
			while( (count--) >0){
				if (openList.length===0){
					this.finding=false;
					break;
				}
				var node = this.pickFromOpenList(openList);
		        if (this.isSolution(node, endNode)) {
		        	path.length=0;
		        	do{
		        		path.unshift(node);
		        	}while((node=node.parent));
		        	this.finding=false;

		        	break;
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

			console.timeEnd("update finder");
			if (!this.finding){
				this.callback(this.path);
			}

		}

	};


	for (var key in AStarSearch.prototype){
		AStarStepSearch.prototype[key]=AStarSearch.prototype[key];
	}
	for (var key in PT){
		AStarStepSearch.prototype[key]=PT[key];
	}

}(this));


