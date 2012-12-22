var Heap = function(cfg) {

		for (var key in cfg) {
			this[key] = cfg[key];
		}

	};

Heap.prototype = {

	constructor: Heap,
	root : null,
	push : function(data){
		var node={
			data : data,
			left : null,
			right : null,
			parent : null
		}
		if (!this.root){
			this.root=node;
			return node;
		}

	},
	defaultCmp : function(node1,node2){
		return node1.data.f - node2.data.f;
	},
	
	pick : function(){

	}
}