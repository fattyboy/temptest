
var DijkstraSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
	};

(function(scope,undefined){

	var PT = {
		constructor : DijkstraSearch,

		getHeuristicCost : function(node, endNode){
			return 1 ;
		}

	};


	for (var key in AStarSearch.prototype){
		DijkstraSearch.prototype[key]=AStarSearch.prototype[key];
	}
	for (var key in PT){
		DijkstraSearch.prototype[key]=PT[key];
	}

}(this));


