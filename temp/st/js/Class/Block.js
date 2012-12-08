

;(function(scope,undefined){


	var Block=scope.Block=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	var PT={
		constructor : Block,

		block : true ,
		static : true ,
		height : 50 ,
		alpha : 1 ,

		coverAABB : null ,


		init : function(){
			this.initBase();
			this.updateAABB();
			this.coverAABB=this.coverAABB||[
				this.aabb[0]-this.height-2,
				this.aabb[1]-this.height-2,
				this.aabb[2]-(this.height>>1),
				this.aabb[3]-(this.height>>1)
			];
		},

		inCoverArea : function(x,y){
			var a=this.coverAABB;
			if (!a){
				return;
			}
			var rs=a[0]<x && x<a[2] && a[1]<y && y<a[3];
			this.alpha=1;
			if (rs){
				this.alpha=0.7;
			}
			return rs;
		},
		render : function(context){
			if (this.hidden || !this.img){
				return;
			}
			context.globalAlpha=this.alpha;
			var scene=game.currentScene;

			var pos=scene.getViewPos(this.aabb[0], this.aabb[1]);
			context.drawImage(this.img, 
				Math.round(pos[0]-this.row*Config.tileWidth/2),
				Math.round(pos[1]-Config.tileHeight*2)  );
			context.globalAlpha=1;
			var a=this.coverAABB;

		}
	};


	var PPT=Polygon.prototype;
	for (var p in PPT){
		Block.prototype[p]=PPT[p];
	}
	for (var p in PT){
		Block.prototype[p]=PT[p];
	}

}(this));