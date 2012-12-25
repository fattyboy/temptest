
var DijkstraStepSearch = function(cfg) {
		for(var key in cfg) {
			this[key] = cfg[key];
		}
		this.queue=[];

	};

(function(scope,undefined){

	var PT = {
		constructor : DijkstraStepSearch,

		getHeuristicCost : function(node, endNode){
			return 1 ;
		}

	};


	for (var key in AStarStepSearch.prototype){
		DijkstraStepSearch.prototype[key]=AStarStepSearch.prototype[key];
	}
	for (var key in PT){
		DijkstraStepSearch.prototype[key]=PT[key];
	}

}(this));


