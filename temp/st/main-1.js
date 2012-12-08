
function init(){

	var canvas=document.getElementById("canvas");

	var container=canvas.parentNode;
	container.style.width=WIDTH+"px";
	container.style.height=HEIGHT+"px";

	canvas.width=WIDTH;
	canvas.height=HEIGHT;
	canvas.style.zIndex=5;



	var context=canvas.getContext("2d");
	context.lineWidth=1;
	context.strokeStyle="black";
	context.fillStyle="white";


	Game.viewport=container;
	Game.width=WIDTH;
	Game.height=HEIGHT;

	// var bgcanvas=document.createElement("canvas");
	// bgcanvas.width=(MAP_ROW+MAP_COL)*tileWidth;
	// bgcanvas.height=(MAP_ROW+MAP_COL)*tileHeight;
	// bgcanvas.style.zIndex=4;
	// var bgcontext=bgcanvas.getContext("2d");
	// Game.bgcanvas=bgcanvas;
	// Game.bgcontext=bgcontext;





	Game.map=new TiledMap({
		x : 0,
		y : 0,
		tileWidth :  tileSize,
		tileHeight :  tileSize,
		mapCols : 32 ,
		mapRows : 32 ,
		viewWidth : tileSize*11,
		viewHeight : tileSize*11,
		minX : 0,
		minY : 0,
		maxX : tileSize*18,
		maxY : tileSize*18,
	})
	Game.map.init();

	Game.ground=new IsoGround({
		x : 0,
		y : 0,
		tileWidth :  tileWidth,
		tileHeight :  tileHeight,
		mapCols : 32 ,
		mapRows : 32 ,
		mapData : mapData ,
		container : container
	})
	Game.ground.init();


	Game.sleep=Math.floor(1000/FPS);
	Game.canvas=canvas;
	Game.context=context;


	Game.resCache={
		map : $id("map-tile"),
		man : $id("man-sheet"),
		wall : $id("wall-tile")
	}
	Game.initEvent();

	Game.start();

	var pos=getDomOffset(canvas);
	canvas.pageX=pos.left;
	canvas.pageY=pos.top;


	blocks.forEach(function(block){

		if (block.hidden){
			return
		}
		var canvas=document.createElement("canvas");
		canvas.width=(block.col+block.row)*tileWidth/2;
		canvas.height=(block.col+block.row)*tileHeight/2+tileHeight*2;
		var context=canvas.getContext("2d");

		var startX=tileWidth/2*block.col;
		var startY=(block.col+block.row-1)*tileHeight/2;
		for (var r=0;r<block.row;r++){
			context.drawImage(Game.resCache.wall, 0,tileHeight, tileWidth/2, tileHeight*2.5 ,
						startX+r*tileWidth/2,
						startY-r*tileHeight/2,
						tileWidth/2, tileHeight*2.5 
					);
	
		}

		var startX=0;
		var startY=block.row*tileHeight/2;
		for (var r=0;r<block.col;r++){
			context.drawImage(Game.resCache.wall, tileWidth/2,tileHeight, tileWidth/2, tileHeight*2.5 ,
						startX+r*tileWidth/2,
						startY+r*tileHeight/2,
						tileWidth/2, tileHeight*2.5 
					);
	
		}

		var startX=tileWidth/2*(block.row-1);
		for (var r=0;r<block.row;r++){
			for (var c=0;c<block.col;c++){
				context.drawImage(Game.resCache.wall, 0,0, tileWidth, tileHeight ,
						startX+(c-r)*tileWidth/2,
						(c+r)*tileHeight/2,
						tileWidth, tileHeight
					)
				// context.fillStyle="white";
				// context.fillText(block.col+","+block.row,30,30);

			}
		}

		//document.body.appendChild(canvas);
		block.img=canvas;
	})


	setTimeout(function(){ 
		window.scrollTo(0, 1);
		//NS.hideAddressBar();
	}, 100);

}





var speedDefault=0.05, speedDefaultR=0.001;
var speedR=0;
var speedX=speedDefault;
var speedY=speedDefault;



var moveList=[];

var sortedList=new LinkedList();

