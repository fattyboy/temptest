
var TiledMapCarmack=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	

}

TiledMapBase.inherit( TiledMapCarmack , 

{

	
	canvasOffsetX : 0,
	canvasOffsetY : 0,

	initCanvas : function(){	

		
		this.initCanvasSize();

		var canvasInfo=this.initCanvasInfo(this.canvas);
		this.canvas=canvasInfo[0];
		this.context2d=canvasInfo[1];

		canvasInfo=this.initCanvasInfo(this.targetCanvas, this.container);
		this.targetCanvas=canvasInfo[0];
		this.targetContext2d=canvasInfo[1];

		
	},
	initCanvasSize : function(){
		this.canvasTileCols=(this.viewTileCols+1)>>1<<1;
		this.canvasTileRows=(this.viewTileRows+1)>>1<<1;
		this.canvasWidth=this.canvasTileCols*this.tileWidth;
		this.canvasHeight=this.canvasTileRows*this.tileHeight;
		
	},

	draw  : function(){
		if (!this.visible){
			return;
		}		

		if (this.scrolled || this.forceScroll){
			
			this.clearAll();
			
			this.updateCanvas();
			this.drawCanvas();
			

			this.scrolled=false;
			this.forceScroll=false;
		}
		
	},



	clearAll : function(){
		this.targetContext2d.clearRect(0,0,this.canvasWidth,this.canvasHeight);
	},


	drawRegion : function(fromCol, fromRow, toCol, toRow){

		var startColInCanvas = fromCol % this.canvasTileCols;
		startColInCanvas=(startColInCanvas + this.canvasTileCols) % this.canvasTileCols;
		
		var startRowInCanvas = fromRow % this.canvasTileRows;
		startRowInCanvas= (startRowInCanvas + this.canvasTileRows)%this.canvasTileRows;
				

		var _startColInCanvas , _startRowInCanvas;

		_startRowInCanvas = startRowInCanvas;
		for (var r=fromRow;r<toRow;r++){
		
			var _r = this.getNewRow(r);	
			if (_r==null){
				continue;
			}
			var rowInfo=this.mapDataInfo[_r];

			_startColInCanvas = startColInCanvas;
			for (var c=fromCol;c<toCol;c++){
			
				var _c = this.getNewCol(c);
				if (_c==null){
					continue;
				}
				var tileInfo = rowInfo[_c];
				this.drawTile( this.context2d, c, r,  _startColInCanvas , _startRowInCanvas, tileInfo );	

				_startColInCanvas= (++_startColInCanvas)%this.canvasTileCols;	
			}

			_startRowInCanvas=(++_startRowInCanvas)%this.canvasTileRows;	
			
		}

	},
	



////////////////////////


	updateCanvasPosInfo : function(){

		this.canvasCol =this.col % this.canvasTileCols;		
		this.canvasCol=(this.canvasCol+this.canvasTileCols)%this.canvasTileCols;
		this.canvasOffsetX = this.tileOffsetX+ ( this.canvasCol * this.tileWidth )  ;
		
		this.canvasRow =this.row % this.canvasTileRows;
		this.canvasRow=(this.canvasRow+this.canvasTileRows)%this.canvasTileRows;
		this.canvasOffsetY = this.tileOffsetY + ( this.canvasRow * this.tileHeight ) ;
		
	},

	updateCanvas : function() {

		var colFrom, colTo;
		var rowFrom, rowTo;

		if (this.col !== this.lastCol) {
			
			if (this.col > this.lastCol) {
				colFrom = this.lastCol + this.viewTileCols;
				colTo = this.col + this.viewTileCols;

				rowFrom=this.row; //this.lastRow;
			} else {
				colFrom = this.col;
				colTo = this.lastCol;

				rowFrom=this.row;
			}
			
			this.drawRegion(colFrom, rowFrom,  colTo, rowFrom + this.viewTileRows);
		}

		if (this.row !== this.lastRow) {
			
			if (this.row > this.lastRow) {
				rowFrom = this.lastRow + this.viewTileRows;
				rowTo = this.row + this.viewTileRows;

				colFrom=this.col; //this.lastCol;
			} else {
				rowFrom = this.row;
				rowTo = this.lastRow;

				colFrom=this.col;
			}

			this.drawRegion(colFrom, rowFrom, colFrom + this.viewTileCols, rowTo);
		}

	},

	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		return {
			x : this.tileWidth  * cINc ,
			y : this.tileHeight * rINc 
		};	
	},

	drawCanvas : function(context , deltaTime) {	
			
		var ox=this.canvasOffsetX;
		var oy=this.canvasOffsetY;
		var x,y;

		for (var r=0;r<2;r++){
			for (var c=0;c<2;c++){
				x= c*this.canvasWidth -ox;
				y= r*this.canvasHeight -oy;
				this.targetContext2d.drawImage(this.canvas, x,y);
			}
		}
	
	}


		
}


);







