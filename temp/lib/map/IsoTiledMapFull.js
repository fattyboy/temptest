
var IsoTiledMapFull=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	

}



TiledMapFull.inherit( IsoTiledMapFull , 

{

	translateCanvas : true ,
	needClear : false ,


	initCanvasSize : function(){
		this.canvasWidth=(this.mapCols+this.mapRows)*this.tileWidth;
		this.canvasHeight=(this.mapCols+this.mapRows)*this.halfTileHeight;

		this.canvasTileCols=Math.ceil(this.canvasWidth/this.tileWidth);
		this.canvasTileRows=Math.ceil(this.canvasHeight/this.halfTileHeight);

		this.originX+=this.canvasWidth>>1;
	},

	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		var pos=this.mapTile2mapPx(c,r);

		var x=pos.x + this.originX;
		var y=pos.y + this.originY;

		return {
			x : x,
			y : y
		};	
	}
	
}


);

IsoTiledMapFull.overwritten({
	
	initMapSize : IsoTiledMapBase.prototype.initMapSize,

	getMapPos : IsoTiledMapBase.prototype.getMapPos,

	setMapPos : IsoTiledMapBase.prototype.setMapPos,

	updateTilePosInfo : IsoTiledMapBase.prototype.updateTilePosInfo,

	mapTile2mapPx : IsoTiledMapBase.prototype.mapTile2mapPx,

	mapPx2mapTile : IsoTiledMapBase.prototype.mapPx2mapTile


});





