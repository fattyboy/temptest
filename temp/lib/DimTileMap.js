
var DimTileMap=function(cfg){
    for ( var key in cfg) {
        this[key] = cfg[key];
    }
};

(function(){

var proto={
    
    constructor : DimTileMap,

    halfTileWidth: null,
    halfTileHeight: null,

    viewScaleY: null,
    viewScaleZ : null,
    viewRotation: Math.PI / 4,


    init: function(scene) {
        this.scene = scene;

        this.oViewWidth=scene.viewWidth;
        this.oViewHeight=scene.viewHeight;
        
        this.initDataInfo();

        this.halfTileWidth = this.tileWidth / 2;
        this.halfTileHeight = this.tileHeight / 2;
        this.viewScaleY = this.viewScaleY || this.tileHeight / this.tileWidth;
        this.viewScaleZ = Math.sqrt(1 - this.viewScaleY * this.viewScaleY);
        this.cos = Math.cos(this.viewRotation);
        this.sin = Math.sin(this.viewRotation);


        this.updateViewInfo();

        if(this.img) {
            this.initImgData();

            this.initBuffer();
        }

        this.initMapData();
        this.saveLastState();
        this.setViewPos(this.viewX, this.viewY, true);

    },


    updateViewInfo : function(){

        this.viewWidth=this.oViewWidth*this.scale;
        this.viewHeight=this.oViewHeight*this.scale;

        this.viewTileCols = Math.ceil((this.viewWidth+this.tileWidth) / this.tileWidth );
        this.viewTileRows = Math.ceil((this.viewHeight+this.halfTileHeight) / this.halfTileHeight);
        console.log("v1", this.viewTileCols, this.viewTileRows );
       
        this.viewTileCols = this.getMinEven(this.viewTileCols+1);
        this.viewTileRows = this.getMinEven(this.viewTileRows+1);
        console.log("v2", this.viewTileCols, this.viewTileRows );
        
        this.tileWidthV=this.tileWidth*this.scale;
        this.tileHeightV=this.tileHeight*this.scale;
    },

    clearTile : function(context, x, y){
        // context.clearRect(x,y,this.tileWidth,this.tileHeight);
        context.drawImage(this.img,
            0,0,this.tileWidth,this.tileHeight,
            x,y,this.tileWidth,this.tileHeight
            );
    },

    setViewPos: function(x, y, force) {

        this.viewX = x;
        this.viewY = y;

        this.viewCol = Math.floor(this.viewX / this.tileWidth);
        this.viewRow = Math.floor(this.viewY / this.halfTileHeight)-1;

        this.tileOffsetX = this.viewX - (this.viewCol * this.tileWidth);
        this.tileOffsetY = this.viewY - (this.viewRow * this.halfTileHeight);

        if(force || this.lastViewX !== this.viewX || this.lastViewY !== this.viewY) {
            this.scrolled = true;
            if(force) {
                this.lastViewRow = this.viewRow - this.viewTileRows;
            }
        }

    },

    initBuffer : function(){
        
        this.initBufferConfig();

        this.bufferWidth=this.bufferTileCols*this.tileWidth + this.halfTileWidth;;
        this.bufferHeight=this.bufferTileRows*this.halfTileHeight + this.halfTileHeight;

        this.bufferContext=this.createBuffer(this.bufferWidth,this.bufferHeight);
        this.buffer=this.bufferContext.canvas;

    },


    renderRegion : function(fromCol, fromRow, toCol, toRow){
    
        var dataCol = Math.ceil((fromCol * 2 + fromRow) / 2);
        var dataRow = fromRow - dataCol;
        var even = fromRow % 2 == 0;
       

        var colInBuffer = fromCol % this.bufferTileCols;
        (colInBuffer<0)&&(colInBuffer=this.bufferTileCols+colInBuffer);

        var rowInBuffer = fromRow % this.bufferTileRows;
        (rowInBuffer<0)&&(rowInBuffer=this.bufferTileRows+rowInBuffer);


        var _rowInBuffer = rowInBuffer;
        for(var r = fromRow; r < toRow; r++) {
            
            var col = dataCol,
                row = dataRow;
            
            var _colInBuffer = colInBuffer;
            for(var c = fromCol; c < toCol; c++) {

                var tileInfo = null;
                var _row = this.getNewRow(row);
                if(_row != null) {
                    var _col = this.getNewCol(col);
                    if(_col != null) {
                        tileInfo = this.data[_row][_col];
                    }
                }

                this.renderTile(this.bufferContext,_colInBuffer,_rowInBuffer, tileInfo);

                if (++_colInBuffer===this.bufferTileCols){
                    _colInBuffer=0;
                }
                col++;
                row--;
            }

            if (++_rowInBuffer===this.bufferTileRows){
                _rowInBuffer=0;
            }

            if(even) {
                dataCol++;
            } else {
                dataRow++;
            }
            even = !even;
        }

    },
 

    renderBuffer : function(context){

        if(this.scrolled) {
            this.renderScrolled();
            this.updateBufferInfo();
            this.saveLastState();
            this.scrolled = false;
        }
        var ox = -this.bufferOffsetX;
        var oy = -this.bufferOffsetY;
        var w=this.bufferWidth-this.halfTileWidth,
            h=this.bufferHeight-this.halfTileHeight;
        var buffer=this.buffer;
        context.drawImage(buffer, ox, oy);
        context.drawImage(buffer, ox+w, oy);
        context.drawImage(buffer, ox, oy+h);
        context.drawImage(buffer, ox+w, oy+h);

    },

    updateBufferInfo: function() {


        var col =this.viewCol % this.bufferTileCols;     
        (col<0)&&(col=this.bufferTileCols+col);
        this.bufferOffsetX = this.tileOffsetX + (col * this.tileWidth)+ this.halfTileWidth;

        var row =this.viewRow % this.bufferTileRows;     
        (row<0)&&(row=this.bufferTileRows+row);
        this.bufferOffsetY = this.tileOffsetY + (row * this.halfTileHeight);

    },


    renderTile : function(context,_colInBuffer, _rowInBuffer, tileInfo) {

        var x = _colInBuffer * this.tileWidth + (_rowInBuffer % 2 != 0 ? this.halfTileWidth : 0);
        var y = _rowInBuffer * this.halfTileHeight;

        if (!tileInfo || tileInfo.clear){
            this.clearTile(context,x,y);
        }
        if (tileInfo){
            context.drawImage(this.img, tileInfo.iX, tileInfo.iY, this.tileWidth, this.tileHeight, 
                x, y, this.tileWidth, this.tileHeight);

            // debug
            // context.fillText(tileInfo.col+","+tileInfo.row, 20+x, 30+y);

        }
              
    },



   getTileByPx : function(x, y) {
        var c = Math.floor((y / this.viewScaleY + x) / this.tileWidth);
        var r = Math.floor((y - x * this.viewScaleY) / this.tileHeight);
      
        return this.getTileInfo(c,r);
    },



    mapToView: function(x, y, z) {
        var vx = x * this.cos - y * this.sin;
        var vy = x * this.sin + y * this.cos;
        vy = vy * this.viewScaleY;
        var vz = z ? z * this.viewScaleZ : 0;
        return [vx, vy - vz];
    },

    viewToMap: function(vx, vy) {
        vx = vx;
        vy = vy / this.viewScaleY;
        var x = vx * this.cos + vy * this.sin;
        var y = -vx * this.sin + vy * this.cos;
        return [x, y];
    },
    // mapTile To mapPx
    mapTileToMapPx: function(c, r) {
        var x = (c - r - 1) * this.halfTileWidth;
        var y = (c + r) * this.halfTileHeight;

        return {
            x: x + this.offsetX,
            y: y + this.offsetY
        };
    },

    // mapPx To mapTile
    mapPxToMapTile: function(x, y) {
        var c = Math.floor((y / this.viewScaleY + x) / this.tileWidth);
        var r = Math.floor((y - x * this.viewScaleY) / this.tileHeight);
        return {
            col: c,
            row: r
        };
    },
    // common
    destroy: function() {
        this.scene = null;
        this.rawData = null;
        this.data = null;
        this.img=null;
    }

};


    for (var key in TileMap.prototype){
        DimTileMap.prototype[key]=TileMap.prototype[key];
    }

    for (var key in proto){
        DimTileMap.prototype[key]=proto[key];
    }

}(this));





