
var IsoTiledMapCarmack=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	
};



TiledMapCarmack.inherit( IsoTiledMapCarmack , 

{


	useImgData : false ,

	needClear : true ,

	qgetNewCol : function(c){
		return c<0||c>=this.mapDataCols?null:c;		
	},
	qgetNewRow : function(r){
		return r<0||r>=this.mapDataRows?null:r;		
	},


	initCanvas : function(){	

		this.initCanvasSize();

		var canvasInfo=this.initCanvasInfo(this.canvas);
		this.canvas=canvasInfo[0];
		this.context2d=canvasInfo[1];

		canvasInfo=this.initCanvasInfo(this.targetCanvas, this.container);
		this.targetCanvas=canvasInfo[0];
		this.targetContext2d=canvasInfo[1];

		this.canvas.style.margin="50px 260px";
		this.canvas.style.border="2px solid red";

		//document.body.appendChild(this.canvas);
		//this.targetCanvas.style.display="none";
		
	},

	initCanvasSize : function(){
		this.canvasTileCols= this.viewTileCols;
		this.canvasTileRows= this.viewTileRows;
		this.canvasWidth=this.canvasTileCols*this.tileWidth+this.halfTileWidth;
		this.canvasHeight=this.canvasTileRows*this.halfTileHeight+this.halfTileHeight;;
		
		this.originX+=-this.halfTileWidth;
		this.originY+=-this.halfTileHeight;
	},


	updateCanvas : function() {


		var colFrom, colTo;
		var rowFrom, rowTo;

		if (this.viewCol !== this.lastViewCol) {
			if (this.viewCol > this.lastViewCol) {
				colFrom = this.lastViewCol + this.viewTileCols;
				colTo = this.viewCol + this.viewTileCols;

			} else {
				colFrom = this.viewCol;
				colTo = this.lastViewCol;

			}
			
			this.drawRegion( colFrom, this.viewRow ,  colTo, this.viewRow + this.viewTileRows );
			
		}

		
		if (this.viewRow !== this.lastViewRow) {
			
			if (this.viewRow > this.lastViewRow) {
				rowFrom = this.lastViewRow + this.viewTileRows;
				rowTo = this.viewRow + this.viewTileRows;

			} else {
				rowFrom = this.viewRow;
				rowTo = this.lastViewRow;

			}
			this.drawRegion( this.viewCol, rowFrom, this.viewCol + this.viewTileCols, rowTo );
			
		}
	
	},


	updateTilePosInfo : function(){
		
		var x=this.intX +this.originX;
		var y=this.intY +this.originY;
		//var pos=this.mapPx2mapTile(x, y);
		//this.col = pos.col;
		//this.row = pos.row;

		//this.viewRow=this.col+this.row;
		//this.viewCol=Math.floor( (this.col-this.row)/2 );
		
		this.viewRow= Math.floor( y /this.halfTileHeight);
		this.viewCol= Math.floor( x / this.tileWidth );
	

		this.tileOffsetX= x-( this.viewCol * this.tileWidth);
		this.tileOffsetY= y-( this.viewRow * this.halfTileHeight);

		//var even=this.viewRow % 2==0;
		//this.tileOffsetX-=(!even?this.halfTileWidth:0);

	},

	updateCanvasPosInfo : function(){

		this.canvasCol = this.viewCol % this.canvasTileCols;		
		this.canvasCol =(this.canvasCol+this.canvasTileCols)%this.canvasTileCols;
		this.canvasOffsetX =  this.tileOffsetX + ( this.canvasCol * this.tileWidth ) + this.tileWidth ;		

		this.canvasRow = this.viewRow % this.canvasTileRows;
		this.canvasRow =(this.canvasRow+this.canvasTileRows)%this.canvasTileRows;
		this.canvasOffsetY = this.tileOffsetY + ( this.canvasRow * this.halfTileHeight )  + this.halfTileHeight;
		
		//var even=this.viewRow % 2==0;
		//this.canvasOffsetX += (even?0:this.halfTileWidth);

	},

	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		
		var x=cINc*this.tileWidth +(rINc%2!=0?(this.halfTileWidth):0);
		var y=rINc*this.halfTileHeight;

		return {
			x : x ,//- this.halfTileWidth,
			y : y //- this.halfTileHeight
		};	
	},


	drawRegion : function(fromCol, fromRow, toCol, toRow){


		var even=fromRow%2==0;
		var dataCol = Math.ceil( (fromCol*2+fromRow)/2 );
		var dataRow = fromRow-dataCol;

		var tileCount=0;
	

		var startRowInCanvas = fromRow % this.canvasTileRows;
		startRowInCanvas= (startRowInCanvas + this.canvasTileRows)%this.canvasTileRows;

		var startColInCanvas = fromCol % this.canvasTileCols;
		startColInCanvas=(startColInCanvas + this.canvasTileCols) % this.canvasTileCols;

		var _startColInCanvas , _startRowInCanvas;
		
		_startRowInCanvas = startRowInCanvas;
		for (var r=fromRow;r<toRow;r++){

			var col=dataCol , row=dataRow;

			_startColInCanvas = startColInCanvas;
			for (var c=fromCol;c<toCol;c++){
				
				var tileInfo=null;
				var _row=this.getNewRow(row);
				if (_row!=null){
					var _col=this.getNewCol(col);
					if (_col!=null){
						tileInfo=this.mapDataInfo[_row][_col];
					}	
				}
				tileCount++;
				var pos=this.drawTile( this.context2d, col, row, _startColInCanvas , _startRowInCanvas, tileInfo );	
				//this.context2d.strokeText( col+","+row,	pos.x+this.tileWidth/4, pos.y+this.tileHeight/4 );
				//this.context2d.strokeText( Math.floor((col-row)/2)+","+(col+row),	pos.x+this.tileWidth/4, pos.y+this.tileHeight/4 );

				_startColInCanvas= (++_startColInCanvas)%this.canvasTileCols;	

				col++;
				row--;
			}

			if (even){
				dataCol++;
			}else{
				dataRow++;
			}
			even=!even;
		

			_startRowInCanvas=(++_startRowInCanvas)%this.canvasTileRows;

		}
		//console.log("tileCount "+tileCount);

	},


	drawCanvas : function(context , deltaTime) {

			var ox=this.canvasOffsetX;
			var oy=this.canvasOffsetY;
			var x,y;
			
			for (var r=0;r<2;r++){
				for (var c=0;c<2;c++){
					x= c*(this.canvasWidth-this.halfTileWidth) -ox;
					y= r*(this.canvasHeight-this.halfTileHeight) -oy;
					//this.context2d.strokeRect(0,0,this.canvas.width, this.canvas.height);
					this.targetContext2d.drawImage(this.canvas, x,y);
					//console.log(x,y)
					//break;
				}
			}

	}

}


);


IsoTiledMapCarmack.overwritten({

	initMapSize : IsoTiledMapBase.prototype.initMapSize,

	getMapPos : IsoTiledMapBase.prototype.getMapPos,

	setMapPos : IsoTiledMapBase.prototype.setMapPos,

	mapTile2mapPx : IsoTiledMapBase.prototype.mapTile2mapPx,

	mapPx2mapTile : IsoTiledMapBase.prototype.mapPx2mapTile


});
