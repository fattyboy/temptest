

var CollisionTiledMap=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}
};

AbstractTiledMap.inherit( CollisionTiledMap , {

	blockTiles : null ,
	specialTiles : null,

	initMapDataInfo : function(){

		var blockTiles=[ "blockTiles", 
				"blockTopTiles", "blockBottomTiles", "blockLeftTiles", "blockRightTiles" ];
		var Me=this;
		blockTiles.forEach(function(blockKey){
			Me[blockKey]=Me[blockKey]||{};
			if ( Array.isArray(Me[blockKey]) ){
				var arr=Me[blockKey];
				var map=Me[blockKey]={};
				arr.forEach(function(no){
					map[no]=true;
				})
				
			}			
		});
		
		this.specialTiles=this.specialTiles||{};

		CollisionTiledMap.$superclass.initMapDataInfo.call(this);

	},

	createTile : function(c,r,no){
		return {
			no : no	,
			col : c ,
			row : r ,
			block : !!this.blockTiles[no],
			blockTop : !!this.blockTopTiles[no],
			blockBottom : !!this.blockBottomTiles[no],
			blockLeft : !!this.blockLeftTiles[no],
			blockRight : !!this.blockRightTiles[no]
		};
	},

	collideWithObject : function( collRect, dx,dy, noCollide ){

		if (noCollide){
			return {
				x: x+dx, 
				y: y+dy,
				collisionX : false , 
				collisionY : false ,
				tileX : 0,
				tileY : 0
			};
		}

		var collInfo = {	
			x : collRect.left,
			y : collRect.top,
		
			width : collRect.width,
			height : collRect.height,

			collisionX : false , 
			collisionY : false ,

			tileX : null,
			tileY : null
		};
		
		var steps= Math.max( Math.ceil(Math.abs(dx/this.tileWidth)) ,
							 Math.ceil(Math.abs(dy/this.tileHeight)) );
		
		if( steps > 1 ) {
			var sx=dx/steps;
			var sy=dy/steps;
			
			for( var i = 0; sx==0 && sy==0; i++ ) {
				this._collideStep( collInfo, sx, sy);				
				if( collInfo.collisionX ) { sx = 0; }
				if( collInfo.collisionY ) { sy = 0; }
			}
		} else {
			this._collideStep( collInfo, dx, dy);
		}
		
		if (this.onCollided!=null){
			this.onCollided(collRect, collInfo, dx, dy );
		}
		return collInfo;
		
	},
	_collideStep: function( collInfo, dx, dy) {
		
		if( dy!=0 ) {
			this.collideVertical(collInfo, dx, dy, dy > 0 )	
		}

		if( dx!=0 ) {
			this.collideHorizontal(collInfo, dx, dy, dx > 0);
		}
		
	},


	collideVertical : function( collInfo, dx, dy, down ){
		
		var oldY=collInfo.y;

		collInfo.y=collInfo.y+dy;
		
		var pxOffsetY = (down ? collInfo.height-1 : 0);
		var tileY = Math.floor( ( collInfo.y + pxOffsetY) / this.tileHeight );
	
		var leftTileX = Math.max( Math.floor(collInfo.x / this.tileWidth), 0 );
		var rightTileX = Math.min( Math.floor((collInfo.x + collInfo.width-1) / this.tileWidth), this.mapDataCols );
		
	
		for(var tileX = leftTileX; tileX <= rightTileX; tileX++ ) {
			var tile = this.getTileInfo(tileX, tileY);
			if( tile!=null){
				if (tile.block 
					|| tile.blockTop && down 
					|| tile.blockBottom && !down ){
					var newY =tileY * this.tileHeight +  (down ? -collInfo.height : this.tileHeight );
					if (tile.block 
							|| tile.blockTop && oldY-1<newY
							|| tile.blockBottom && oldY+1>newY
						 ){
						collInfo.tileY = tile;
						collInfo.collisionY = true;
						collInfo.y=newY;
						break;
					}
				}
			}
		}
	},

	collideHorizontal : function(collInfo, dx, dy, right){
			
			var oldX=collInfo.x;

			collInfo.x=collInfo.x+dx;

			var pxOffsetX = (right ? collInfo.width-1 : 0);
			var tileX = Math.floor( (collInfo.x + pxOffsetX) / this.tileWidth );
			
			var topTileY = Math.max( Math.floor( collInfo.y / this.tileHeight), 0 );
			var bottomTileY = Math.min( Math.floor(( collInfo.y + collInfo.height-1 ) / this.tileHeight), this.mapDataRows );
			
			for(var tileY = topTileY; tileY <= bottomTileY; tileY++ ) {
				var tile = this.getTileInfo(tileX, tileY);
				if( tile!=null){
					if (tile.block || tile.blockLeft && right || tile.blockRight && !right  ){
						var newX = tileX * this.tileWidth + (right ? -collInfo.width : this.tileWidth );
						if (tile.block 
								|| tile.blockLeft && oldX-1<newX
								|| tile.blockRight && oldX+1>newX 
							){
							collInfo.tileX = tile;
							collInfo.collisionX = true;
							collInfo.x=newX;
							break; 
						}		
					}					
				}
			}		
	},



	collideCornerV : function( collInfo, dx, dy, down ){

		var pxOffsetY, newY, tileX , tileY ;

		var newY=collInfo.y+dy;
		
		pxOffsetY = (down ? collInfo.height-1 : 0);
		tileY = Math.floor( ( newY + pxOffsetY) / this.tileHeight );
	
		var leftTileX = Math.max( Math.floor(collInfo.x / this.tileWidth), 0 );
		var rightTileX = Math.min( Math.floor((collInfo.x + collInfo.width-1) / this.tileWidth), this.mapDataCols );
		
		var leftTile = this.getTileInfo(leftTileX, tileY);
		var rightTile = this.getTileInfo(rightTileX, tileY);

		return [leftTile, rightTile];

	},

	collideCornerH : function( collInfo, dx, dy, right ){

		var pxOffsetX, newX, tileX , tileY;
		
		var newX=collInfo.x+dx;

		pxOffsetX = (right ? collInfo.width-1 : 0);
		tileX = Math.floor( (newX + pxOffsetX) / this.tileWidth );
		
		var topTileY = Math.max( Math.floor( collInfo.y / this.tileHeight), 0 );
		var bottomTileY = Math.min( Math.floor(( collInfo.y + collInfo.height-1 ) / this.tileHeight), this.mapDataRows );
	
		var topTile = this.getTileInfo(tileX, topTileY);
		var bottomTile = this.getTileInfo(tileX, bottomTileY);

		return [topTile, bottomTile];

	},

	collideTopCorner : function(collInfo, dx, dy){
		return this.collideCornerV(collInfo, dx, dy,false);
	},
	collideBottomCorner : function(collInfo, dx, dy){
		return this.collideCornerV(collInfo, dx, dy,true);
	},
	collideLeftCorner : function(collInfo, dx, dy){
		return this.collideCornerH(collInfo, dx, dy,false);
	},
	collideRightCorner : function(collInfo, dx, dy){
		return this.collideCornerH(collInfo, dx, dy,true);
	},

	onCollided : null  //function( collInfo, dx, dy )


} );

