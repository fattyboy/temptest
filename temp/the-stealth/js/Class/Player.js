
;(function(scope,undefined){

	var Player=scope.Player=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	Player.prototype={
		constructor : Player,


		x : 0, 
		y : 0, 
		vx : 0,
		vy : 0,
		ax : 0,
		ay : 0,
		dx : 0,
		dy : 0,

		speed : 0.08 ,

		rotation : 0 ,
		dir : 0 ,
		speedR : 0.3 ,

		actionAABB : null,

		anims : null,
		defaultAnimId : null,
		currentAnim : null,	
		currentAnimId : null,

		init : function(){
			
			this.anims ={
				"stand_0" : {
						img : "stand",												
						frames : getFrames(5,0,1)
					},
				"stand_1" : {	
						img : "stand",								
						frames : getFrames(6,0,1)
					},
				"stand_2" : {
						img : "stand",												
						frames : getFrames(7,0,1)
					},
				"stand_3" : {	
						img : "stand",											
						frames : getFrames(0,0,1)
					},

				"stand_4" : {	
						img : "stand",											
						frames : getFrames(1,0,1)
					},

				"stand_5" : {	
						img : "stand",											
						frames : getFrames(2,0,1)
					},

				"stand_6" : {	
						img : "stand",											
						frames : getFrames(3,0,1)
					},

				"stand_7" : {	
						img : "stand",											
						frames : getFrames(4,0,1)
					},


				"move_0" : {	
						img : "player",											
						frames : getFrames(5)
					},
				"move_1" : {	
						img : "player",											
						frames : getFrames(6)
					},
				"move_2" : {
						img : "player",												
						frames : getFrames(7)
					},
				"move_3" : {	
						img : "player",											
						frames : getFrames(0)
					},
				"move_4" : {	
						img : "player",											
						frames : getFrames(1)
					},
				"move_5" : {	
						img : "player",											
						frames : getFrames(2)
					},
				"move_6" : {	
						img : "player",											
						frames : getFrames(3)
					},
				"move_7" : {	
						img : "player",											
						frames : getFrames(4)
					}

			};
			this.last={
				vx : 0,
				vy : 0,
				ax : 0,
				ay : 0,
				dx : 0,
				dy : 0
			};

			this.rotationTarget=this.rotation;
			this.aabb=[];
			this.actionAABB=[];
			this.updateAABB();

			this.initAnims();
		},

	radius : 14 ,
	actionRadius : 20,
	updateAABB : function(){
		var r=this.radius,
			x=this.x,
			y=this.y;
		var aabb=this.aabb;
		aabb[0]=x-r;
		aabb[1]=y-r;
		aabb[2]=x+r;
		aabb[3]=y+r;


		var cos=Math.cos(this.rotationTarget*TS.CONST.DEG_TO_RAD),
			sin=Math.sin(this.rotationTarget*TS.CONST.DEG_TO_RAD);

		r=this.actionRadius;
		var offsetX=r*cos,
			offsetY=r*sin;//this.dir
		x=this.x+offsetX;
		y=this.y+offsetY;
		aabb=this.actionAABB;
		aabb[0]=x-r;
		aabb[1]=y-r;
		aabb[2]=x+r;
		aabb[3]=y+r;
	
	},

	updateRotation : function(deltaTime){

		var deltaR =this.speedR * deltaTime;
		// this.rotationTarget=Math.atan2(this.vy,this.vx)*TS.CONST.RAD_TO_DEG;

		this.rotation=(this.rotation+360)%360;
		this.rotationTarget=(this.rotationTarget+360)%360;

		var dr=this.rotationTarget-this.rotation;

		if (Math.abs(dr)<=deltaR || Math.abs(dr)>=360-deltaR){
			this.rotation=this.rotationTarget;
			deltaR=dr;
		}else{
			
			if (0<dr && dr<180){
				deltaR=deltaR;
			}else if( 180<=dr && dr<360){
				deltaR=-deltaR;
			}else if ( -180<dr && dr<0 ){
				deltaR=-deltaR;
			}else if( -360<dr && dr<=-180){
				deltaR=deltaR;
			}else{
				deltaR=0;
			}
			this.rotation+=deltaR;
		}


	},
	updateVelocity : function(targetX, targetY){

		var rad=this.rotationTarget*TS.CONST.DEG_TO_RAD;
		var vx= this.speed * Math.cos(rad);
		var vy= this.speed * Math.sin(rad);
		this.speedScale=1;
		if (vx*vy>0){
			// this.speedScale=1.2;
		}
		this.vx=vx*this.speedScale;
		this.vy=vy*this.speedScale;


	},
	update : function(deltaTime){

		this.lastX=this.x;
		this.lastY=this.y;
		this.updateMotion(deltaTime);

		if (this.walk){
			this.updatePos();
		}	
		this.updateAABB();
		this.updateVelocity(deltaTime);
		this.updateRotation(deltaTime);

		this.checkCollide();

		this.updateAnim(deltaTime);

	},


	updateMotion : function(deltaTime){
		var last=this.last;
		last.vx=this.vx;
		last.vy=this.vy;

		this.vx=this.vx + this.ax * deltaTime;
		this.vy=this.vy + this.ay * deltaTime;

		last.dx=this.dx;
		last.dy=this.dy;

		this.dx=(last.vx + this.vx) * deltaTime / 2 ; 
		this.dy=(last.vy + this.vy) * deltaTime / 2 ;	

	},


	checkCollide : function(){
		var coll=0;
		var _blocks=blocks;

		if( this.dy>0.5 || this.dy<-0.5 ) {
			coll+=this.collideVertical(_blocks);	
		}

		if( this.dx>0.5 || this.dx<-0.5 ) {
			coll+=this.collideHorizontal(_blocks);
		}

		// if( this.dy>0.5 || this.dy<-0.5 ) {
		// 	coll+=this.collideVertical(enemyList);	
		// }

		// if( this.dx>0.5 || this.dx<-0.5 ) {
		// 	coll+=this.collideHorizontal(enemyList);
		// }

		if (coll>0){
			
		}
		return coll;
	},

	collideVertical : function(blocks){
		var aabb1=this.aabb;
		var coll=0;
		for (var i=0;i<blocks.length;i++){
			var block=blocks[i];
			var aabb2=block.aabb;
			if ( aabb1[0]<aabb2[2] && aabb1[1]<aabb2[3] 
				&& aabb2[0]<aabb1[2] && aabb2[1]<aabb1[3] ){

				coll++;
				// this.vy=0;

				if (this.dy>0 && this.dy>=aabb1[3]-aabb2[1]-1){
					this.y=aabb2[1]-this.radius;
				}else if (this.dy<0 && this.dy<=aabb1[1]-aabb2[3]+1){
					this.y=aabb2[3]+this.radius;
				}
				this.updateAABB();
				if (coll>1){
					break;
				}
			}

		}
		return coll;
	},

	collideHorizontal : function(){
		var aabb1=this.aabb;
		var coll=0;
		for (var i=0;i<blocks.length;i++){
			var block=blocks[i];
			var aabb2=block.aabb;
			if ( aabb1[0]<aabb2[2] && aabb1[1]<aabb2[3] 
				&& aabb2[0]<aabb1[2] && aabb2[1]<aabb1[3] ){

				coll++;
				// this.vx=0;
				
				if (this.dx>0 && this.dx>=aabb1[2]-aabb2[0]-1 ){
					this.x=aabb2[0]-this.radius;
				}else if (this.dx<0 && this.dx<=aabb1[0]-aabb2[2]+1){
					this.x=aabb2[2]+this.radius;
				}
				this.updateAABB();
				if (coll>1){
					break;
				}
			}

		}
		return coll;
	},


	setPos : function(x,y){
		this.x=x;
		this.y=y;
	},

	updatePos : function(){
		this.x+=this.dx;
		this.y+=this.dy;
	},

	resetInput : function(){
		joystick.moveX=joystick.moveY=joystick.moveDistance=0;
		TS.KeyState[TS.Key.W]=TS.KeyState[TS.Key.UP]
			=TS.KeyState[TS.Key.S]=TS.KeyState[TS.Key.DOWN]
			=TS.KeyState[TS.Key.A]=TS.KeyState[TS.Key.LEFT]
			=TS.KeyState[TS.Key.D]=TS.KeyState[TS.Key.RIGHT]=false;
	},

	doAction : function(){
		if (this.doing){
			return;
		}
		this.doing=true;
		// console.log(enemyList.length)
		(enemyList[5]||enemyList[0]).killed();
		console.log("do action : ",player.doing)
	},
	handleInput : function(deltaTime){
		var changed=false;
		var walk=false;
		if (joystick){

			var jx=joystick.moveX, 
				jy=joystick.moveY;
			var distance=joystick.moveDistance;
		}

		var up=false, down=false, left=false, right=false;
		if (distance>=10){
			var hd=distance/2;
			if (jx>0 && Math.abs(jy)<hd){
				right=true;
			}else if (jx<0 && Math.abs(jy)<hd){
				left=true;
			}else if (jy>0 && Math.abs(jx)<hd){
				down=true;
			}else if (jy<0 && Math.abs(jx)<hd){
				up=true;
			}else if (jx>0 && jy>0){
				right=true;
				down=true;
			}else if (jx<0 && jy<0){
				left=true;
				up=true;
			}else if (jx>0 && jy<0){
				right=true;
				up=true;
			}else if (jx<0 && jy>0){
				left=true;
				down=true;
			}


		}else{
			
			up=TS.KeyState[TS.Key.W]||TS.KeyState[TS.Key.UP];
			down=TS.KeyState[TS.Key.S]||TS.KeyState[TS.Key.DOWN];
			left=TS.KeyState[TS.Key.A]||TS.KeyState[TS.Key.LEFT];
			right=TS.KeyState[TS.Key.D]||TS.KeyState[TS.Key.RIGHT];
		}

			var action=TS.KeyState[TS.Key.J];
			if (action){
				player.doAction()
			}


			var speedY=0,speedX=0;

			
				if (up && !down){
					speedY=-1;
				}else if (down && !up){
					speedY=1;	
				}else{
					speedY=0;	
				}			

				if (left && !right){
					speedX=-1;
				}else if (right && !left){
					speedX=1;
				}else{
					speedX=0;	
				}	

			
			if (Config.ROTATION){
				var sx=speedX*Config.R_COS+speedY*Config.R_SIN;
				var sy=speedY*Config.R_SIN-speedX*Config.R_COS;
				speedX=sx;
				speedY=sy;
			}			


			var anim=this.currentAnimId;
			var dx=0,dy=0 , dir=anim.charAt(anim.length-1)
			if (speedX||speedY){
				walk=true;
				dx=speedX;
				dy=speedY;

				var rad=Math.atan2(dy, dx);	
				rotationTarget=rad*TS.CONST.RAD_TO_DEG;
				// console.log(rotationTarget);
				changed=true;

				dir=TS.getEighth(dx,dy);
			}
			
			this.walk=walk;
			
			var newAnim=(walk?"move_":"stand_")+dir;
			this.changeAnim(newAnim)

			
			if (changed){
				this.rotationTarget=rotationTarget ;
			}
		},
		render : function(context,deltaTime){
			var scene=game.currentScene;
			
			var pos=scene.getViewPos(this.x, this.y);

	 		var img=this.img;
	 		if (this.dead){
	 			// context.globalAlpha=0.3;
	 		}

	 		if (this.currentAnim){
				var f=this.currentAnim.currentFrame;
				var img=this.currentAnim.img;
				var iX=f.x , iY=f.y, iW=f.w, iH=f.h , w=f.w, h=f.h ;

				context.drawImage(img,iX,iY,iW,iH, pos[0]-65,pos[1]-105, w, h);

			}

	 		// context.drawImage(img, 0,0,36,72 , 
	 		// 	pos[0]-18,
	 		// 	pos[1]-72,
	 		// 	36,72);
 			
 			context.globalAlpha=1;
 			// var aabb=this.actionAABB;
 			// pos=Game.getViewPos(this.actionAABB[0], this.actionAABB[1] );
 			// context.strokeStyle="red"
 			// context.strokeRect(pos[0],pos[1],this.actionRadius, this.actionRadius)


		}
	}

	var PPT=TS.SpriteBase.prototype;
	for (var p in PPT){

		Player.prototype[p]=PPT[p];
	}


}(this));