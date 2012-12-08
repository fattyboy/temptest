
var DimTiledMapSimpleSimple=function(cfg){
    for ( var key in cfg) {
        this[key] = cfg[key];
    }
};

(function(){

var proto={
    
    constructor : DimTiledMapSimple,

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
        this.viewRow = Math.floor(this.viewY / this.halfTileHeight);

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
        this.bufferMatrix=[];
        this.contextMatrix=[];

        this.bufferCols=this.oBufferCols;
        this.bufferRows=0;
        
        for (var r=0;r<this.oBufferRows;r++){
            this.addBufferRow();
        }

        console.log("b",[this.bufferCols,this.bufferRows],[this.bufferTileCols,this.bufferTileRows])
    },




/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////




    renderRegion : function(fromCol, fromRow, toCol, toRow){

        var dataCol = Math.ceil((fromCol * 2 + fromRow) / 2);
        var dataRow = fromRow - dataCol;
        var even = fromRow % 2 == 0;
   

        var colInBuffer = fromCol % this.bufferTileCols;
        colInBuffer=(colInBuffer + this.bufferTileCols) % this.bufferTileCols;

        var rowInBuffer = fromRow % this.bufferTileRows;
        rowInBuffer= (rowInBuffer + this.bufferTileRows)%this.bufferTileRows;


        var bCol=0 , bRow=0;
        
        if (this.bufferCols>1){ 
            bCol= Math.floor( fromCol / this.bufferTileCols) % this.bufferCols;
            bCol=(bCol + this.bufferCols)%this.bufferCols;
        }
        if (this.bufferRows>1){     
            bRow= Math.floor( fromRow / this.bufferTileRows) % this.bufferRows;
            bRow= (bRow + this.bufferRows) % this.bufferRows;
        }

        var _rowInBuffer = rowInBuffer;
        var _bRow = bRow;
        for(var r = fromRow; r < toRow; r++) {
           
            var col = dataCol,
                row = dataRow;

            var _colInBuffer = colInBuffer;
            var _bCol = bCol;
            for(var c = fromCol; c < toCol; c++) {

                var tileInfo = null;
                var _row = this.getNewRow(row);
                if(_row != null) {
                    var _col = this.getNewCol(col);
                    if(_col != null) {
                        tileInfo = this.data[_row][_col];
                    }
                }

                var _context=this.contextMatrix[_bRow][_bCol];
                this.renderTile(_context,_colInBuffer,_rowInBuffer, tileInfo);


                _colInBuffer++;
                if (_colInBuffer==this.bufferTileCols){
                    _colInBuffer=0;
                    _bCol= (++_bCol)%this.bufferCols;
                }

                col++;
                row--;
            }

            _rowInBuffer++;
            if (_rowInBuffer==this.bufferTileRows){
                _rowInBuffer=0;
                 _bRow= (++_bRow)%this.bufferRows;
            }

            if(even) {
                dataCol++;
            } else {
                dataRow++;
            }
            even = !even;

        }

    },
 

    renderTile : function(context,_colInBuffer, _rowInBuffer, tileInfo) {
        // TODO : emptyTile
        var x = _colInBuffer * this.tileWidth + (_rowInBuffer % 2 != 0 ? (this.halfTileWidth) : 0);
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

    renderBuffer : function(context){

        if(this.scrolled) {
            this.renderScrolled();
            this.updateBufferInfo();
            this.saveLastState();
            this.scrolled = false;
        }
        var ox = this.bufferOffsetX;
        var oy = this.bufferOffsetY;

        var _r=this.bufferRow;
        for(var r = 0; ; r++) {
            var _c=this.bufferCol;
            var y = r * (this.bufferHeight- this.halfTileHeight) - oy;
            if (y>this.viewHeight){
                break;
            }
            for(var c = 0;; c++) {
                var x = c * (this.bufferWidth- this.halfTileWidth) - ox;
                if (x>this.viewWidth){
                    break;
                }
                var buffer=this.bufferMatrix[_r][_c];
                context.drawImage(buffer, x, y);

                // debug
                // context.strokeRect(x,y,this.bufferWidth,this.bufferHeight);

                if ( (++_c)==this.bufferCols){
                    _c=0;
                }
            }
            if ( (++_r)==this.bufferRows){
              _r=0;
            }
        }

    },

    updateBufferInfo: function() {

        var bCol=0 , bRow=0;
        
        if (this.bufferCols>1){ 
            bCol= Math.floor( this.viewCol / this.bufferTileCols) % this.bufferCols;
            bCol=(bCol + this.bufferCols)%this.bufferCols;
        }
        if (this.bufferRows>1){     
            bRow= Math.floor( this.viewRow / this.bufferTileRows) % this.bufferRows;
            bRow= (bRow + this.bufferRows) % this.bufferRows;
        }

        this.bufferCol = bCol;
        this.colInBuffer =this.viewCol % this.bufferTileCols; 
        (this.colInBuffer<0)&&(this.colInBuffer=this.bufferTileCols+this.colInBuffer); 
        this.bufferOffsetX = this.tileOffsetX + (this.colInBuffer * this.tileWidth)+ this.halfTileWidth;

        this.bufferRow = bRow;
        this.rowInBuffer =this.viewRow % this.bufferTileRows;     
        (this.rowInBuffer<0)&&(this.rowInBuffer=this.bufferTileRows+this.rowInBuffer); 
        this.bufferOffsetY = this.tileOffsetY + (this.rowInBuffer * this.halfTileHeight)+ this.halfTileHeight;

// console.log(bCol, bRow)
    },




/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////






    getTileByPx : function(x, y) {
        var c = Math.floor((y / this.viewScaleY + x) / this.tileWidth);
        var r = Math.floor((y - x * this.viewScaleY) / this.tileHeight);
      
        return this.getTileInfo(c,r);
    },

    behind: function(a, b) {
        return a.viewPos[1]<b.viewPos[1]
        // return a.aabb[2] - b.aabb[2] < 0.0004 && a.aabb[3] - b.aabb[3] < 0.0004;
    },
    depthSort: function(objs) {

        for(var i = 1, len = objs.length; i < len; i++) {
            var  t = objs[i];
            for(var j = i; j > 0 && this.behind(t, objs[j - 1]) ; j--){
                objs[j] = objs[j - 1];
            }
            objs[j] = t;
        }
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


};


    for (var key in TiledMap.prototype){
        DimTiledMapSimple.prototype[key]=TiledMap.prototype[key];
    }

    for (var key in proto){
        DimTiledMapSimple.prototype[key]=proto[key];
    }

}(this));





