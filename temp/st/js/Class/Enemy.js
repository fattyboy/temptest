
;(function(scope,undefined){

	var Enemy=scope.Enemy=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	Enemy.prototype={
		constructor : Enemy,

		view : null,

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
		speedR : 0.3 ,

		anims : null,
		defaultAnimId : null,
		currentAnim : null,	
		currentAnimId : null,


	radius : 14 ,
	actionRadius : 20,

		actionQ : null ,

		init : function(){
			



			this.last={
				vx : 0,
				vy : 0,
				ax : 0,
				ay : 0,
				dx : 0,
				dy : 0
			};

			this.aabb=[];
			
			this.anims={
				"stand_0" :{
						img : "stand",												
						frames : getFrames(5,1,2)
					},
				"stand_1" :{	
						img : "stand",								
						frames : getFrames(6,1,2)
					},
				"stand_2" :{
						img : "stand",												
						frames : getFrames(7,1,2)
					},
				"stand_3" :{	
						img : "stand",											
						frames : getFrames(0,1,2)
					},

				"stand_4" :{	
						img : "stand",											
						frames : getFrames(1,1,2)
					},

				"stand_5" :{	
						img : "stand",											
						frames : getFrames(2,1,2)
					},

				"stand_6" :{	
						img : "stand",											
						frames : getFrames(3,1,2)
					},

				"stand_7" :{	
						img : "stand",											
						frames : getFrames(4,1,2)
					},



				"move_0" :{	
						img : "guard",											
						frames : getFrames(5)
					},
				"move_1" :{	
						img : "guard",											
						frames : getFrames(6)
					},
				"move_2" :{
						img : "guard",												
						frames : getFrames(7)
					},
				"move_3" :{	
						img : "guard",											
						frames : getFrames(0)
					},
				"move_4" :{	
						img : "guard",											
						frames : getFrames(1)
					},
				"move_5" :{	
						img : "guard",											
						frames : getFrames(2)
					},
				"move_6" :{	
						img : "guard",											
						frames : getFrames(3)
					},
				"move_7" :{	
						img : "guard",											
						frames : getFrames(4)
					}

			};
			this.actionQ.start();
			this.initAnims();
			this.viewfield=new ViewTriangle({
					x : this.x ,
					y : this.y ,
					radius : this.viewRadius,
					angle : this.viewAngle
			});
			
			this.setRotation(this.rotation);
			this.updateAABB();
			
			this.viewfield.init();

		},


		updateTarget : function(){
			var pos=this.actionQ.currentAction;
			var x=pos[0],
				y=pos[1];
			this.updateVelocity(x, y);
			this.moving=true;
		},

		stop : function(){
			this.vx=this.vy=0;

		},
		setRotation : function(deg){
			this.rotation=deg;
			this.rotationTarget=deg;
			var rad=this.rotation*TS.CONST.DEG_TO_RAD;
			this.viewfield.setRotation(rad);
		},

		update : function(deltaTime){

			if (this.dead){
				return;
			}

			this.lastX=this.x;
			this.lastY=this.y;

			this.updateMotion(deltaTime);
			this.actionQ.update(this);
			this.updateRotation(deltaTime);	
			this.updateAABB();
			
			this.viewfield.setPos(this.x,this.y);
			this.viewfield.update();

			this.updateAnim(deltaTime);

			var anim=this.currentAnimId;
			var dir=anim.charAt(anim.length-1);
			var walk=false;
			if (this.dx||this.dy){
				walk=true;
				dir=TS.getEighth(this.dx,this.dy);
			}

			var newAnim=(walk?"move_":"stand_")+dir;
			if (anim!==newAnim){
				this.setAnim(newAnim)
			}
		},

		updateRotation : function(deltaTime){

			this.lastRotation=this.rotation;

			var deltaR =this.speedR * deltaTime;
			this.rotationTarget=Math.atan2(this.vy,this.vx)*TS.CONST.RAD_TO_DEG;

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
			//if (this.lastRotation!=this.rotation){
				var rad=this.rotation*TS.CONST.DEG_TO_RAD;
				this.viewfield.setRotation(rad);
			//}

		},

		canSee : function(x,y){
			var canSee=this.viewfield.containPoint(x,y);
			if (canSee){
				this.viewfield.tryUpdateVisibleEdge(blocks);
				return this.viewfield.canSee(x,y);
			}
			return false;
		},

		killed : function(){
			this.dead=true;
			this.static=true;
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

		updateVelocity : function(targetX, targetY){
			var dx=targetX-this.x;
			var dy=targetY-this.y;


			var rad=Math.atan2( dy , dx );
			var vx= this.speed * Math.cos(rad);
			var vy= this.speed * Math.sin(rad);
			this.vx=vx;
			this.vy=vy;

		},

		setPos : function(x,y){
			this.x=x;
			this.y=y;
		},

		updatePos : function(){
			this.x+=this.dx;
			this.y+=this.dy;
		},

		updateAABB : function(){
			var r=this.radius;
			this.aabb[0]=this.x-r;
			this.aabb[1]=this.y-r;
			this.aabb[2]=this.x+r;
			this.aabb[3]=this.y+r;
		},

		renderView : function(context,deltaTime){

			var ps=this.viewfield.updateField(blocks);
			var gradient=context.createRadialGradient(
				ps[0][0],ps[0][1],200 ,
				ps[0][0],ps[0][1],this.viewRadius 
			);
			var color;
			if (this.look){
				gradient.addColorStop(0, "rgba(255,170,150,0.4)");    //定义红色渐变色
				gradient.addColorStop(0.5, "rgba(255,170,150,0.3)");    //定义红色渐变色
				gradient.addColorStop(1, "rgba(255,170,150,0.0)");

				color="rgba(255,170,150,0.4)"
			}else{
				gradient.addColorStop(0, "rgba(160,255,180,0.4)");    //定义红色渐变色
				gradient.addColorStop(0.5, "rgba(160,255,180,0.3)");    //定义红色渐变色
				gradient.addColorStop(1, "rgba(160,255,180,0.0)");

				color="rgba(160,255,180,0.4)"
			}
			color=gradient;

			drawView(context,ps,color,true);
		},

		render : function(context,deltaTime){
			var scene=game.currentScene;
		 	var pos=scene.getViewPos(this.x,this.y);
	 		var img=TS.ResPool.getRes("guard");


				var f=this.currentAnim.currentFrame;
				var img=this.currentAnim.img;
				var iX=f.x , iY=f.y, iW=f.w, iH=f.h , w=f.w, h=f.h ;

				// console.log(img,iX,iY,iW,iH)
				context.drawImage(img,iX,iY,iW,iH, pos[0]-65,pos[1]-105, w, h);

return;

			if (this.dead){
				context.drawImage(img, 36,0,36,30 , 
	 			pos[0]-18,
	 			pos[1]-30,
	 			36,30);
				return;
			}
	 		context.drawImage(img, 36,0,36,72 , 
	 			pos[0]-18,
	 			pos[1]-72,
	 			36,72);
		}

	}


	var PPT=TS.SpriteBase.prototype;
	for (var p in PPT){

		Enemy.prototype[p]=PPT[p];
	}

}(this));