
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};

	var GameScene=ns.GameScene=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}


	var PT={
		constructor : GameScene,


addNodeToSortedList : function(nodeList){

	for (var i=0;i<nodeList.length;i++){
		var e=nodeList[i];

		if (e.hidden){
			continue;
		}
	
		var inserted=false;
		var node=this.sortedList.first();
		while(node!=this.sortedList.tail){
			if ( e.aabb[0]-node.aabb[2]<-0.0004 && e.aabb[1]-node.aabb[3]<-0.0004 ){
				this.sortedList.insertBefore(e,node);
				inserted=true;
				break;
			}
			node=node._next;
		};
		if (!inserted){
			this.sortedList.addNode(e);
		}
	}
},

sortMove : function(){


	for (var i=0;i<this.moveList.length;i++){
		var e=this.moveList[i];
		if (!e.hidden && !e.static){
			this.sortedList.removeNode(e);
		}
	}

	for (var i=0;i<this.moveList.length;i++){
		var e=this.moveList[i];
		if (e.hidden || e.static){
			continue;
		}
	
		var inserted=false;
		var node=this.sortedList.first();
		while(node!=this.sortedList.tail){
			// TODO   compare  max to max 
			if (!e.block && !node.block ){
				if ( e.aabb[2]-node.aabb[2]<0.0004 && e.aabb[3]-node.aabb[3]<0.0004 ){
					this.sortedList.insertBefore(e,node);
					inserted=true;
					break;
				}
			}else if ( e.aabb[0]-node.aabb[2]<-0.0004 && e.aabb[1]-node.aabb[3]<-0.0004 ){
			// if ( e.aabb[2]-node.aabb[2]<0.0004 && e.aabb[3]-node.aabb[3]<0.0004 ){
				this.sortedList.insertBefore(e,node);
				inserted=true;
				break;
			}
			node=node._next;
		};
		if (!inserted){
			this.sortedList.addNode(e);
		}
	}

},

getWorldPos : function(x,y){

	x-=Config.TRANSLATE_X;
	y-=Config.TRANSLATE_Y;
	x/=Config.SCALE_X;
	y/=Config.SCALE_Y;

	var cx=(x+y)/(Config.R_COS*2);
	var cy=(y-x)/(Config.R_SIN*2);
	// var cx=y*Config.R_COS-x*Config.R_SIN;
	// var cy=y*Config.R_COS+x*Config.R_SIN;
	cx+=this.map.x;
	cy+=this.map.y;

	return [cx,cy];
},

getViewPos : function(x,y){
	x=x-this.map.x;
	y=y-this.map.y;
	var vx=x*Config.R_COS-y*Config.R_SIN;
	var vy=y*Config.R_SIN+x*Config.R_COS;
	vx*=Config.SCALE_X;
	vy*=Config.SCALE_Y;
	vx+=Config.TRANSLATE_X;
	vy+=Config.TRANSLATE_Y;
	return [vx,vy];
},

drawMiniMap : function(context){
	context.save();
	context.translate(780,20);
	context.scale(0.1,0.1);
	context.globalAlpha=0.8;
	context.fillStyle="rgba(255,255,255,0.2)";
	context.fillRect(0,0,this.map.width,this.map.height);
	blocks.forEach(function(e){
		drawPoly(context,e.vertices,"rgba(0,0,0,0.6)",true);
	});

	enemyList.forEach(function(e){
		drawCircle(context,e.x,e.y,25,"red",true);
	});

	drawCircle(context,player.x,player.y,25,"blue",true);
	context.globalAlpha=1;
	context.restore();
}


	};


	var PPT=ns.Scene.prototype;
	for (var p in PPT){
		GameScene.prototype[p]=PPT[p];
	}
	for (var p in PT){
		GameScene.prototype[p]=PT[p];
	}

}( typeof exports!="undefined"?exports:this ));

