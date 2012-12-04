
var AbstractTiledMap=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}
};

AbstractTiledMap.inherit=function(subClass, proto){
	var superclass=this;
	var tmpConstructor = function() {};
	subClass=subClass||function() {};
	var orgProto=subClass.prototype;

	proto=proto||{};
	tmpConstructor.prototype = superclass.prototype;
	subClass.prototype = new tmpConstructor();
	
	for ( var key in proto) {
		subClass.prototype[key] = proto[key];
	}
	for ( var key in orgProto) {
		subClass.prototype[key] = orgProto[key];
	}
		
	subClass.prototype.constructor = subClass;
	subClass.superclass=superclass;
	subClass.$superclass = superclass.prototype;
	subClass.inherit=superclass.inherit;
	subClass.overwritten=superclass.overwritten;
	return subClass;
};

AbstractTiledMap.overwritten=function(proto){
	for ( var key in proto) {
		this.prototype[key] = proto[key];
	}	
}

AbstractTiledMap.prototype={
	//construtor : AbstractTiledMap ,	
	
	id : null ,

	width : null,
	height : null,	
	tileWidth : null,
	tileHeight : null,
	
	mapData : null,	
	mapDataRows : 0,
	mapDataCols : 0,
	mapDataInfo : null,
		
	zoom : null, 
	
	repeatX : false,
	repeatY : false,

	game : null,

	walkableTilesNo : null,

	init : function(parent){

		var game=this.findGame(parent);
		this.zoom=this.zoom||game.zoom||1;		
		this.halfTileWidth= this.tileWidth>>1;
		this.halfTileHeight= this.tileHeight>>1;
		this.tileSide=Math.sqrt( this.halfTileWidth*this.halfTileWidth + this.halfTileHeight*this.halfTileHeight);
		
		if (this.repeatX){
			this.getNewCol=this.getNewColCircle;
		}
		if (this.repeatY){
			this.getNewRow=this.getNewRowCircle;
		}		
		
		this.initMap();

	
	},


	findGame : function(parent){
		var game=this.game;

		if (this.game==null){
			while(parent!=null && game==null ){
				game=parent.game;
				parent=parent.parent;
			}
			this.game=game;
		}
		return game;		
	},

	initMap : function(){
		
		this.initMapData();

		this.initMapSize();

		this.initMapDataInfo();

	},

	initMapData : function(){
		this.mapDataCols=this.mapDataCols||1;
		this.mapData= (this.mapData[0]&&this.mapData[0].length>0)?this.mapData
							:this.arrTo2dArr(this.mapData, this.mapDataCols);
		this.mapDataRows = this.mapData.length || 0;
		
		this.minMapDataCol=this.minMapDataRow=0;
		this.maxMapDataCol=this.mapDataCols-1;
		this.maxMapDataRow=this.mapDataRows-1;

		this.mapCols=this.mapCols||this.mapDataCols;
		this.mapRows=this.mapRows||this.mapDataRows;			
	},

	initMapSize : function(){

		this.mapWidth = this.mapCols * this.tileWidth;
		this.mapHeight = this.mapRows * this.tileHeight;
		
	},


	initMapDataInfo : function(){

		this.mapDataInfo=[];
		for ( var r = 0; r < this.mapDataRows; r++) {

			this.mapDataInfo[r] = [];

			for ( var c = 0; c < this.mapDataCols; c++) {
				var no = this.mapData[r][c];
				var tile=this.createTile(c,r,no);
				this.mapDataInfo[r][c]=this.initTile(tile)||tile;
			}

		}

	},

	createTile : function(c,r,no){
		return {
			no : no	,
			col : c ,
			row : r
		};
	},

	initTile : function(tile){

		return tile;
	},

	update : function(deltaTime){

	},



	mapTile2mapPx : function(c, r){
		return {
			x : this.tileWidth  * c,
			y : this.tileHeight * r
		};	
	},

	mapPx2mapTile : function(x, y) {

		var c = Math.floor( x / this.tileWidth );
		var r = Math.floor( y / this.tileHeight );				

		return {
			col : c,
			row : r
		};

	},


	getTileInfoByPx : function(x, y) {

		var f = this.mapPx2mapTile(x, y);

		return f ? this.getTileInfo(f.col, f.row) : null;

	},


	getTileInfo : function(c, r) {
		r=this.mapDataInfo[r];
		return r?r[c]:null;		
	},

	getNewColCircle : function(c){
		var _c = c % this.mapDataCols;
		return _c<0?this.mapDataCols+_c:_c;		
	},
	getNewRowCircle : function(r){
		var _r = r % this.mapDataRows;
		return _r<0?this.mapDataRows+_r:_r;		
	},

	getNewCol : function(c){
		return c<0||c>=this.mapDataCols?null:c;		
	},
	getNewRow : function(r){
		return r<0||r>=this.mapDataRows?null:r;		
	},

	reset : function(){
		this.init(this.game);
	},

	destroy : function(){
		this.game=null;
		this.mapDataInfo=null;
		this.mapData=null;
	},

	arrTo2dArr : function(arr, cols){
			cols = cols||1;
			var mapData2=[];
			var rows= Math.floor( (arr.length+cols)/cols ) -1 ;
			var r=0,c=0,i=0;
			for ( r = 0; r < rows; r++) {
				mapData2[r] = [];
				for ( c = 0; c < cols; c++) {
					mapData2[r][c]=arr[i++];
				}
			}
			return mapData2;
	}
};







