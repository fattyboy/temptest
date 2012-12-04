

window.devicePixelRatio=window.devicePixelRatio||1;
TS.setViewportScale(1/window.devicePixelRatio);

;(function(scope,undefined){

	 var game=scope.game=new TS.Game({

		width : Config.WIDTH ,
		height : Config.HEIGHT ,
		FPS : Config.FPS ,

		container : "container" ,
		
		resList : [	
			{ id : "stand" , src : "./res/stand.png" },
			{ id : "player" , src : "./res/player.png" },
			{ id : "guard" , src : "./res/guard.png" },
			{ id : "map" , src : "./res/map.png" },
			{ id : "wall" , src : "./res/wall.png" }
		],

		beforeLoad : function(){

		},

		onLoading : function(loadedCount,totalCount,res){
			//return 50;
		},

		onLoad : function(loadedCount,totalCount){
			var Me=this;
			setTimeout(function(){
				Me.ready();
			},10);
			
		},
		onInit : function(){

		},
		onReady : function(){
			this.start();

			// this.setZoom(0.75);
		},
		afterLoop : function(deltaTime){
			player.handleInput(deltaTime);
		},

		initEvent : function(){



			document.addEventListener("keydown",function(evt){
					TS.KeyState[evt.keyCode]=true;
				},true);
			document.addEventListener("keyup",function(evt){
					TS.KeyState[evt.keyCode]=false;
				},true);
			
			initToucher();
			initJoystick();
			return ;

			var Me=this;
			TS.addEvent( this.container , "click", function(evt){
				var x= evt.pageX- game.pos.left;
				var y= evt.pageY- game.pos.top;
				x/=Me.zoom;
				y/=Me.zoom;

				if (Me.currentScene){
					var scene=Me.currentScene;
					var map=scene.map;
					var finder=scene.finder;
					x+=map.x;
					y+=map.y;
					var node=finder.getNodeByPos(x,y);
					if (node){
						console.log("click" , node.id)
					}
					var node=scene.getNodeByPos(x,y);
					if (node){

						var player=scene.player;

						if(!player.moving && !player.toNode && player.currentNode!=node){
							player.toNode=node;
							
							game.rest.get('/api/goto/'+player.toNode.id, function(err,data,res){
								
								if (!err){
									game.hideQuickBar();
									var path = finder.search(player.currentNode, player.toNode);
									player.setPath(path);
								}else{
									console.log("goto",err);
								}
							});

							
						}
					}

				}
				// alert([x,y])
			});

			createController(this);
		},

		clear : function(){
			this.context.clearRect(0,0,this.viewWidth, this.viewHeight);

		},
		getSceneInstance : function(idx,data){

			var scene= new TS.GameScene( 
					SceneConfig[idx](data) 
				);


				
			return scene;
		}

	});

}(this));

function showSize(){

	console.log("inner "+window.innerWidth+", "+window.innerHeight);
	console.log("screen "+window.screen.width+", "+window.screen.height);
	console.log("screen avail "+window.screen.availWidth+", "+window.screen.availHeight);
	if (document.body){
		console.log("body client "+document.body.clientWidth+", "+document.body.clientHeight);
		console.log("body offset "+document.body.offsetWidth+", "+document.body.offsetHeight);

	}
	//console.log("body "+document.body.scrollWidth+", "+document.body.scrollHeight);
	console.log("================")

}

// showSize();

TS.addEvent(window, "load", function(){

		
	game.init();

	game.load();

	setTimeout(function(){

		// showSize();

		showFPS(game);
	},10)
});


function showFPS(game){	

	if (game==null){
		return;
	}
	if (game.logger==null){
		game.logger={ frameCount : 0 };
	}

	if (!Config.displayFPS){
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
