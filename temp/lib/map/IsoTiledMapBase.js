
var IsoTiledMapBase=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	
};

TiledMapBase.inherit( IsoTiledMapBase , 

{
	
	useImgData : false ,

	needClear : true ,

	initMapSize : function(){

		
		this.mapWidth = (this.mapCols+this.mapRows) * this.halfTileWidth;
		this.mapHeight = (this.mapCols+this.mapRows) * this.halfTileHeight;

		if (this.mapWidth<this.viewWidth){
			if (!this.repeatX){
				this.viewWidth=this.mapWidth;
			}
		}
		if (this.mapHeight<this.viewHeight){
			if (!this.repeatY){
				this.viewHeight=this.mapHeight;
			}
		}

		this.viewTileCols=Math.ceil(this.viewWidth/this.tileWidth);
		this.viewTileCols= ((this.viewTileCols+1)>>1<<1)+2;

		this.viewTileRows=Math.ceil(this.viewHeight/this.halfTileHeight);
		this.viewTileRows= ((this.viewTileRows+1)>>1<<1)+2;

	},

///////////////////////
///////////////////////



	updateTilePosInfo : function(){
		
		var pos=this.mapPx2mapTile(this.intX, this.intY);
		this.col = pos.col;
		this.row = pos.row;

		this.viewRow=this.col+this.row;
		this.viewCol=Math.floor( (this.col-this.row)/2 );
		
		this.tileOffsetX= this.intX-( this.viewCol * this.tileWidth);
		this.tileOffsetY= this.intY-( this.viewRow * this.halfTileHeight);

		var even=this.viewRow % 2==0;
		this.tileOffsetX-=(!even?this.halfTileWidth:0);

	},

	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		
		var x=cINc*this.tileWidth -(rINc%2!=0?(this.halfTileWidth):0);
		var y=rINc*this.halfTileHeight;

		return {
			x : x - this.halfTileWidth- this.tileOffsetX,
			y : y - this.tileHeight- this.tileOffsetY
		};	
	},


	drawRegion : function(fromCol, fromRow, toCol, toRow){

		fromCol--;
		fromRow--;
		var rowCount=toRow-fromRow;
		var colCount=toCol-fromCol;

		var even=true;
		for (var r=0;r<rowCount;r++){
			
			var col=fromCol , row=fromRow;

			for (var c=0;c<colCount;c++){
				
				var tileInfo=null;
				var _row=this.getNewRow(row);
				if (_row!=null){
					var _col=this.getNewCol(col);
					if (_col!=null){
						tileInfo=this.mapDataInfo[_row][_col];
					}	
				}
				var pos=this.drawTile( this.context2d, col, row, c, r, tileInfo );	
				//this.context2d.strokeText( col+","+row,	pos.x+this.tileWidth/4, pos.y+this.tileHeight/4);
				//this.context2d.strokeText( Math.floor((col-row)/2)+","+(col+row),	pos.x+this.tileWidth/4, pos.y+this.tileHeight/4 );

				col++;
				row--;
			}

			if (even){
				fromCol;
				fromRow++;				
			}else{
				fromCol++;
				fromRow;
			}
			even=!even;
		}

	},


	getMapPos : function(){
		var ix=this.y+this.x/2;
		var iy=this.y-this.x/2;
		return [ix, iy];
	},

	setMapPos : function(x,y,force){
		var vx=x-y;
		var vy=(x+y)/2;
		this.setViewPos(vx,vy,force);
	},

	/////////////////////



		// mapTile 2 mapPx
		mapTile2mapPx : function(c ,r){
			var x = (c-r-1)*this.halfTileWidth  ;
			var y = (c+r)*this.halfTileHeight ;
		
			return {
				x : x + this.offsetX,
				y : y + this.offsetY
			};
		},

		// mapPx 2 mapTile
		mapPx2mapTile : function(x,y){
			var c= Math.floor( (y*2 + x )/this.tileWidth );
			var r= Math.floor( (y - x/2 )/this.tileHeight ) ;			
			return {
				col : c,
				row : r
			};
		}

}


);