Game.beforeStart=function(){	

	Game.ground.renderAll();

	enemyList.forEach(function(e){
		moveList.push(e);
	});
	moveList.push(player);

	Game.addNodeToSortedList(blocks);
	Game.addNodeToSortedList(moveList);

}

Game.addNodeToSortedList = function(nodeList){

	for (var i=0;i<nodeList.length;i++){
		var e=nodeList[i];

		if (e.hidden){
			continue;
		}
	
		var inserted=false;
		var node=sortedList.first();
		while(node!=sortedList.tail){
			if ( e.aabb[0]-node.aabb[2]<-0.0004 && e.aabb[1]-node.aabb[3]<-0.0004 ){
				sortedList.insertBefore(e,node);
				inserted=true;
				break;
			}
			node=node._next;
		};
		if (!inserted){
			sortedList.addNode(e);
		}
	}
}

Game.sortMove=function(){


	for (var i=0;i<moveList.length;i++){
		var e=moveList[i];
		if (!e.hidden && !e.static){
			sortedList.removeNode(e);
		}
	}

	for (var i=0;i<moveList.length;i++){
		var e=moveList[i];
		if (e.hidden || e.static){
			continue;
		}
	
		var inserted=false;
		var node=sortedList.first();
		while(node!=sortedList.tail){
			if ( e.aabb[0]-node.aabb[2]<-0.0004 && e.aabb[1]-node.aabb[3]<-0.0004 ){
				sortedList.insertBefore(e,node);
				inserted=true;
				break;
			}
			node=node._next;
		};
		if (!inserted){
			sortedList.addNode(e);
		}
	}

}



Game.step=false;

var loopCount=0;
Game.update = function(deltaTime, s){


	if ( Game.step && !s){ return;  }

	loopCount++;

	deltaTime=Game.sleep;

	Game.map.update();

	player.update(deltaTime);

	var x=player.x;
	var y=player.y;

	var posv=Game.getViewPos(x,y);
	var xv=posv[0], yv=posv[1];
	var dx=0,dy=0;
	var margin=200;
	if (xv<margin){
		dx=xv-margin;
	}else if( xv>Game.width-margin ){
		dx=xv-(Game.width-margin);
	}

	if (yv<margin){
		dy=yv-margin;
	}else if( yv>Game.height-margin ){
		dy=yv-(Game.height-margin);
	}

	dx/=Config.SCALE_X;
	dy/=Config.SCALE_Y;
	var ddx=(dx+dy)/(2*Config.R_COS);
	var ddy=(dy-dx)/(2*Config.R_SIN);

	if (ddx || ddy){
		Game.map.scrolled=true
	}
	Game.map.scrollBy(ddx,ddy);

// if (loopCount<2){ return; }

	enemyList.forEach(function(e){

		e.update(deltaTime);

		if (e.dead){
			return;
		}
		var lastLook=e.look;
		// first time edgeList=[]
		e.look=e.canSee(x,y);

		if (e.look){
			if (!player.dead){
				// player.resetInput();
				console.log(e.id+" found you, you dead");
				player.dead=true;

				e.viewfield.changeShape(0.8,600);
				// Game.step=1;
			}
			var dx=player.x-e.x , dy=player.y-e.y;
			var rad=Math.atan2(dy,dx);
			e.setRotation( rad * CONST.RAD_TO_DEG );
			e.actionQ.paused=true;

		}else if(lastLook){
			e.viewfield.changeShape(1.6,600);
			e.actionQ.paused=false;
		}

	})

	triggerList.forEach(function(t){
		if (t.check(player)){
			t.run(player);
		};
	})

	
}

Game.redraw=true;


