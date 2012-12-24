
var BFSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
	};

(function(scope,undefined){

    var PT = {

        constructor : BFSearch ,

        blockCost : 9E9 ,

        init : function(){

        },

        search : function(startNode, endNode, options) {

            this.finding=true;
            options=options||{};
            var path=[];
            this.startNode = startNode;
            this.endNode = endNode;
            this.grid = options.grid||this.grid;

            var openList = options.openList||[] ;

            var openedKeys = this.openedKeys={};
            var closedKeys = this.closedKeys={};
            
            delete startNode.parent;
            openList.push(startNode);
            openedKeys[startNode.id]=true;

            while (openList.length>0) {
                var node = openList.shift();

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
                	if (closedKeys[id] || openedKeys[id]) {
                        continue;
                    }
                    openList.push(successor);
                    openedKeys[id] = true;
                    successor.parent = node;
                }
            }
            this.finding=false;
            return path;
        },


        findSuccessors : function(node){
      
            return this.findNeighbors(node);
        },

        findNeighbors : function(node){
            var neighbors=[];
            node["10"]&&neighbors.push(node["10"]);
            node["-10"]&&neighbors.push(node["-10"]);
            node["01"]&&neighbors.push(node["01"]);
            node["0-1"]&&neighbors.push(node["0-1"]);

            node["11"]&&neighbors.push(node["11"]);
            node["-11"]&&neighbors.push(node["-11"]);
            node["1-1"]&&neighbors.push(node["1-1"]);
            node["-1-1"]&&neighbors.push(node["-1-1"]);

            return neighbors;

        },

    	
        getNodeAt : function(col, row){
            return this.grid[row]?this.grid[row][col]:null;
        },
        isWalkableAt : function(col,row){
            return this.isWalkable( this.getNodeAt(col,row) );
        },
        isWalkable : function(node){
            return node && node.cost<this.blockCost;
        },

        isSolution: function(node, endNode) {
            return node.col === endNode.col && node.row === endNode.row ;
        }


    };

    for (var key in PT){
        BFSearch.prototype[key]=PT[key];
    }

}(this));

