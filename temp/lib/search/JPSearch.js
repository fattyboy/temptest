
var JPSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
	};

(function(scope,undefined){

	var PT = {
		constructor : JPSearch,

		findSuccessors : function(node){
			var successors=[];
			var neighbors=this.pruneNeighbors(node);
			for (var i=neighbors.length-1;i>=0;i--){
				var n=neighbors[i];
				var jumpInfo={
					cost : 0
				};
				var jumpPoint=this.findJumpPoint(n, node, jumpInfo);
				if (jumpPoint!=null){
					jumpPoint.jumpCost = jumpInfo.cost;
					successors.push(jumpPoint);
				}
			}
			return successors;
		},


		pruneNeighbors : function(node){
			var parent = node.parent;
			if (parent){
				var neighbors=[];
		        var x = node.col, y = node.row;
		        var px = parent.col, py = parent.row;
				var dx = (x - px) / Math.max(Math.abs(x - px), 1),
		       		dy = (y - py) / Math.max(Math.abs(y - py), 1);
				
				// TODO : 
				 if (dx !== 0 && dy !== 0) {
		            if ( node[0+""+dy]  ) {
		                neighbors.push( node[0+""+dy] );
		            }
		            if ( node[dx+""+0]  ) {
		                neighbors.push( node[dx+""+0] );
		            }
		            if ( node[0+""+dy]  ||  node[dx+""+0]  ) {
		                neighbors.push(node[dx+""+dy]);
		            }
		            // if (!node[-dx+""+0] && node[0+""+dy] ) {
		            //     neighbors.push( node[-dx+""+dy] );
		            // }else 
		            if(node[-dx+""+dy]){
		                neighbors.push( node[-dx+""+dy] );
		            }
		            // if (!node[0+"-"+dy] && node[dx+""+0] ) {
		            //     neighbors.push(node[dx+"-"+dy]);
		            // }else 
		            if(node[dx+"-"+dy]){
		                neighbors.push(node[dx+"-"+dy]);
		            }
				 }else if(dx===0){
		                if (node[0+""+dy] ) {
		                    neighbors.push(node[0+""+dy]);
		                    // if (!node[1+""+0] ) {
		                    //     neighbors.push(node[1+""+dy]);
		                    // }else 
		                    if (node[1+""+dy] ) {
				            	neighbors.push(node[1+""+dy]);
				            }

		                    // if (!node[-1+""+0] ) {
		                    //     neighbors.push(node[-1+""+dy]);
		                    // }else 
		                    if (node[-1+""+dy] ) {
				            	neighbors.push(node[-1+""+dy]);
				            }
		                }else{
		                	//
			            	if (node[1+""+dy] ) {
				            	neighbors.push(node[1+""+dy]);
				            }
				            if (node[-1+""+dy] ) {
				            	neighbors.push(node[-1+""+dy]);
				            }	
			            }


				 }else if(dy===0){


		            if (node[dx+""+0] ) {
		                neighbors.push(node[dx+""+0]);
		                
		                // if (!node[0+""+1] ) {
		                //     neighbors.push(node[dx+""+1]);
		                // }else 
		                if (node[dx+""+1] ) {
			            	neighbors.push(node[dx+""+1]);
			            }
		                // if (!node[0+"-"+1] ) {
		                //     neighbors.push(node[dx+"-"+1]);
		                // }else 
		                if (node[dx+"-"+1] ) {
			            	neighbors.push(node[dx+"-"+1]);
			            }
		            }else{
		            	//
		            	if (node[dx+""+1] ) {
			            	neighbors.push(node[dx+""+1]);
			            }
			            if (node[dx+"-"+1] ) {
			            	neighbors.push(node[dx+"-"+1]);
			            }	
		            }
				 }
				 return neighbors;
			}else{
				return this.findNeighbors(node);
			}

		},

		findJumpPoint : function (node, prevNode,  jumpInfo){

			while(true){

				if (!node ){
					return null;
				}
				
		        var x = node.col, y = node.row;
				var dx=x-prevNode.col,
					dy=y-prevNode.row;
				if (jumpInfo){
					jumpInfo.cost+=node.cost;
				}

				if (this.isSolution(node,this.endNode) ){
					return node;
				}

				// check : does node has forced neighbor ?
				if (dx !== 0 && dy !== 0) {
				 	if ( ( node[-dx+""+dy]  && !node[-dx+""+0]) 
				 		||
			            (node[dx+"-"+dy] && !node[0+"-"+dy]) ) {
			            return node;
					}
				}else if(dx===0){
			            if((node[1+""+dy] && !node[1+""+0])
			             ||
			               (node[-1+""+dy] && !node[-1+""+0]) ) {
			                return node;
			            }

				}else if(dy===0){
			            if((node[dx+""+1] && !node[0+""+1])
			             ||
			               (node[dx+"-"+1] && !node[0+"-"+1]) ) {
			                return node;
			            }
				}

				// diagonal
				if (dx !== 0 && dy !== 0) {
		        	var jpX = this.findJumpPoint(node[dx+""+0], node, null);
			        if (jpX) {
			            return node;
			        }
		        	var jpY = this.findJumpPoint(node[0+""+dy], node, null);
		        	if (jpY) {
			            return node;
			        }
		    	}
		    	prevNode=node;
		    	node=node[dx+""+dy];
	    	}
		}

	};


	for (var key in AStarSearch.prototype){
		JPSearch.prototype[key]=AStarSearch.prototype[key];
	}
	for (var key in PT){
		JPSearch.prototype[key]=PT[key];
	}

}(this));


