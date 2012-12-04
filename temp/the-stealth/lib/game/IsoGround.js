
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};

	var IsoGround=ns.IsoGround=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	IsoGround.prototype={
		constructor : IsoGround,

		x : 0,
		y : 0,

		tileWidth : 64 ,
		tileHeight : 64 ,
		mapCols : 10,
		mapRows : 10,

		pieceRow : 4 , 
		pieceCol : 4 , 

		container : null ,
		mapData : null ,


		offsetX : 0,
		offsetY : 0,

		setPos : function(x,y){
			var dom=this.box;
			dom.style.webkitTransform="translate3d("+x+"px,"+y+"px,0px)";
			// dom.style.left=x+"px"; dom.style.top=y+"px";	
			// dom.style.OTransform="translate("+x+"px,"+y+"px)";
			// dom.style.OTransform="translate3d("+x+"px,"+y+"px,0px)";
			
			//dom.style.webkitTransform="translate("+x+"px,"+y+"px)";

		},

		init : function(){
			this.width=(this.mapRows+this.mapCols)*this.tileWidth;
			this.height=(this.mapRows+this.mapCols)*this.tileHeight;

			this.box=document.createElement("div");
			this.container.appendChild(this.box);		
			var domStyle=this.box.style;

			domStyle.position="absolute";
			domStyle.overflow="hidden";	
			domStyle.padding="0px";
			domStyle.width=this.width+"px";
			domStyle.height=this.height+"px";
			domStyle.zIndex=2;
			domStyle.left="0px";
			domStyle.top="0px";

			var tRow=this.mapRows/this.pieceRow, tCol=this.mapCols/this.pieceCol;
			this.pieceList=[];
			for (var i=tRow*tCol-1;i>=0;i--){
				var canvas=document.createElement("canvas");
				canvas.style.position="absolute";						
				this.pieceList.push(canvas);
			}

		},

		update : function(deltaTime){


		},

		render : function(context , deltaTime ){

		},

		renderAll : function(){
			var tRow=this.mapRows/this.pieceRow, tCol=this.mapCols/this.pieceCol;

			var tWidth=Math.ceil( (tRow+tCol)*this.tileWidth/2 );
			var tHeight=Math.ceil( (tRow+tCol)*this.tileHeight/2 );
			var tStartX=tWidth/2*(this.pieceRow-1);
			var idx=0;

			for (var r=0;r<this.pieceRow;r++){
				for (var c=0;c<this.pieceCol;c++){
						var canvas=this.pieceList[idx];
						canvas.width=tWidth;
						canvas.height=tHeight;
						canvas.style.left= (tStartX+(c-r)*tWidth/2) +"px";
						canvas.style.top=((c+r)*tHeight/2)+"px";
						var context=canvas.getContext("2d");
						this.box.appendChild(canvas);
						drawPiece(context,this, r,c);
						idx++;
				}
			}

			function drawPiece(context,ground, sr,sc){

				var startR=sr*tRow;
				var startC=sc*tCol;
				var startX=ground.tileWidth/2*(tRow-1);
				for (var r=startR;r<startR+tRow;r++){
					for (var c=startC;c<startC+tCol;c++){
						var no=ground.mapData[ ground.mapCols*r+c]-1;
						var ic=(no % 7) *ground.tileWidth;
						var ir=Math.floor(no/7) * ground.tileHeight;
						context.drawImage(ground.img, ic,ir,ground.tileWidth, ground.tileHeight ,
								startX+(c-startC-r+startR)*ground.tileWidth/2,
								(c+r-startR-startC)*ground.tileHeight/2,
								// 220,220,
								ground.tileWidth, ground.tileHeight
							)
					}
				}
			}
		}

	};


}( typeof exports!="undefined"?exports:this ));


