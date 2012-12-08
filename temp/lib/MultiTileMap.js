
var MultiTileMap=function(cfg){
    for ( var key in cfg) {
        this[key] = cfg[key];
    }
};



(function(){

var proto={
    
    constructor : MultiTileMap,


    // common 
    initBufferConfig : function(){
        if ( this.bufferTileCols){
            this.bufferTileCols=this.getMinEven(this.bufferTileCols);
            this.bufferCols=Math.ceil(this.viewTileCols / this.bufferTileCols );

        }else if (this.bufferCols){

            this.bufferTileCols=this.getMinEven(Math.ceil(this.viewTileCols / this.bufferCols ));
        }

        if ( this.bufferTileRows){

            this.bufferTileRows=this.getMinEven(this.bufferTileRows);
            this.bufferRows=Math.ceil(this.viewTileRows / this.bufferTileRows );

        }else if (this.bufferRows){

            this.bufferTileRows=this.getMinEven(Math.ceil(this.viewTileRows / this.bufferRows ));
        }

        this.oBufferCols=this.bufferCols;
        this.oBufferRows=this.bufferRows;

    },

    initBuffer : function(){

        this.initBufferConfig();

        this.bufferWidth=this.bufferTileCols*this.tileWidth;
        this.bufferHeight=this.bufferTileRows*this.tileHeight;
        this.bufferMatrix=[];
        this.contextMatrix=[];


        this.bufferCols=this.oBufferCols;
        this.bufferRows=0;
        
        for (var r=0;r<this.oBufferRows;r++){
            this.addBufferRow();
        }

        console.log("b",[this.bufferCols,this.bufferRows],[this.bufferTileCols,this.bufferTileRows])

    },

    // common 
    addBufferRow : function(){
        var ctxR=this.contextMatrix[this.bufferRows]=[];
        var cvR=this.bufferMatrix[this.bufferRows]=[];
        for (var c=0;c<this.bufferCols;c++){
            var ctx=this.createBuffer(this.bufferWidth,this.bufferHeight);
            ctxR[c]=ctx;
            cvR[c]=ctx.canvas;
        }
        this.bufferRows++;
    },

    // common 
    addBufferCol : function(){
        for (var r=0;r<this.bufferRows;r++){
            var ctx=this.createBuffer(this.bufferWidth,this.bufferHeight);
            this.contextMatrix[r].push(ctx);
            this.bufferMatrix[r].push(ctx.canvas);
        }
        this.bufferCols++;
    },


    renderRegion : function(fromCol, fromRow, toCol, toRow){
        

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

        var _bRow = bRow;
        var _rowInBuffer = rowInBuffer;
        for(var r = fromRow; r < toRow; r++) {
            var row = r;
            
            var _bCol = bCol;
            var _colInBuffer = colInBuffer;
            for(var c = fromCol; c < toCol; c++) {
                var col = c;

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
                
            }

            if (++_rowInBuffer===this.bufferTileRows){
                _rowInBuffer=0;
                (++_bRow===this.bufferRows)&&(_bRow-=this.bufferRows);
            }

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
            var y = r * this.bufferHeight - oy;
            if (y>this.viewHeight){
                break;
            }
            for(var c = 0;; c++) {
                var x = c * this.bufferWidth - ox;
                if (x>this.viewWidth){
                    break;
                }
                var buffer=this.bufferMatrix[_r][_c];
                context.drawImage(buffer, x, y);


                // context.lineWidth=4;
                // context.strokeStyle="red";
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
        this.colInBuffer=(this.colInBuffer+this.bufferTileCols)%this.bufferTileCols;
        this.bufferOffsetX = this.tileOffsetX + (this.colInBuffer * this.tileWidth);

        this.bufferRow = bRow;
        this.rowInBuffer =this.viewRow % this.bufferTileRows;     
        this.rowInBuffer=(this.rowInBuffer+this.bufferTileRows)%this.bufferTileRows;
        this.bufferOffsetY = this.tileOffsetY + (this.rowInBuffer * this.tileHeight);

    },



/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////



    destroy: function() {
        this.scene = null;
        this.rawData = null;
        this.data = null;
        this.img=null;
    }

};



    for (var key in TileMap.prototype){
        MultiTileMap.prototype[key]=TileMap.prototype[key];
    }

    for (var key in proto){
        MultiTileMap.prototype[key]=proto[key];
    }

}(this));




