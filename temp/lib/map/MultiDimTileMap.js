
var MultiDimTileMap=function(cfg){
    for ( var key in cfg) {
        this[key] = cfg[key];
    }
};

(function(){

var proto={
    
    constructor : MultiDimTileMap,



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



    renderRegion : function(fromCol, fromRow, toCol, toRow){

        var dataCol = Math.ceil((fromCol * 2 + fromRow) / 2);
        var dataRow = fromRow - dataCol;
        var even = fromRow % 2 == 0;
   

        var colInBuffer = fromCol % this.bufferTileCols;
        (colInBuffer<0)&&(colInBuffer=this.bufferTileCols+colInBuffer);

        var rowInBuffer = fromRow % this.bufferTileRows;
        (rowInBuffer<0)&&(rowInBuffer=this.bufferTileRows+rowInBuffer);


        var bCol=0 , bRow=0;
        
        if (this.bufferCols>1){ 
            bCol= Math.floor( fromCol / this.bufferTileCols) % this.bufferCols;
            (bCol<0)&&(bCol=this.bufferCols+bCol);
        }
        if (this.bufferRows>1){     
            bRow= Math.floor( fromRow / this.bufferTileRows) % this.bufferRows;
            (bRow<0)&&(bRow=this.bufferRows+bRow);
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


                if (++_colInBuffer===this.bufferTileCols){
                    _colInBuffer=0;
                    (++_bCol===this.bufferCols)&&(_bCol-=this.bufferCols);
                }

                col++;
                row--;
            }

            if (++_rowInBuffer===this.bufferTileRows){
                _rowInBuffer=0;
                (++_bRow===this.bufferRows)&&(_bRow-=this.bufferRows);
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
        this.bufferOffsetY = this.tileOffsetY + (this.rowInBuffer * this.halfTileHeight)//+ this.halfTileHeight;

    },

    destroy: function() {
        this.scene = null;
        this.rawData = null;
        this.data = null;
        this.img=null;
    },

initBufferConfig : MultiTileMap.prototype.initBufferConfig,
addBufferRow : MultiTileMap.prototype.addBufferRow,
addBufferCol : MultiTileMap.prototype.addBufferCol


};


    for (var key in DimTileMap.prototype){
        MultiDimTileMap.prototype[key]=DimTileMap.prototype[key];
    }

    for (var key in proto){
        MultiDimTileMap.prototype[key]=proto[key];
    }



}(this));





