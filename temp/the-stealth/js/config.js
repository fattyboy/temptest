
var Config ={

	FPS : 30 ,

	displayFPS : !true ,

	WIDTH : 800 ,
	HEIGHT : 460 ,

	SCALE_X : 1, 
	SCALE_Y : 0.5, 
	ROTATION : Math.PI/4 ,

	tileWidth : 72 ,
	tileHeight : 36 

}

Config.tileSize = Config.tileWidth/Math.SQRT2; ;
Config.TRANSLATE_X = Config.WIDTH/2 ;
Config.TRANSLATE_Y = 0 ;

Config.R_COS=Math.cos(Config.ROTATION);
Config.R_SIN=Math.sin(Config.ROTATION);
Config.SCALE_Z=Math.sin(Math.PI/3);
// 1.732  ctg(30);

var Demo ={

	0 : function(_game){
		var g=_game||game;

		document.body.style.backgroundColor="#fff";
		g.container.style.webkitTransform="scale(0.3,0.3)"
		g.container.style.overflow="visible";

		g.viewport.style.overflow="visible";
		g.canvas.style.display="none";

		g.canvas.style.border="4px solid red";
		var ground=g.currentScene.ground;		
		ground.pieceList.forEach(function(c){
			c.style.display="none";
			c.style.border="4px solid blue";
		});

	},


	1 : function(_game){
		var g=_game||game;
		var idx=0;
		var ground=g.currentScene.ground;
		var num=ground.pieceList.length;
		function _showCanvas(){

			ground.pieceList[idx++].style.display="block";
			if (idx<num){
				setTimeout(_showCanvas,500)
			}
		}
		_showCanvas();

	},

	2 : function(_game){
		var g=_game||game;
		g.canvas.style.display="block";
	},


	"2.1" : function(_game){
		var g=_game||game;
		var ground=g.currentScene.ground;		
		ground.pieceList.forEach(function(c){
			c.style.display="none";
		});	

	},

	"2.2" : function(_game){
		var g=_game||game;
		var ground=g.currentScene.ground;		
		ground.pieceList.forEach(function(c){
			c.style.display="block";
		});	

	},

	3 : function(_game){
		var g=_game||game;
		g.container.style.overflow="hidden";
		g.viewport.style.overflow="hidden";

		g.canvas.style.border="0px solid red";
		var ground=g.currentScene.ground;		
		ground.pieceList.forEach(function(c){
			c.style.border="0px solid blue";
		});

	},

	4 : function(_game){
		var g=_game||game;

		document.body.style.backgroundColor="#111";
		g.container.style.webkitTransform="scale(1,1)"
	}

}

// var Config ={
// 	TRANSLATE_X : 0, 
// 	TRANSLATE_Y : 0 , 
// 	SCALE_X : 1,
// 	SCALE_Y : 1,
// 	ROTATION : 0 
// }


