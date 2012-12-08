
var TiledMapMulti=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	

}

TiledMapCarmack.inherit( TiledMapMulti , 

{


	canvasMatrix : null,
	context2dMatrix : null,

	canvasCols : 2 ,
	canvasRows : 2 ,

	canvasOffsetX : 0,
	canvasOffsetY : 0,


	initCanvas : function(){	

		this.initCanvasSize();

		this.canvasMatrix=this.canvasMatrix||[];
		this.context2dMatrix=this.context2dMatrix||[];

		for (var r=0;r<this.canvasRows;r++){
			var cvR=this.canvasMatrix[r]=[];
			var ctxR=this.context2dMatrix[r]=[];
			for (var c=0;c<this.canvasCols;c++){
				var canvasInfo=this.initCanvasInfo( cvR[c] ,this.container );
				cvR[c]=canvasInfo[0];
				ctxR[c]=canvasInfo[1];
			}
		}

		this.canvasCount = this.canvasCols * this.canvasRows ;

	},

	initCanvasSize : function(){
		
		if (this.canvasWidth){
			this.canvasCols=this.canvasCols|| Math.ceil(this.viewWidth/this.canvasWidth);
		}
		if (this.canvasHeight){
			this.canvasRows=this.canvasRows|| Math.ceil(this.viewHeight/this.canvasHeight);
		}
			
		if (this.canvasCols){
			if (this.canvasCols==1){
				this.canvasTileCols=this.mapCols ;
			}else{
				this.canvasTileCols=Math.ceil( this.viewTileCols/(this.canvasCols-1) );
			}
		}else{
			this.canvasTileCols=this.canvasTileCols|| (this.viewTileCols+1)>>1<<1;
		}

		if (this.canvasRows){
			if (this.canvasRows==1){
				this.canvasTileRows=this.mapRows ;
			}else{
				this.canvasTileRows=Math.ceil( this.viewTileRows/(this.canvasRows-1) );
			}
		}else{
			this.canvasTileRows=this.canvasTileRows|| (this.viewTileRows+1)>>1<<1;
		}


		if (this.canvasTileCols>=this.mapCols){
			this.canvasTileCols=this.mapCols;
			this.canvasCols=1;
		}
		if (this.canvasTileRows>=this.mapRows){
			this.canvasTileRows=this.mapRows;
			this.canvasRows=1;
		}
				
		this.canvasCols=this.canvasCols||Math.ceil( this.viewTileCols/this.canvasTileCols )+1;
		this.canvasRows=this.canvasRows||Math.ceil( this.viewTileRows/this.canvasTileRows )+1;

		this.canvasWidth=this.canvasWidth||this.canvasTileCols*this.tileWidth;
		this.canvasHeight=this.canvasHeight||this.canvasTileRows*this.tileHeight;
		
	},
	
	update : function(deltaTime){
		if (this.beforeUpdate!=null){
			this.beforeUpdate(deltaTime);
		}

		if (this.onUpdate!=null){
			this.onUpdate(deltaTime);
		}

	},

	draw  : function(){
		if (!this.visible){
			return;
		}		


		if (this.scrolled || this.forceScroll){
			if (this.needClear){
				this.clearAll();
			}

			this.updateCanvas();
			this.drawCanvas();

			this.scrolled=false;
			this.forceScroll=false;
		}
		
	},



	clearAll : function(){
		for (var r=0;r<this.canvasRows;r++){
			for (var c=0;c<this.canvasCols;c++){
				this.context2dMatrix[r][c].clearRect(0,0,this.canvasWidth,this.canvasHeight);
			}
		}
	},


	drawRegion : function(fromCol, fromRow, toCol, toRow){

		
		var startColInCanvas = fromCol % this.canvasTileCols;
		startColInCanvas=(startColInCanvas + this.canvasTileCols) % this.canvasTileCols;

		var startRowInCanvas = fromRow % this.canvasTileRows;
		startRowInCanvas= (startRowInCanvas + this.canvasTileRows)%this.canvasTileRows;


		var idxCanvasCol=0 , idxCanvasRow=0;
		
		if (this.canvasCols>1){	
			idxCanvasCol= Math.floor( fromCol / this.canvasTileCols) % this.canvasCols;
			idxCanvasCol=(idxCanvasCol + this.canvasCols)%this.canvasCols;
		}
		if (this.canvasRows>1){		
			idxCanvasRow= Math.floor( fromRow / this.canvasTileRows) % this.canvasRows;
			idxCanvasRow= (idxCanvasRow + this.canvasRows) % this.canvasRows;
		}

		var _startColInCanvas , _startRowInCanvas;
		var _idxCanvasCol , _idxCanvasRow;

		_startRowInCanvas = startRowInCanvas;
		_idxCanvasRow = idxCanvasRow;					
		for (var r=fromRow;r<toRow;r++){
			
			var _r = this.getNewRow(r);	
			if (_r==null){
				continue;
			}
			var rowInfo=this.mapDataInfo[_r];

			_startColInCanvas = startColInCanvas;
			_idxCanvasCol = idxCanvasCol;			
			for (var c=fromCol;c<toCol;c++){
			
				var _c = this.getNewCol(c);
				if (_c==null){
					continue;
				}
				var tileInfo = rowInfo[_c];

				var context2d=this.context2dMatrix[_idxCanvasRow][_idxCanvasCol];
				this.drawTile(context2d, c, r, _startColInCanvas , _startRowInCanvas, tileInfo );	
				
				_startColInCanvas++;
				if (_startColInCanvas==this.canvasTileCols){
					_startColInCanvas=0;
					_idxCanvasCol= (++_idxCanvasCol)%this.canvasCols;	
				}
			}

			_startRowInCanvas++;
			if (_startRowInCanvas==this.canvasTileRows){
				_startRowInCanvas=0;
				_idxCanvasRow=(++_idxCanvasRow)%this.canvasRows;	
			}
		}

	},
	



////////////////////////


	updateCanvasPosInfo : function(){

		this.canvasCol=0;
		this.canvasRow=0;
		this.canvasOffsetX =  this.x;
		this.canvasOffsetY =  this.y;

		if (this.canvasCols>1){
			this.canvasCol =this.col % this.canvasTileCols;		
			this.canvasCol=(this.canvasCol+this.canvasTileCols)%this.canvasTileCols;
			this.canvasOffsetX =this.tileOffsetX+ ( this.canvasCol * this.tileWidth)  ;
		
		}
		if (this.canvasRows>1){
			this.canvasRow =this.row % this.canvasTileRows;
			this.canvasRow=(this.canvasRow+this.canvasTileRows)%this.canvasTileRows;
			this.canvasOffsetY =this.tileOffsetY+ ( this.canvasRow * this.tileHeight) ;
		}
		
	},


	drawCanvas : function(context , deltaTime) {	
			
		var ox=this.canvasOffsetX;
		var oy=this.canvasOffsetY;

		var idxCanvasCol=0;
		var idxCanvasRow=0;
		

		if (this.canvasCols>1){
			idxCanvasCol= Math.floor( this.col / this.canvasTileCols);
			idxCanvasCol= (idxCanvasCol+this.canvasCols) % this.canvasCols;
		}
					
		if (this.canvasRows>1){
			idxCanvasRow= Math.floor( this.row / this.canvasTileRows);
			idxCanvasRow= (idxCanvasRow+this.canvasRows) % this.canvasRows;
		}

		var _idxCanvasCol, _idxCanvasRow;
		_idxCanvasRow=idxCanvasRow;
		for (var r=0;r<this.canvasRows;r++){

			_idxCanvasCol=idxCanvasCol;
			for (var c=0;c<this.canvasCols;c++){
				var cv=this.canvasMatrix[_idxCanvasRow][_idxCanvasCol];
				if (!cv){
					console.log(idxCanvasCol,_idxCanvasCol)
				}
				cv.x= c*this.canvasWidth -ox;
				cv.y= r*this.canvasHeight -oy;
				
				this.setDomPos(cv, this.offsetX+cv.x , this.offsetY+cv.y);

				if (this.canvasCols>1){
					_idxCanvasCol=(++_idxCanvasCol)%this.canvasCols;
				}
				
			}

			if (this.canvasRows>1){
				_idxCanvasRow=(++_idxCanvasRow)%this.canvasRows;
			}
		}

	}

		
}


);







