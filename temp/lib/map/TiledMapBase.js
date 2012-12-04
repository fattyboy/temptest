
var TiledMapBase=function(cfg){
	for ( var key in cfg) {
		this[key] = cfg[key];
	}
};

AbstractTiledMap.inherit( TiledMapBase , {
	
	viewWidth : null,
	viewHeight : null,
	
	tileImg : null,
	tileImgData : null,
	
	tileImgCols : 0,
	tileImgRows : 0,
	tileOffsetX : 0,
	tileOffsetY : 0,


	startTileIndex : 1,
	cleanTiles : null,
	emptyTile : null,
	emptyTileInfo : null,
	
	x : 0,
	y : 0,
	col : 0,
	row : 0,
	viewCol : 0,
	viewRow : 0,
	
	minX : null,
	minY : null,
	maxX : null,
	maxY : null,

	offsetX : 0,
	offsetY : 0,

	pixelRatio : null,

	useImgData : false ,
	filterAlpha : false,
	scrollScaleX : 1,
	scrollScaleY : 1,
	displayable : true ,

	zIndex : 1 ,

	visible : true ,
	needClear : false ,
	useRes2X : false ,

	originX : 0,
	originY : 0, 
	init : function(parent){

		var game=this.findGame(parent);

		this.imgCache=this.imgCache||{};
		if (typeof this.tileImg == "string"){
			this.tileImg=this.imgCache[this.tileImg];
			//this.imgCache=null;
		}
		this.displayable=!!this.tileImg;
		
		this.pixelRatio=this.pixelRatio||game.pixelRatio||1;
		this.container=this.container||game.viewport;
		this.viewWidth=this.viewWidth||game.viewWidth||game.width;
		this.viewHeight=this.viewHeight||game.viewHeight||game.height;


		if (this.beforeInit!=null && this.beforeInit(game)===false){
			return false;
		}	

		TiledMapBase.$superclass.init.call(this, parent);


		if(this.onInit!=null){
			this.onInit();
		}
		
		this.setViewPos(this.x,this.y,true);
	},


	initMap : function(){
		
		this.initMapData();

		this.initMapSize();

		if (this.displayable) {
			this.initImgDataInfo();
		}

		this.initMapDataInfo();

				
		if (this.displayable){
			this.initCanvas();
		}

	},


	initMapSize : function(){

		this.mapWidth = this.mapCols * this.tileWidth;
		this.mapHeight = this.mapRows * this.tileHeight;

		if (this.mapWidth<this.viewWidth){
			if (!this.repeatX){
				this.viewWidth=this.mapWidth;
			}	
		}
		if (this.mapHeight<this.viewHeight){
			if (!this.repeatY){
				this.viewHeight=this.mapHeight;
			}	
		}

		this.viewTileCols=Math.ceil(this.viewWidth/this.tileWidth)+1;
		this.viewTileRows=Math.ceil(this.viewHeight/this.tileHeight)+1;

		if (this.mapCols < this.viewTileCols){
			this.viewTileCols=this.mapCols;
		}
		if (this.mapRows < this.viewTileRows){
			this.viewTileRows=this.mapRows;
		}		
	},

	initImgDataInfo : function(){
		
		this.imgSrc=this.tileImg.src;
		this.tileImgData={};
		
		this.tileImgCols = Math.floor(this.tileImg.width / this.tileWidth);
		this.tileImgRows = Math.floor(this.tileImg.height / this.tileHeight);
		this.maxImgNo=this.tileImgRows*this.tileImgCols-1+this.startTileIndex;

		if (this.useImgData ){
			this.tmpCanvas=this.tmpCanvas||this.game.tmpCanvas;
			if (this.tmpCanvas==null){
				this.tmpCanvas=document.createElement("canvas");
				this.tmpCanvas.isOwn=true;
			}
			this.tmpCanvas.width=this.tileWidth;
			this.tmpCanvas.height=this.tileHeight;
			this.tmpContext2d=this.tmpCanvas.getContext("2d");
		}

	},

	initMapDataInfo : function(){

		this.minX=this.minX||0;
		this.minY=this.minY||0;
		this.maxX=this.maxX||this.mapWidth-this.viewWidth;
		this.maxY=this.maxY||this.mapHeight-this.viewHeight;

		this.cleanTiles=this.cleanTiles||[];
		if (this.emptyTile!=null){
			this.emptyTileInfo=this.createTile(null,null,this.emptyTile);
		}
				
		TiledMapBase.$superclass.initMapDataInfo.call(this);

	},

	createTile : function(c,r,no){

		var clean= no==null || this.cleanTiles==="ALL" ||this.cleanTiles.indexOf(no)!=-1 ;
		
		var imgNo=0,imgX=0,imgY=0;
		
		if (this.displayable && no<=this.maxImgNo) {
			imgNo= no-this.startTileIndex;
			imgX = (imgNo % this.tileImgCols) * this.tileWidth;
			imgY = Math.floor( imgNo / this.tileImgCols) * this.tileHeight;
				
			if (this.useImgData && !clean && this.tileImgData[imgNo]==null){
				this.tmpContext2d.drawImage(this.tileImg,
					imgX ,imgY ,this.tileWidth ,this.tileHeight ,
					0,0,this.tileWidth,this.tileHeight);
				
				if (this.filterAlpha){
					this.doFilterAlpha(this.tmpContext2d,this.tileWidth,this.tileHeight);
				}
				this.tileImgData[imgNo]=this.tmpContext2d.getImageData(0,0,this.tileWidth,this.tileHeight);
				this.tmpContext2d.clearRect(0,0,this.tmpCanvas.width,this.tmpCanvas.height);
			}
		}				
		return {
			no : no,
			col : c ,
			row : r ,
			clean : clean ,
			iX : imgX ,
			iY : imgY ,
			iNo : imgNo				
		};
	},

	initCanvasInfo : function(canvas,parentNode){	

		var _scale=this.pixelRatio*this.zoom;

		canvas=canvas||document.createElement("canvas");

		canvas.setAttribute("dom-flag","tiledmap-canvas"+(this.id?" "+this.id:""));						
		canvas.style.position="absolute";
		canvas.style.left=canvas.style.top="0px";
		canvas.style.zIndex = this.zIndex ;
		
		//canvas.style.border="1px solid red";

		canvas.x=canvas.y=0;
		canvas.width=this.canvasWidth;
		canvas.height=this.canvasHeight;
		canvas.style.width=this.canvasWidth*this._scale+"px";
		canvas.style.height=this.canvasHeight*this._scale+"px";

		var context2d=canvas.getContext("2d");
		context2d.font = "11px Arial";
		context2d.fillStyle = "black";
		context2d.textBaseline="top";

		if (this.contextCfg){

			for ( var key in this.contextCfg) {
				context2d[key] = this.contextCfg[key];
			}
		}

		if (parentNode){
			parentNode.appendChild(canvas);
		}

		return [canvas , context2d];
	},

	
//////////////////////////////
////////////////////
//////////////


	initCanvas : function(){	

		this.initCanvasSize();

			
		var canvasInfo=this.initCanvasInfo(this.canvas, this.container);
		this.canvas=canvasInfo[0];
		this.context2d=canvasInfo[1];

		
	},
	initCanvasSize : function(){
		this.canvasTileCols=this.viewTileCols;
		this.canvasTileRows=this.viewTileRows;
		this.canvasWidth=this.viewWidth;
		this.canvasHeight=this.viewHeight;
		
	},

	update : function(deltaTime){
		if (this.beforeUpdate!=null){
			this.beforeUpdate(deltaTime);
		}
		this.updateState();
		if (this.onUpdate!=null){
			this.onUpdate(deltaTime);
		}

	},
	updateState : function(){
		this.lastVisible=this.visible;
	},
	draw  : function(){
		if (!this.visible){
			return;
		}		

		if (this.scrolled || this.forceScroll){

			if (this.needClear){
				this.clearAll();
			}

			this.redrawAll();
			
			this.scrolled=false;
			this.forceScroll=false;
		}
		
	},


	getTileDrawPos : function(c, r, cINc, rINc, tileInfo){
		return {
			x : this.tileWidth  * cINc - this.tileOffsetX,
			y : this.tileHeight * rINc - this.tileOffsetY
		};	
	},

	clearAll : function(){
		this.context2d.clearRect(0,0,this.canvasWidth,this.canvasHeight);		
	},

	redrawAll : function(){
		this.drawRegion(this.col, this.row, 
			this.col+this.viewTileCols, 
			this.row+this.viewTileRows );		
	},

	drawRegion : function(fromCol, fromRow, toCol, toRow){

		var startColInCanvas=0 , startRowInCanvas=0;

		var _startColInCanvas , _startRowInCanvas;
		
		_startRowInCanvas = startRowInCanvas;
		for (var r=fromRow;r<toRow;r++){
			
			var _r = this.getNewRow(r);	
			if (_r==null){
				continue;
			}
			var rowInfo=this.mapDataInfo[_r];

			_startColInCanvas = startColInCanvas;
			for (var c=fromCol;c<toCol;c++){
			
				var _c = this.getNewCol(c);
				if (_c==null){
					continue;
				}
				var tileInfo = rowInfo[_c];

			
				var pos=this.drawTile( this.context2d, c, r, _startColInCanvas , _startRowInCanvas, tileInfo );	
				//this.context2d.strokeText( c+","+r,	pos.x+this.tileWidth/4, pos.y+this.tileHeight/4);

				_startColInCanvas= (++_startColInCanvas)%this.canvasTileCols;	
			}
			
			_startRowInCanvas=(++_startRowInCanvas)%this.canvasTileRows;	
			
		}

	},
	

//////////////////////////////
	getMapPos : function(){
		return this.getViewPos();
	},

	setMapPos : function(x,y,force){
		this.setViewPos(x,y,force);
	},
	
	scrollMapBy : function(dx,dy,force){
		var xy=this.getMapPos();
		var s=this.setMapPos(
				xy[0]+(dx||0)*this.scrollScaleX, 
				xy[1]+(dy||0)*this.scrollScaleY,
			force);
	},


	getViewPos : function(){
		return [ this.x, this.y ];
	},

	setViewPos : function(x,y,force){

		this.lastX=this.x;
		this.lastY=this.y;
		this.x = Math.max(this.minX,Math.min(this.maxX,x));
		this.y = Math.max(this.minY,Math.min(this.maxY,y));

		this.lastIntX=this.intX;
		this.lastIntY=this.intY;
		this.intX=Math.floor(this.x);
		this.intY=Math.floor(this.y);

		this.lastCol = this.col;
		this.lastRow = this.row;
		this.lastViewCol=this.viewCol;
		this.lastViewRow=this.viewRow;

		if (force || this.forceScroll){
			this.lastX=this.x-this.viewWidth;
			this.lastY=this.y-this.viewHeight;
			this.lastIntX=this.intX-this.viewWidth;
			this.lastIntY=this.intY-this.viewHeight;
			this.lastCol = this.col-this.viewTileCols;
			this.lastRow = this.row-this.viewTileRows;
			this.lastViewCol=this.viewCol-this.viewTileCols;
			this.lastViewRow=this.viewRow-this.viewTileRows;
			this.forceScroll=true;
			this.scrolled=true;

		}else{

			this.scrolled= this.lastIntX != this.intX || this.lastIntY != this.intY || false;

		}

		if (this.scrolled) {			
			
			this.scrolled=true;

			this.updateTilePosInfo();
			
			if (this.displayable && this.updateCanvasPosInfo){	
				this.updateCanvasPosInfo();
			}

			if (this.onScroll!=null){
				this.onScroll();
			}
		}

		return this.scrolled;	
	
	},		

	updateTilePosInfo : function(){
		this.col = Math.floor( this.intX / this.tileWidth );
		this.row = Math.floor( this.intY / this.tileHeight );

		this.tileOffsetX=(this.intX % this.tileWidth +this.tileWidth)%this.tileWidth;
		this.tileOffsetY=(this.intY % this.tileHeight +this.tileHeight)%this.tileHeight;
	
	},

	updateCanvasPosInfo : function(){

		
	},


	updateCanvasPos : function(context , deltaTime) {	


	},


//////////////////////////


	// viewPx 2 mapTile
	viewPx2mapTile : function(x,y){
		var pos=this.viewPx2mapPx(x,y);
		return this.mapPx2mapTile( pos.x , pos.y );
	},


	// viewPx 2 mapPx
	viewPx2mapPx : function(x,y){
		return {
				x : x+this.x+this.offsetX , 
				y : y+this.y+this.offsetY
			};
	},



///////////
///////////////////
////////////////////////////


	drawTile : function(context2d,c, r, cINc, rINc , tileInfo) {
		tileInfo=tileInfo || this.emptyTileInfo ;

		var pos=this.getTileDrawPos(c, r, cINc, rINc , tileInfo);
		//console.log(pos.x,pos.y)
		if (tileInfo){
			if (!this.needClear && tileInfo.clean ) {	
				context2d.clearRect( pos.x, pos.y, 
						this.tileWidth, this.tileHeight);
			}
			if (tileInfo.no>=this.startTileIndex){
				var imgData=this.tileImgData[tileInfo.iNo];	
				if (imgData!=null){
					context2d.putImageData(imgData, pos.x, pos.y );
				}else{
					context2d.drawImage(this.tileImg,
						tileInfo.iX, tileInfo.iY,
						this.tileWidth, this.tileHeight,
						pos.x, pos.y, 
						this.tileWidth, this.tileHeight);

				}
			}
		}
		return pos;
	},


	scrollViewBy : function(dx,dy,force){
		var s=this.setViewPos(
				this.x+(dx||0)*this.scrollScaleX, 
				this.y+(dy||0)*this.scrollScaleY,
				force);
	},

	refreshTile : function(c, r, info) {
		if (info!=null){
			var _info = this.mapDataInfo[r][c];
			for (var key in info){
				_info[key]=info[key];
			}
		}
		if (this.displayable){
			this.drawRegion(c,r,c+1,r+1);
		}
	},


	destroy : function(){
		var game=this.game;

		TiledMapBase.$superclass.destroy.call(this);

		this.container=null;
		this.tileImg=null;
		this.tileImgData=null;

		if (this.displayable){		
			var gcDiv=document.createElement("div");
			gcDiv.style.display="none";
			
			if (this.tmpCanvas.isOwn){
				this.removeDom(this.tmpCanvas, gcDiv);
			}
			this.tmpCanvas=null;
			this.tmpContext2d=null;

			document.body.appendChild(gcDiv);
			gcDiv.parentNode.removeChild(gcDiv);
		}
	},

	removeDom : function(dom, gcDiv){
		if (gcDiv==null){
			gcDiv=document.createElement("div");
			gcDiv.style.display="none";
		}
		gcDiv.appendChild(dom);
		dom.parentNode.removeChild(dom);
	},

	
	doFilterAlpha : function(imageData, w, h) {
		var flag=96;//128;
		imageData=imageData.getImageData?imageData.getImageData(0, 0, w, h):imageData;
	    var dataArray = imageData.data;
	    var dataWidth=imageData.width,
	    	dataHeight=imageData.height,
	   		len=dataArray.length;
	    for (var y = 0; y < h; y++) {
	      for (var x = 0; x < w; x++) {
	         var index = (y * w + x) << 2;
			 var alpha= dataArray[index + 3];
	         dataArray[index + 3] = alpha > flag ? 255 : 0;
	      }
	    }
	    context.putImageData(imageData, 0, 0);
	  },

	
	setDomPos : function(dom , x,y){
	
		//dom.style.left="0px"; dom.style.top="0px";

		//dom.style.left=x+"px"; dom.style.top=y+"px";	
		
		//dom.style.webkitTransform="translate("+x+"px,"+y+"px)";
		dom.style.webkitTransform="translate3d("+x+"px,"+y+"px,0px)";
	}
		
} );







