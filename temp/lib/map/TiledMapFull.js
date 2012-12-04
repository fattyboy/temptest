
var TiledMapFull=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}	

}

TiledMapBase.inherit( TiledMapFull , 

{

	translateCanvas : true ,
	needClear : false ,

	initCanvas : function(){	
	
		this.initCanvasSize();

		var canvasInfo=this.initCanvasInfo(this.canvas, this.translateCanvas?this.container:null );
		this.canvas=canvasInfo[0];
		this.context2d=canvasInfo[1];

		this.redrawAll();

		if (!this.translateCanvas){
			var cw=this.canvasWidth;
			var ch=this.canvasHeight;
			this.canvasWidth=this.viewWidth;
			this.canvasHeight=this.viewHeight;
			
			canvasInfo=this.initCanvasInfo(this.targetCanvas, this.container);
			this.targetCanvas=canvasInfo[0];
			this.targetContext2d=canvasInfo[1];

			this.canvasWidth=cw;
			this.canvasHeight=ch;

		}	
	},
	initCanvasSize : function(){

		this.canvasTileCols=this.mapCols;
		this.canvasTileRows=this.mapRows;
		this.canvasWidth=this.canvasTileCols*this.tileWidth;
		this.canvasHeight=this.canvasTileRows*this.tileHeight;
	},

	draw  : function(){
		if (!this.visible){
			return;
		}		

		if (this.scrolled || this.forceScroll){

			if (this.needClear){
				this.clearAll();
				if (this.translateCanvas){
					this.redrawAll();
				}
			}
						
			this.updateCanvas();
			this.drawCanvas();
			

			this.scrolled=false;
			this.forceScroll=false;
		}
		
	},

	redrawAll : function(){
		this.drawRegion(0, 0, 
			this.canvasTileCols, 
			this.canvasTileRows );		
	},

	updateCanvas : function(){},
	
	clearAll : function(){
		if (this.translateCanvas){
			this.context2d.clearRect(0,0,this.canvasWidth,this.canvasHeight);			
		}else{
			this.targetContext2d.clearRect(0,0,this.viewWidth,this.viewHeight);
		}
	},

	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		return {
			x : this.tileWidth  * cINc ,
			y : this.tileHeight * rINc 
		};	
	},


	drawCanvas : function(context , deltaTime) {	
		
		if (this.translateCanvas){
			this.setDomPos( this.canvas , -(this.x+this.originX), -(this.y+this.originY) ) ;
		}else{
			this.targetContext2d.drawImage(this.canvas , -(this.x+this.originX), -(this.y+this.originY) );			
		}

	}

		
}


);







