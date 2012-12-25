
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


    initViewInfo : function(){

        this.halfTileWidth = this.tileWidth / 2;
        this.halfTileHeight = this.tileHeight / 2;
        this.tileSide = Math.sqrt( Math.pow(this.tileWidth,2)/2);
        this.viewScaleY = this.viewScaleY || this.tileHeight / this.tileWidth;
        this.viewScaleZ = Math.sqrt(1 - this.viewScaleY * this.viewScaleY);
        this.cos = Math.cos(this.viewRotation);
        this.sin = Math.sin(this.viewRotation);
        console.log(this.tileSide);

        this.viewTileCols = Math.ceil((this.viewWidth+this.tileWidth) / this.tileWidth );
        this.viewTileCols = this.getMinEven(this.viewTileCols+2);
        this.viewTileRows = Math.ceil((this.viewHeight+this.halfTileHeight) / this.halfTileHeight);       
        this.viewTileRows = this.getMinEven(this.viewTileRows+2);

        this.viewWidthFull=this.tileWidth*this.viewTileCols+this.halfTileWidth;
        this.viewHeightFull=this.halfTileHeight*this.viewTileRows+this.halfTileHeight;

    },


    setRawData : function(rawData){
        this.rawData=rawData;
        this.initDataInfo();
        this.initMapData();
        this.mapWidth=this.mapWidth||(this.dataCols+this.dataRows)*this.halfTileWidth;
        this.mapHeight=this.mapHeight||(this.dataCols+this.dataRows)*this.halfTileHeight;
    },

    clearTile : function(context, x, y){
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

        this.scrolled=this.lastViewX !== this.viewX || this.lastViewY !== this.viewY;
        if(force) {
            this.scrolled = true;
            this.lastViewRow = this.viewRow - this.viewTileRowsScaled;
        }

    },

    updateScaleInfo : function(){

       if (this.scale<1){
            var halfWidthScaled=this.halfTileWidth*this.scale;
            var halfHeightScaled=this.halfTileHeight*this.scale;
            this.viewTileColsScaled=Math.floor( (this.viewWidthFull-halfWidthScaled)/this.tileWidthScaled);
            this.viewTileRowsScaled=Math.floor( (this.viewHeightFull-halfHeightScaled)/halfHeightScaled);
            this.viewTileColsScaled=this.getMaxEven(this.viewTileColsScaled);
            this.viewTileRowsScaled=this.getMaxEven(this.viewTileRowsScaled);
            this.bufferTileColsScaled = this.viewTileColsScaled;
            this.bufferTileRowsScaled = this.viewTileRowsScaled;

            this.bufferWidthScaled=this.bufferTileColsScaled*this.tileWidthScaled;
            this.bufferHeightScaled=this.bufferTileRowsScaled*halfHeightScaled;

        }else{
            this.viewTileColsScaled=this.viewTileCols;
            this.viewTileRowsScaled=this.viewTileRows;
            this.bufferTileColsScaled=this.viewTileCols;
            this.bufferTileRowsScaled=this.viewTileRows;
            this.bufferWidthScaled=this.bufferWidth-this.halfTileWidth;
            this.bufferHeightScaled=this.bufferHeight-this.halfTileHeight;
        }

    },


    initBuffer : function(){
        this.bufferTileCols=this.viewTileCols;
        this.bufferTileRows=this.viewTileRows;

        this.bufferWidth=this.bufferTileCols*this.tileWidth + this.halfTileWidth;;
        this.bufferHeight=this.bufferTileRows*this.halfTileHeight + this.halfTileHeight;

        this.bufferContext=this.createBuffer( this.bufferWidth, this.bufferHeight );
        this.buffer=this.bufferContext.canvas;

    },


    renderRegion : function(fromCol, fromRow, toCol, toRow){
    
        var dataCol = Math.ceil( (fromCol * 2 + fromRow) / 2 );
        var dataRow = fromRow - dataCol;
        var even = fromRow % 2 == 0;
       
        var colInBuffer = fromCol % this.bufferTileColsScaled;
        (colInBuffer<0)&&(colInBuffer=this.bufferTileColsScaled+colInBuffer);

        var rowInBuffer = fromRow % this.bufferTileRowsScaled;
        (rowInBuffer<0)&&(rowInBuffer=this.bufferTileRowsScaled+rowInBuffer);

        var _rowInBuffer = rowInBuffer;
        for(var r = fromRow; r < toRow; r++) {
            
            var col = dataCol ,
                row = dataRow ;
            
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

                if (++_colInBuffer===this.bufferTileColsScaled){
                    _colInBuffer=0;
                }
                col++;
                row--;
            }

            if (++_rowInBuffer===this.bufferTileRowsScaled){
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
 


    updateBufferInfo: function() {


        var col =this.viewCol % this.bufferTileColsScaled;     
        (col<0)&&(col=this.bufferTileColsScaled+col);
        this.bufferOffsetX = this.tileOffsetX + (col * this.tileWidth)+ this.halfTileWidth;

        var row =this.viewRow % this.bufferTileRowsScaled;     
        (row<0)&&(row=this.bufferTileRowsScaled+row);
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
            // context.fillText(tileInfo.col+","+tileInfo.row, this.tileWidth/2+x, 30+y);

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
    }

};


    for (var key in TileMap.prototype){
        DimTileMap.prototype[key]=TileMap.prototype[key];
    }

    for (var key in proto){
        DimTileMap.prototype[key]=proto[key];
    }

}(this));





