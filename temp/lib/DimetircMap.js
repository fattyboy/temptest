
function DimetircMap(cfg){
	for (var property in cfg ){
		this[property]=cfg[property];
	}
}

DimetircMap.prototype={

	constructor : DimetircMap ,

	mapData : null,
	mapDataInfo : null,

	tileWidth : 72,
	tileHeight : 36,
	tileOffsetX : 0,
	tileOffsetY : 0,

	x : 0,
	y : 0,
	col : 0,
	row : 0,
	offsetX : 0,
	offsetY : 0,
	
	viewWidth : 0,
	viewHeight : 0,
	viewScaleY : null,
	viewRotation : Math.PI/4,
	viewX : 0,
	viewY : 0,
	viewCol : 0,
	viewRow : 0,
	viewCols : 0,
	viewRows : 0,

	repeatX : false,
	repeatY : false,

	init : function(scene){
		this.scene=scene;
		this.viewWidth=scene.viewWidth;
		this.viewHeight=scene.viewHeight;

		this.halfTileWidth=this.tileWidth/2;
		this.halfTileHeight=this.tileHeight/2;
		this.tileSide=Math.sqrt( Math.pow(this.halfTileWidth,2) + Math.pow(this.halfTileHeight,2) );
				
		this.viewScaleY=this.viewScaleY||this.tileHeight/this.tileWidth;
		this.viewScaleZ=Math.sqrt(1-this.viewScaleY*this.viewScaleY);

		this.viewCols=Math.ceil(this.viewWidth/this.tileWidth)+2;
		this.viewRows=Math.ceil(this.viewHeight/this.halfTileHeight)+2;

		this.cos=Math.cos(this.viewRotation);
		this.sin=Math.sin(this.viewRotation);


		this.mapDataCols=this.mapDataCols||1;
		this.mapData= (this.mapData[0]&&this.mapData[0].length>0)?this.mapData
							:this.arrTo2dArr(this.mapData, this.mapDataCols);
		this.mapDataCols=this.mapData[0].length;
		this.mapDataRows = this.mapData.length || 0;
		
		this.mapCols=this.mapCols||this.mapDataCols;
		this.mapRows=this.mapRows||this.mapDataRows;

		this.mapWidth = (this.mapCols+this.mapRows) * this.halfTileWidth;
		this.mapHeight = (this.mapCols+this.mapRows) * this.halfTileHeight;


		if (this.repeatX){
			this.getNewCol=this.getNewColCircle;
		}else{
			if (this.mapWidth<this.viewWidth){
				this.viewWidth=this.mapWidth;
			}
		}
		if (this.repeatY){
			this.getNewRow=this.getNewRowCircle;
		}else{
			if (this.mapHeight<this.viewHeight){
				this.viewHeight=this.mapHeight;
			}			
		}	
	
		
		this.initMapDataInfo();

		this.createTileImg();


	},


	initMapDataInfo : function(){

		this.mapDataInfo=[];
		for ( var r = 0; r < this.mapDataRows; r++) {

			this.mapDataInfo[r] = [];

			for ( var c = 0; c < this.mapDataCols; c++) {
				var no = this.mapData[r][c];
				var tile=this.createTile(c,r,no);
				this.mapDataInfo[r][c]=this.initTile(tile)||tile;
			}

		}
	},

	createTile : function(c,r,no){
		return {
			no : no	,
			col : c ,
			row : r
		};
	},

	initTile : function(tile){

		return tile;
	},


	createTileImg :function(){
		this.tiles=[null];
		this.imgTileWidth=this.imgTileWidth||this.tileWidth;
		this.imgTileHeight=this.imgTileHeight||this.tileHeight;
		var map=ResourcePool.get("map");
		for (var i=1;i<=4;i++){
			var canvas=document.createElement("canvas");
			canvas.width=this.tileWidth;
			canvas.height=this.tileHeight;
			var ctx=canvas.getContext("2d");
			this.tiles.push(canvas);

			ctx.drawImage(map,
				(i+1)*this.imgTileWidth,4*this.imgTileHeight,
				this.imgTileWidth,this.imgTileHeight,
				0,0,this.tileWidth,this.tileHeight
			);
			// ctx.beginPath();
			// ctx.moveTo(this.tileWidth/2,0);
			// ctx.lineTo(this.tileWidth, this.tileHeight/2);
			// ctx.lineTo(this.tileWidth/2,this.tileHeight);
			// ctx.lineTo(0,this.tileHeight/2);
			// ctx.lineTo(this.tileWidth/2,0);
			// ctx.stroke();
			// ctx.closePath();
		}
		
	},

	mapToView : function(x,y,z){
		var vx=x*this.cos-y*this.sin;
		var vy=x*this.sin+y*this.cos;
		vy=vy*this.viewScaleY;
		var vz=z?z*this.viewScaleZ:0;
		return [vx, vy-vz];
	},

	viewToMap : function(vx,vy){
		vx=vx;
		vy=vy/this.viewScaleY;
		var x=vx*this.cos+vy*this.sin;
		var y=-vx*this.sin+vy*this.cos;
		return [x,y];
	},

	setViewPos : function(vx,vy){
		this.viewX=vx;
		this.viewY=vy;

		this.viewCol=Math.floor( this.viewX/this.tileWidth );
		this.viewRow=Math.floor( this.viewY/this.halfTileHeight );

		// this.tileOffsetX= this.viewX%this.tileWidth;
		// this.tileOffsetY= this.viewY%this.halfTileHeight;
		this.tileOffsetX= this.viewX-( this.viewCol * this.tileWidth);
		this.tileOffsetY= this.viewY-( this.viewRow * this.halfTileHeight);

	},

	getMapPos : function(){
		var ix=this.y+this.x*this.this.viewScaleY;
		var iy=this.y-this.x*this.this.viewScaleY;
		return [ix, iy];
	},

	setMapPos : function(x,y,force){
		var vx=x-y;
		var vy=(x+y)*this.this.viewScaleY;
		this.setViewPos(vx,vy,force);
	},

	// mapTile To mapPx
	mapTileToMapPx : function(c ,r){
		var x = (c-r-1)*this.halfTileWidth  ;
		var y = (c+r)*this.halfTileHeight ;
	
		return {
			x : x + this.offsetX,
			y : y + this.offsetY
		};
	},

	// mapPx To mapTile
	mapPxToMapTile : function(x,y){
		var c= Math.floor( (y/this.viewScaleY + x )/this.tileWidth );
		var r= Math.floor( (y - x*this.viewScaleY )/this.tileHeight ) ;			
		return {
			col : c,
			row : r
		};
	},

	render : function(context){

		var mapData=this.mapData;
		var count=0;
		var rr=this.viewRow-1;
		context.fillStyle="red";
		// context.font="42px,Arial";
		for (var r=-1;r<this.viewRows-1;r++){
			var cc=this.viewCol;
			for (var c=0;c<this.viewCols;c++){
				var dataCol=Math.ceil( (cc*2+rr)/2 );
				var dataRow = rr-dataCol;
				var n=this.mapData[dataRow]?this.mapData[dataRow][dataCol]:0;
				if (n){
					count++;
					var x=c*this.tileWidth+(rr%2)*this.halfTileWidth;
					var y=r*this.halfTileHeight;
					var xx=x-this.tileOffsetX-this.halfTileWidth;
					var yy=y-this.tileOffsetY;

					context.drawImage(this.tiles[n],xx,yy);
//					context.fillText(dataRow+","+dataCol, xx+30,yy+10);
				}

				cc++;
			}
			rr++;			
		}

		if (count!==this.renderedCount){
			console.log("renderedCount : "+count);
			this.renderedCount=count;
		}

	},


	getTileInfoByPx : function(x, y) {

		var f = this.mapPxToMapTile(x, y);

		return f ? this.getTileInfo(f.col, f.row) : null;

	},


	getTileInfo : function(c, r) {
		r=this.mapDataInfo[r];
		return r?r[c]:null;		
	},

	getNewColCircle : function(c){
		var _c = c % this.mapDataCols;
		return _c<0?this.mapDataCols+_c:_c;		
	},
	getNewRowCircle : function(r){
		var _r = r % this.mapDataRows;
		return _r<0?this.mapDataRows+_r:_r;		
	},

	getNewCol : function(c){
		return c<0||c>=this.mapDataCols?null:c;		
	},
	getNewRow : function(r){
		return r<0||r>=this.mapDataRows?null:r;		
	},

	reset : function(){
		this.init(this.game);
	},

	destroy : function(){
		this.game=null;
		this.mapDataInfo=null;
		this.mapData=null;
	},

	arrTo2dArr : function(arr, cols){
			cols = cols||1;
			var mapData2=[];
			var rows= Math.floor( (arr.length+cols)/cols ) -1 ;
			var r=0,c=0,i=0;
			for ( r = 0; r < rows; r++) {
				mapData2[r] = [];
				for ( c = 0; c < cols; c++) {
					mapData2[r][c]=arr[i++];
				}
			}
			return mapData2;
	}

}

