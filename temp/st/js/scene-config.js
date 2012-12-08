var SceneConfig =[

	function(data){

		var cfg={

			data : data ,


			onInit : function(){
				var data=this.data||{};

				var Me=this;

				this.player=player;
				this.player.init();

				this.moveList=[ this.player ];
				this.sortedList=new TS.LinkedList();
	

				enemyList.forEach(function(e){
					e.init();
					Me.moveList.push(e);
				});

		

				this.addNodeToSortedList(blocks);
				this.addNodeToSortedList(this.moveList);


				var tileSize=Config.tileSize;

				this.map=new TS.TiledMap({
					x : 0,
					y : 0,
					tileWidth : tileSize,
					tileHeight : tileSize,
					mapCols : 32 ,
					mapRows : 32 ,
					viewWidth :tileSize*11,
					viewHeight :tileSize*11,
					minX : 0,
					minY : 0,
					maxX :tileSize*18,
					maxY :tileSize*18,
				})
				this.map.init();

				this.ground=new TS.IsoGround({
					x : 0,
					y : 0,
					img : TS.ResPool.getRes("map"),
					tileWidth :  Config.tileWidth,
					tileHeight :  Config.tileHeight,
					mapCols : 32 ,
					mapRows : 32 ,
					mapData : mapData ,
					container : this.game.viewport
				})
				this.ground.init();

				this.ground.renderAll();

var wall=TS.ResPool.getRes("wall")
	blocks.forEach(function(block){

		if (block.hidden){
			return
		}
		var canvas=document.createElement("canvas");
		canvas.width=(block.col+block.row)*Config.tileWidth/2;
		canvas.height=(block.col+block.row)*Config.tileHeight/2+Config.tileHeight*2;
		var context=canvas.getContext("2d");

		var startX=Config.tileWidth/2*block.col;
		var startY=(block.col+block.row-1)*Config.tileHeight/2;
		for (var r=0;r<block.row;r++){
			context.drawImage(wall, 0,Config.tileHeight, Config.tileWidth/2, Config.tileHeight*2.5 ,
						startX+r*Config.tileWidth/2,
						startY-r*Config.tileHeight/2,
						Config.tileWidth/2, Config.tileHeight*2.5 
					);
	
		}

		var startX=0;
		var startY=block.row*Config.tileHeight/2;
		for (var r=0;r<block.col;r++){
			context.drawImage(wall, Config.tileWidth/2,Config.tileHeight, Config.tileWidth/2, Config.tileHeight*2.5 ,
						startX+r*Config.tileWidth/2,
						startY+r*Config.tileHeight/2,
						Config.tileWidth/2, Config.tileHeight*2.5 
					);
	
		}

		var startX=Config.tileWidth/2*(block.row-1);
		for (var r=0;r<block.row;r++){
			for (var c=0;c<block.col;c++){
				context.drawImage(wall, 0,0, Config.tileWidth, Config.tileHeight ,
						startX+(c-r)*Config.tileWidth/2,
						(c+r)*Config.tileHeight/2,
						Config.tileWidth, Config.tileHeight
					)
				// context.fillStyle="white";
				// context.fillText(block.col+","+block.row,30,30);

			}
		}

		//document.body.appendChild(canvas);
		block.img=canvas;
	})
	
				this.context=this.game.context;
			},


			// scrollTo : function(x,y){
			// 	this.map.setPos(x,y);
			// },

			// scrollBy : function(dx,dy){
			// 	var x=this.map.x+dx;
			// 	var y=this.map.y+dy;
			// 	this.map.setPos(x,y);
			// 	var bar=$id("quickbar");
			// 	x=bar.x-(this.map.x-this.map.lastX);
			// 	y=bar.y-(this.map.y-this.map.lastY);
			// 	bar.x=x||0;
			// 	bar.y=y||0;
			// 	bar.style.left=x+"px"
			// 	bar.style.top=y+"px"
			// },

			beforeRun : TS.noop,

			update : function(deltaTime, step){
				
				if ( game.step && !step){ return;  }
					
				this.map.update(deltaTime);

				this.player.update(deltaTime);
	var x=player.x;
	var y=player.y;

	var posv=this.getViewPos(x,y);
	// console.log(posv);
	var xv=posv[0], yv=posv[1];
	var dx=0,dy=0;
	var margin=200;
	if (xv<margin){
		dx=xv-margin;
	}else if( xv>this.viewWidth-margin ){
		dx=xv-(this.viewWidth-margin);
	}


	if (yv<margin){
		dy=yv-margin;
	}else if( yv>this.viewHeight-margin ){
		dy=yv-(this.viewHeight-margin);
	}

	// console.log(player.x,player.y,ddx,ddy)
	dx/=Config.SCALE_X;
	dy/=Config.SCALE_Y;
	var ddx=(dx+dy)/(2*Config.R_COS);
	var ddy=(dy-dx)/(2*Config.R_SIN);

	if (ddx || ddy){
		this.map.scrolled=true
	}
	this.map.scrollBy(ddx,ddy);

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

				// e.viewfield.changeShape(0.8,600);

			}
			// var dx=player.x-e.x , dy=player.y-e.y;
			// var rad=Math.atan2(dy,dx);
			// e.setRotation( rad * TS.CONST.RAD_TO_DEG );
			// e.actionQ.paused=true;
			// // e.stop();
		}else if(lastLook){
			// e.viewfield.changeShape(1.6,600);
			// e.actionQ.paused=false;
		}

	})

	triggerList.forEach(function(t){
		if (t.check(player)){
			t.run(player);
		};
	})
			},

			render : function(deltaTime){
var context=this.context;
	if (this.map.scrolled){

		var pos=this.getViewPos(0,0);
		// console.log(this.map.tileWidth)
		this.ground.setPos(	Math.round(pos[0]- this.map.mapRows* Config.tileWidth/2),
				Math.round(pos[1]) );
	}	

	context.save();

	context.translate( Config.TRANSLATE_X, Config.TRANSLATE_Y );
	context.scale(Config.SCALE_X, Config.SCALE_Y);
	context.rotate(Config.ROTATION);
	context.translate(-this.map.x, -this.map.y);

	context.strokeRect(player.actionAABB[0], player.actionAABB[1], 
							player.actionRadius*2, player.actionRadius*2)
	context.strokeRect(player.aabb[0], player.aabb[1], 
							player.radius*2, player.radius*2);
	drawPoint(context, player.x, player.y, 'red')

	enemyList.forEach(function(e){
		if (!e.dead){
			e.renderView(context);
		}
			context.strokeRect(e.aabb[0], e.aabb[1], 
							e.radius*2, e.radius*2);
	});


	context.restore();


	this.sortMove();
	var node=this.sortedList.first();
	var checkCover=false;
	while(node!=this.sortedList.tail){
		node.render(context);
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

				this.drawMiniMap(this.context);

			},


			handleInput : TS.noop,

			destroy : TS.noop
		};

		return cfg;
	}

]