Game.draw = function(){

	Game.drawBg();

	Game.context.save();

	Game.context.translate( Config.TRANSLATE_X, Config.TRANSLATE_Y );
	Game.context.scale(Config.SCALE_X, Config.SCALE_Y);
	Game.context.rotate(Config.ROTATION);
	Game.context.translate(-Game.map.x, -Game.map.y);

	Game.context.strokeRect(player.actionAABB[0], player.actionAABB[1], 
							player.actionRadius*2, player.actionRadius*2)
	Game.context.strokeRect(player.aabb[0], player.aabb[1], 
							player.radius*2, player.radius*2);
	drawPoint(Game.context, player.x, player.y, 'red')

	enemyList.forEach(function(e){
		if (!e.dead){
			e.renderView(Game.context);
		}
	});


	Game.context.restore();


	Game.sortMove();
	var node=sortedList.first();
	var checkCover=false;
	while(node!=sortedList.tail){
		node.render(Game.context);
		if (checkCover && node.block){
			var rs=node.inCoverArea(player.x,player.y);
			if (rs){
				checkCover=false;
			}
		}
		if (node==player){
			checkCover=true;
		}

		node=node._next;
	};

	Game.drawMiniMap(Game.context);

};
Game.drawBg=function(){
	//Game.redraw=Game.map.scrolled;
	//
	if (Game.map.scrolled){
		var pos=Game.getViewPos(0,0);
		Game.ground.setPos(	Math.round(pos[0]- MAP_ROW*tileWidth/2),
				Math.round(pos[1]) );
	}	

	if (!Game.redraw){
		return;
	}
	Game.redraw=false;

	// var s=72/Math.SQRT2;

	// Game.context.fillRect(72/Math.SQRT2,72/Math.SQRT2,72*(MAP_COL-2)/Math.SQRT2,72*(MAP_ROW-2)/Math.SQRT2);

}


Game.clear =　function(){
	Game.context.clearRect(0,0,WIDTH, HEIGHT);
	// Game.context.fillRect(0,0,WIDTH, HEIGHT);

}

Game.drawMiniMap = function(context){
	context.save();
	context.translate(780,20);
	context.scale(0.1,0.1);
	context.globalAlpha=0.8;
	context.fillStyle="rgba(255,255,255,0.2)";
	// console.log(Game.map.width,Game.map.height)
	Game.context.fillRect(0,0,Game.map.width,Game.map.height)
	blocks.forEach(function(e){
		drawPoly(context,e.vertices,"rgba(0,0,0,0.6)",true);
	})
	enemyList.forEach(function(e){
		drawCircle(context,e.x,e.y,25,"red",true);
	})
	drawCircle(context,player.x,player.y,25,"blue",true);
	context.globalAlpha=1;
	Game.context.restore();
}


Game.getWorldPos=function(x,y){

	x-=Config.TRANSLATE_X;
	y-=Config.TRANSLATE_Y;
	x/=Config.SCALE_X;
	y/=Config.SCALE_Y;

	var cx=(x+y)/(Config.R_COS*2);
	var cy=(y-x)/(Config.R_SIN*2);
	// var cx=y*Config.R_COS-x*Config.R_SIN;
	// var cy=y*Config.R_COS+x*Config.R_SIN;
	cx+=Game.map.x;
	cy+=Game.map.y;

	return [cx,cy];
}

Game.getViewPos=function(x,y){
	x=x-Game.map.x;
	y=y-Game.map.y;
	var vx=x*Config.R_COS-y*Config.R_SIN;
	var vy=y*Config.R_SIN+x*Config.R_COS;
	vx*=Config.SCALE_X;
	vy*=Config.SCALE_Y;
	vx+=Config.TRANSLATE_X;
	vy+=Config.TRANSLATE_Y;
	return [vx,vy];
}

Game.afterLoop=function(deltaTime){
	player.handleInput(deltaTime);
}




function showFPS(game){	

		if (game==null){
			return;
		}
		if (game.logger==null){
			game.logger={ frameCount : 0 };
		}
if (hiddenFPS){
	return;
}
		var div=$id("fpsBar");
		if (div==null){
			div=document.createElement("div");
			document.body.appendChild(div);
			var style={
				backgroundColor:"rgba(0,0,0,0.5)",
				position:"absolute",
				left:"1px",
				top:"1px",
				color:"#fff",
				width:"100px",
				height:"30px",
				border:"solid 1px #ccc",
				fontSize:"22px",
				zIndex : 99999
			}
			for (var key in style){
				div.style[key]=style[key];
			}
		}
		function _core(){			
			div.innerHTML = "FPS:" + game.logger.frameCount;
			game.logger.frameCount = 0;	
		}
		setInterval(_core ,1000-1);
	}

