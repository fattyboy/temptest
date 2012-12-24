
function MapGrid(cfg) {
    merger(this, cfg);
}


MapGrid.prototype = {

    constructor: MapGrid,

	nodes: null,

	blockCost : 9E9 ,
	
	cost : {
		0 : 1,
		1 : 9E9		
	},
	tileWidth : 0,
	tileHeight : 0,

	init: function(rawNodes) {
		this.halfTileWidth=this.tileWidth>>1;
		this.halfTileHeight=this.tileHeight>>1;

		this.nodes = [];
		var rows = this.rows = rawNodes.length;
		var cols = this.cols = rawNodes[0].length;
		var id = 1;
		for(var r = 0; r < rows; r++) {
			var row = rawNodes[r];
			var nodes = [];
			this.nodes.push(nodes);
			for(var c = 0; c < cols; c++) {
				var no = row[c];
				var node = this.createNode(c, r, no, id++);
				nodes.push(node);
			}
		}

		var nn;
		for(var r = 0; r < rows; r++) {
			var rowNodes = this.nodes[r];
			for(var c = 0; c < cols; c++) {
				var node=rowNodes[c];
				if (node["0-1"]){
					this.setNeighbor(node,"0-1",c,r-1);	
					if (node["-10"]){
						this.setNeighbor(node,"-1-1",c-1,r-1);	
					}
					if (node["10"]){
						this.setNeighbor(node,"1-1",c+1,r-1);	
					}
				}
				if (node["01"]){
					this.setNeighbor(node,"01",c,r+1);	
					if (node["-10"]){
						this.setNeighbor(node,"-11",c-1,r+1);	
					}
					if (node["10"]){
						this.setNeighbor(node,"11",c+1,r+1);	
					}
				}
				if (node["-10"]){
					this.setNeighbor(node,"-10",c-1,r);	
				}
				if (node["10"]){
					this.setNeighbor(node,"10",c+1,r);	
				}
			}
		}

	},

	isWalkable : function(node){
		return node.cost<this.blockCost;
	},

	setNeighbor : function(node,dir,nCol,nRow){
		var nn=this.nodes[nRow][nCol];
		if (this.isWalkable(nn)){
			node[dir]=nn;
		}else{
			node[dir]=false;
		}
	},

    createNode: function(col, row, no, id) {
		var node = {
			id: id,
			col: col,
			row: row,
			no: no,
			x : col*this.tileWidth+this.halfTileWidth,
			y : row*this.tileHeight+this.halfTileHeight,
			"0-1": row > 0,
			"01": row < this.rows - 1,
			"-10": col > 0,
			"10": col < this.cols - 1,
			cost : this.cost[no]||1
		};
		return node;
	}

}
