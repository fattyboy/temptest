
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};

	var TiledMap=ns.TiledMap=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	TiledMap.prototype={
		constructor : TiledMap,

		x : 0,
		y : 0,

		tileWidth : 64 ,
		tileHeight : 64 ,
		mapCols : 10,
		mapRows : 10,
		// width : 1024,
		// height : 1024,
		minX : 0,
		minY : 0,
		maxX : 0,
		maxY : 0,

		init : function(game){

			this.width=this.mapCols*this.tileWidth;
			this.height=this.mapRows*this.tileHeight;

			this.maxX=this.maxX||this.width-this.viewWidth;
			this.maxY=this.maxY||this.height-this.viewHeight;


			this.initTiles();

			this.setPos(this.x,this.y);

			this.scrolled=true;
		},

		initTiles : function(){
			
		},

		scrollBy : function(dx,dy){
			this.setPos(this.x+dx,this.y+dy);
		},
		setPos : function(x,y){
			this.lastX=this.x;
			this.lastY=this.y;
			this.x=Math.max(this.minX, Math.min(this.maxX, x));
			this.y=Math.max(this.minY, Math.min(this.maxY, y));
			if (this.lastX!=this.x || this.lastY!=this.y){
				this.scrolled=true;
			}
		},

		update : function(deltaTime ){
		
			this.scrolled=false;

		},
		
		render : function(context , deltaTime ){
			
			if (this.scrolled){
				ns.setDomPos(this.box, -this.x, -this.y);
				this.scrolled=false;
			}

		}

	}

}( typeof exports!="undefined"?exports:this ));


