
var TiledMap=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}
};


TiledMap.prototype={
	
	constructor : TiledMap,

	id : null ,

	tileWidth : null,
	tileHeight : null,
	
	data : null,	
	dataRows : 0,
	dataCols : 0,
	dataInfo : null,
		

	img : null,
	
	imgCols : 0,
	imgRows : 0,
	tileOffsetX : 0,
	tileOffsetY : 0,

	startTileIndex : 1,
	cleanTiles : null,

	// emptyTile : null,
	// emptyTile : null,

	walkableTiles : null,
	blockTiles : null ,
	specialTiles : null,

	useArray : true ,

	initMap : function(){
		
		this.dataRows = this.data.length || 0;
		this.dataCols=this.dataCols||1;
		
		this.mapCols=this.mapCols||this.dataCols;
		this.mapRows=this.mapRows||this.dataRows;	
		this.mapWidth = this.mapCols * this.tileWidth;
		this.mapHeight = this.mapRows * this.tileHeight;

		this.initImgDataInfo();

		this.initDataInfo();

	},

	initImgDataInfo : function(){
		if (this.img){
			this.imgCols = Math.floor(this.img.width / this.tileWidth);
			this.imgRows = Math.floor(this.img.height / this.tileHeight);
			this.maxImgNo=this.imgRows*this.imgCols-1+this.startTileIndex;
		}

	},

	initDataInfo : function(){

		this.cleanTiles=this.cleanTiles||{};
		this.blankTiles=this.blankTiles||{};
				
		this.walkableTiles=this.walkableTiles||{};
		this.blockTiles=this.blockTiles||{};

		this.slopeTiles=this.slopeTiles||{};
		this.specialTiles=this.specialTiles||{};

		// if (this.emptyTile!=null){
		// 	this.emptyTile=this.createTile(null,null,this.emptyTile);
		// }

		if (this.useArray){
			this.dataInfo=[];
			for ( var r = 0; r < this.dataRows; r++) {
				var row = [];
				for ( var c = 0; c < this.dataCols; c++) {
					var no = this.data[r][c];
					var tile=this.createTile(c,r,no);
					row[c]=this.initTile(tile)||tile;
				}
				this.dataInfo[r]=row;
			}
			this.getTile=this.getTileArray;	
		}else{
			this.dataInfo={};
			for ( var r = 0; r < this.dataRows; r++) {
				for ( var c = 0; c < this.dataCols; c++) {
					var index=r*this.dataCols+c;
					var no = this.data[index];
					var tile=this.createTile(c,r,no);
					this.dataInfo[index]=this.initTile(tile)||tile;
				}
			}
			this.getTile=this.getTileMap;	
		}

	},


	createTile : function(c,r,no){

		var blockType;
		if (this.walkableTiles[no]){
			blockType=0;
		}else{
			blockType=this.blockTiles[no]||0;
		}

		var tile={
			no : no,
			block : blockType ,
			x : c*this.tileWidth,
			y : r*this.tileHeight,
			width : this.tileWidth,
			height : this.tileHeight,
			col : c ,
			row : r 
		};
		if (this.img){
			tile.blank = this.blankTiles[no];
			tile.clean= tile.blank || no==null || this.cleanTiles==="ALL" ||this.cleanTiles[no] ;
			
			var imgNo=0,imgX=0,imgY=0;
			if (!this.blank && no<=this.maxImgNo) {
				imgNo= no-this.startTileIndex;
				imgX = (imgNo % this.imgCols) * this.tileWidth;
				imgY = Math.floor( imgNo / this.imgCols) * this.tileHeight;
			}
			tile.iX = imgX ;
			tile.iY = imgY ;
			tile.iNo = imgNo ;
		}
		return tile;		

	},

	drawRegion : function(context, fromCol, fromRow, toCol, toRow){
		
		for (var r=fromRow;r<toRow;r++){
			var _r = this.getNewRow(r);	
			if (_r==null){
				continue;
			}
			for (var c=fromCol;c<toCol;c++){
				var _c = this.getNewCol(c);
				if (_c==null){
					continue;
				}
				this.drawTile( context, c, r, this.getTile(_c,_r) );	
			}
		}

	},	

	drawTile : function(context,c, r, tile) {
		// tile=tile || this.emptyTile ;

		if (tile){
			if (!this.needClear && tile.clean ) {	
				context.clearRect( tile.x, tile.y, 
						this.tileWidth, this.tileHeight);
			}
			if (!tile.blank && tile.no>=this.startTileIndex){
					context.drawImage(this.img,
						tile.iX, tile.iY,
						this.tileWidth, this.tileHeight,
						tile.x, tile.y, 
						this.tileWidth, this.tileHeight);
			}
		}else{
			context.clearRect( c*this.tileWidth, r*this.tileHeight, 
						this.tileWidth, this.tileHeight);
		}
		return tile;
	},


	refreshTile : function(c, r, info) {
		if (info!=null){
			var tile = this.getTile(c,r);
			for (var key in info){
				tile[key]=info[key];
			}
		}
		this.drawRegion(c,r,c+1,r+1);
	},

	initTile : function(tile){

		return tile;
	},



	getTileByPix : function(x, y) {

		var c = Math.floor( x / this.tileWidth );
		var r = Math.floor( y / this.tileHeight );				

		return {
			col : c,
			row : r
		};

	},


	getTileByPix : function(x, y) {

		var f = this.getTileByPix(x, y);

		return f ? this.getTile(f.col, f.row) : null;

	},


	getTileArray : function(c, r) {
		r=this.dataInfo[r];
		return r?r[c]:null;		
	},

	getTileMap : function(c, r){
		return this.dataInfo[r*this.dataCols+c];
	},

	getNewCol : function(c){
		return c<0||c>=this.dataCols?null:c;		
	},
	getNewRow : function(r){
		return r<0||r>=this.dataRows?null:r;		
	},

	collideWithEntity : function( box, dx,dy ){

		var collInfo = {	
			x : box.x1,
			y : box.y1,
		
			width : box.x2-box.x1,
			height : box.y2-box.y1,

			collisionX : false , 
			collisionY : false ,

			tileX : null,
			tileY : null
		};
		
		var steps= Math.max( Math.ceil(Math.abs(dx/this.tileWidth)) ,
							 Math.ceil(Math.abs(dy/this.tileHeight)) );
		collInfo.steps=steps;

		this._test=0;
		if( steps > 1 ) {
			
			var sx=dx/steps;
			var sy=dy/steps;

			for( var i = 0; i < steps && (sx || sy); i++ ) {
				this._collideStep(box, collInfo, sx, sy);
				if( collInfo.collisionX ) { sx = 0; }
				if( collInfo.collisionY ) { sy = 0; }
				if( collInfo.collisionSlope ) { break; }

			}
		} else {
			this._collideStep(box, collInfo, dx, dy);
		}

		this.collideSlope(box,collInfo,dx,dy);


		if (this.onCollided!=null){
			this.onCollided(box, collInfo, dx, dy );
		}
		// console.log("tile test ",this._test)
		return collInfo;
		
	},
	_collideStep: function( box,collInfo, dx, dy) {
	
		if( dx!=0 ) {
			this.collideHorizontal(collInfo, dx, dy);
		}

		if( dy!=0 ) {
			this.collideVertical(collInfo, dx, dy)	
		}
		
	},


	collideVertical : function( collInfo, dx, dy ){
		
		var down=dy > 0;
		var oldY=collInfo.y;
		collInfo.newY=collInfo.y+dy;
		collInfo.deltaY=dy;

		var tileY = Math.floor( ( collInfo.newY + (down ? collInfo.height : 0)) / this.tileHeight );

		var leftTileX = Math.floor(collInfo.x / this.tileWidth);
		var rightTileX = Math.floor((collInfo.x + collInfo.width-1) / this.tileWidth);
		

		for(var tileX = leftTileX; tileX <= rightTileX; tileX++ ) {
			var tile = this.getTile(tileX, tileY);
			this._test++;
			if( tile ) {
				if (tile.block ){
					collInfo.newY =tileY * this.tileHeight +  (down ? -collInfo.height : this.tileHeight );
					collInfo.collisionY = true;
					collInfo.deltaY=collInfo.newY-oldY;
					collInfo.tileY = tile;
					break;
				}else if (tile.slope ){
					// TODO
				}
			}
		}
		collInfo.y=collInfo.newY;
	},

	collideHorizontal : function(collInfo, dx, dy){
			var right=dx > 0;

			var oldX=collInfo.x;
			collInfo.newX=collInfo.x+dx;
			collInfo.deltaX=dx;

			var tileX = Math.floor( (collInfo.newX +  (right ? collInfo.width : 0) ) / this.tileWidth );
			
			var topTileY = Math.floor( collInfo.y / this.tileHeight);
			var bottomTileY = Math.floor(( collInfo.y + collInfo.height-1 ) / this.tileHeight);

			for(var tileY = topTileY; tileY <= bottomTileY; tileY++ ) {
				var tile = this.getTile(tileX, tileY);
				this._test++;
				if( tile ) {
					if (tile.block ){
						collInfo.newX = tileX * this.tileWidth + (right ? -collInfo.width : this.tileWidth );
						collInfo.collisionX = true;
						collInfo.deltaX=collInfo.newX-oldX;
						collInfo.tileX = tile;
						break; 
					}else if (tile.slope ){
						// TODO
					}
				}
			}		
			collInfo.x=collInfo.newX;
	},

	collideSlope : function(box, collInfo, dx, dy){
		var left=Math.floor(collInfo.x/this.tileWidth);
		var top=Math.floor(collInfo.y/this.tileHeight);
		var right=Math.floor((collInfo.x+collInfo.width-1)/this.tileWidth);
		var bottom=Math.floor((collInfo.y+collInfo.height-1)/this.tileHeight);

		function _onSlope(){
			var inY=tile.y+tile.height-(collInfo.y+collInfo.height);
			if (inX>inY){
				inY=collInfo.height+inX;
				collInfo.slope=true;
				collInfo.collisionS=true;
				collInfo.newY=tile.y+tile.height-inY;
				collInfo.deltaY=collInfo.newY-box.y1;
			}
		}
		var tile=this.getTile(right,bottom);
		this._test++;
		if (tile){
			var k=this.slopeTiles[tile.no];
			if (k==1){
				var inX=collInfo.x+collInfo.width-tile.x;
				_onSlope();
			}
		}
		tile=this.getTile(left,bottom);
		this._test++;
		if (tile){
			k=this.slopeTiles[tile.no];
			if (k==-1){
				var inX=tile.x+tile.width-collInfo.x;
				_onSlope();
			}
		}

		collInfo.x=collInfo.newX;
		collInfo.y=collInfo.newY;
	},

	destroy : function(){		
		this.data=null;
		this.dataInfo=null;
		this.img=null;

	}
};







