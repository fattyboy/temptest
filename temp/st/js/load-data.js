

	var frameW=128, frameH=128 ;
	//85,104
	var framePreRow=8;
	function getFrames(row,startCol,endCol){
		var frames=[];
		var w=frameW , h=frameH ;
		startCol=startCol||0;
		endCol=endCol||framePreRow-1;
		for (var i=startCol;i<endCol;i++){

			frames.push( { 

				width : w,
				height : h,
				
				baseX : Math.ceil(w/2) ,
				baseY : h-10 ,

				// sourceRect : {
					x : w*i,
					y : h*row ,
					w : w ,
					h : h,
				// }, 
				duration : 60 } );
		}
		return frames;
	}

var player=new Player({
	id : "p1",
	defaultSpeed : 0.14,
	speed : 0.14,
	speedR : 0.1,
	// x : 120,
	// y : 120,
	x : triggerData[0][3][0],
	y : triggerData[0][3][1],

	
	//默认的Animation的Id , string类型
	
	defaultAnimId : "stand_0",


});


var triggerList=[];
triggerData.forEach(function(p,idx){
	if (idx!==1){
		return
	}
	var trigger=new TS.Trigger({
		aabb : Polygon.computeAABB(p),
		triggered : false ,
		check : function(actor,entity){
			var aabb=this.aabb;
			var x=actor.x ,y=actor.y;
			var ok= aabb[0]<x && x<aabb[2] && aabb[1]<y && y<aabb[3] ;
			return ok && !this.triggered && !actor.dead;
		},
		run : function(actor,entity){
			this.triggered=true;
			actor.resetInput();
			console.log("you win");
		}
	})
	trigger.init();
	triggerList.push(trigger);

});

var blocks=[];
blockData.forEach(function(p,idx){
	var block=new Block({
		id : idx,
		vertices : p ,
		hidden : idx<2,
		height : idx<4?100:60
	})
	block.init();
	blocks[idx]=block;
	block.col=Math.round((block.aabb[2]-block.aabb[0])/Config.tileSize);
	block.row=Math.round((block.aabb[3]-block.aabb[1])/Config.tileSize);
});


var enemyList=[];

enemyData.forEach(function(path,idx){


	var enemy=new Enemy({
		id : "e_"+idx,
		actionQ : new TS.MoveQueue({
			queue : path.slice(),
			onNext : function(actor){
				actor.updateTarget();
			},
			onEnd : function(actor){
				this.start();
				actor.updateTarget();
			}
		}),
		x : path[0][0],
		y : path[0][1],
		speed : getRandom(50,80)/1000,
		speedR : 0.05 ,
		viewRadius : 400 ,
		viewAngle : 1.6,

	
	//默认的Animation的Id , string类型
	
	defaultAnimId : "stand_0",

	});

	enemyList.push(enemy);


})


			 