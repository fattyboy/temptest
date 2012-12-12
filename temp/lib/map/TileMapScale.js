
var TileMap=function(cfg){
    for ( var key in cfg) {
        this[key] = cfg[key];
    }
};


TileMap.prototype={
    
    constructor : TileMap,

    id : null ,

    width : 0,
    height : 0,
    cols : 0,
    rows : 0,

    scale : 1,
    lastScale : 1,

    tileWidth : null,
    tileHeight : null,
    tileOffsetX : 0,
    tileOffsetY : 0,


    rawData : null, 
    data : null,
    dataRows : 0,
    dataCols : 0,
    startTileIndex : null,
    alphaTiles : null,

    img : null,
    imgCols : 0,
    imgRows : 0,

    scale : 1 ,
    viewWidth: 0,
    viewHeight: 0,
    viewX: 0,
    viewY: 0,
    viewCol: 0,
    viewRow: 0,
    viewTileCols: 0,
    viewTileRows: 0,
    viewOffsetX : 0,
    viewOffsetY : 0,
    lastViewX : null,
    lastViewY : null,
    lastViewCol : null,
    lastViewRow : null,
    lastScale : null,

    repeatX: false,
    repeatY: false,


    init: function(scene) {
        this.scene = scene;

        this.viewWidth=scene.viewWidth;
        this.viewHeight=scene.viewHeight;
        this.viewTileCols = this.getMinEven(Math.ceil(this.viewWidth / this.tileWidth )+2);
        this.viewTileRows = this.getMinEven(Math.ceil(this.viewHeight / this.tileHeight)+2);
        this.viewWidthFull=this.tileWidth*this.viewTileCols;
        this.viewHeightFull=this.tileHeight*this.viewTileRows;
        // this.initViewInfo();


        if(this.img) {
            this.initImgData();

            this.initBuffer();
        }

        this.setRawData(this.rawData);

        
        this.scaleView(this.scale,0,0);
        this.setViewPos(this.viewX, this.viewY, true);

        // console.log(this)

    },

    // common 
    initDataInfo : function() {

        this.dataCols = this.dataCols || 1;
        this.data = (this.rawData[0] && this.rawData[0].length > 0) ? this.rawData : this.arrayTo2D(this.rawData, this.dataCols);
        this.dataCols = this.data[0].length;
        this.dataRows = this.data.length || 0;

        if(this.repeatX) {
            this.getNewCol = this.getNewColCircle;
        }
        if(this.repeatY) {
            this.getNewRow = this.getNewRowCircle;
        }
    },


    // common 
    initImgData: function() {
        this.imgCols = Math.floor(this.img.width / this.tileWidth);
        this.imgRows = Math.floor(this.img.height / this.tileHeight);
        this.startTileIndex=this.startTileIndex||0;
        this.maxTileIndex = this.imgRows * this.imgCols - 1 + this.startTileIndex;
        this.emptyTile=this.emptyTile||this.startTileIndex-1;
        this.alphaTiles=this.alphaTiles||[];
    },

    setRawData : function(rawData){
        this.rawData=rawData;
        this.initDataInfo();
        this.initMapData();
        this.mapWidth=this.mapWidth||this.dataCols*this.tileWidth;
        this.mapHeight=this.mapHeight||this.dataRows*this.tileHeight;
    },

    focusCenter : function(force){
        // TODO
    },

    // common 
    initMapData: function() {

        this.data = [];
        for(var r = 0; r < this.dataRows; r++) {
            this.data[r] = [];
            for(var c = 0; c < this.dataCols; c++) {
                var no = this.rawData[r][c];
                var tile = this.createTile(c, r, no);
                this.data[r][c] = this.initTile(tile) || tile;
            }
        }

    },

    // common 
    createTile: function(c, r, no) {

        var tile = {
            no: no,
            col: c,
            row: r
        };
        if(this.img) {
            var clear = no === null || no === undefined || no < this.startTileIndex || no > this.maxTileIndex;
            var imgNo = no - this.startTileIndex;
            if (!clear){
                clear=this.alphaTiles.indexOf(no)!=-1;
                var imgX = (imgNo % this.imgCols) * this.tileWidth;
                var imgY = Math.floor(imgNo / this.imgCols) * this.tileHeight;
                tile.iX = imgX;
                tile.iY = imgY;
            }
            tile.clear=clear;
            tile.iNo = clear ? null : imgNo;

        }
        return tile;
    },
    // common 
    initTile: function(tile) {
    },


    clearTile : function(context, x, y){
        context.drawImage(this.img,
            0,0,this.tileWidth,this.tileHeight,
            x,y,this.tileWidth,this.tileHeight
            );
        // context.clearRect(x,y,this.tileWidthScaled,this.tileHeightScaled);
    },

    scrollViewBy : function(viewDx,viewDy){

        var dx=viewDx/this.scale;
        var dy=viewDy/this.scale;
        var viewX=this.viewX+dx ;
        var viewY=this.viewY+dy ;

        this.setViewPos(viewX,viewY);
    },

 
    setViewPos: function(x, y, force) {

        this.viewX = x;
        this.viewY = y;
        this.viewCol = Math.floor(this.viewX / this.tileWidth);
        this.viewRow = Math.floor(this.viewY / this.tileHeight);
        this.tileOffsetX = this.viewX - (this.viewCol * this.tileWidth);
        this.tileOffsetY = this.viewY - (this.viewRow * this.tileHeight);

        this.scrolled=this.lastViewX !== this.viewX || this.lastViewY !== this.viewY;
        if(force) {
            this.scrolled = true;
            this.lastViewRow = this.viewRow - this.viewTileRowsScaled;
        }

    },

    minScale : 0.5,
    maxScale : 2,
    // common
    scaleView : function(scale,viewCx,viewCy){
        scale=Math.max(this.minScale, Math.min(this.maxScale,scale));

        viewCx=viewCx||0;
        viewCy=viewCy||0;

        var d=1/this.scale-1/scale;
        this.viewX=viewCx*d+this.viewX;
        this.viewY=viewCy*d+this.viewY;

        this.tileWidthScaled=this.tileWidth*scale;
        this.tileHeightScaled=this.tileHeight*scale;
        this.viewWidthScaled=this.viewWidth/scale;
        this.viewHeightScaled=this.viewHeight/scale;



       if (scale<1){
            this.viewTileColsScaled=Math.floor(this.viewWidthFull/this.tileWidthScaled);
            this.viewTileRowsScaled=Math.floor(this.viewHeightFull/this.tileWidthScaled);
            this.bufferTileColsScaled = this.viewTileColsScaled;
            this.bufferTileRowsScaled = this.viewTileRowsScaled;

            this.bufferWidthScaled=this.bufferTileColsScaled*this.tileWidthScaled;
            this.bufferHeightScaled=this.bufferTileRowsScaled*this.tileHeightScaled;

        }else{
            this.viewTileColsScaled=this.viewTileCols;
            this.viewTileRowsScaled=this.viewTileRows;
            this.bufferTileColsScaled=this.viewTileCols;
            this.bufferTileRowsScaled=this.viewTileRows;
            this.bufferWidthScaled=this.bufferWidth;
            this.bufferHeightScaled=this.bufferHeight;
        }
        this.scale=scale;
        this.scaled=true;
        this.setViewPos(this.viewX,this.viewY,true);
    },
 
   // common 
    saveLastState: function() {
        this.lastViewX = this.viewX;
        this.lastViewY = this.viewY;
        this.lastViewCol = this.viewCol;
        this.lastViewRow = this.viewRow;
        this.lastScale=this.scale;
    },

    // common 
    renderAll: function() {
        this.renderRegion( this.viewCol, this.viewRow, 
            this.viewCol + this.viewTileColsScaled, this.viewRow + this.viewTileRowsScaled);
    },
    // common
    renderScrolled: function() {

        if(this.viewCol !== this.lastViewCol) {
            var fromCol, toCol;
            if(this.viewCol > this.lastViewCol) {
                fromCol = this.lastViewCol + this.viewTileColsScaled;
                toCol = this.viewCol + this.viewTileColsScaled;
            } else {
                fromCol = this.viewCol;
                toCol = this.lastViewCol;
            }
            this.renderRegion(fromCol, this.viewRow, toCol, this.viewRow + this.viewTileRowsScaled);
        }

        if(this.viewRow !== this.lastViewRow) {
            var fromRow, toRow;
            if(this.viewRow > this.lastViewRow) {
                fromRow = this.lastViewRow + this.viewTileRowsScaled;
                toRow = this.viewRow + this.viewTileRowsScaled;
            } else {
                fromRow = this.viewRow;
                toRow = this.lastViewRow;
            }
            this.renderRegion(this.viewCol, fromRow, this.viewCol + this.viewTileColsScaled, toRow);
        }

    },


    initBuffer : function(){

        this.bufferWidth=this.viewTileCols*this.tileWidth;
        this.bufferHeight=this.viewTileRows*this.tileHeight;
        this.bufferContext=this.createBuffer(this.bufferWidth,this.bufferHeight);
        this.buffer=this.bufferContext.canvas;
    },


    renderRegion : function(fromCol, fromRow, toCol, toRow){

        var colInBuffer = fromCol % this.bufferTileColsScaled;
        (colInBuffer<0)&&(colInBuffer=this.bufferTileColsScaled+colInBuffer);

        var rowInBuffer = fromRow % this.bufferTileRowsScaled;
        (rowInBuffer<0)&&(rowInBuffer=this.bufferTileRowsScaled+rowInBuffer);


        var _rowInBuffer = rowInBuffer;
        for(var r = fromRow; r < toRow; r++) {
            var row = r;
            
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

                this.renderTile(this.bufferContext,_colInBuffer,_rowInBuffer, tileInfo);

                if (++_colInBuffer===this.bufferTileColsScaled){
                    _colInBuffer=0;
                }
                
            }

            if (++_rowInBuffer===this.bufferTileRowsScaled){
                _rowInBuffer=0;
            }

        }

    },


    updateBufferInfo: function() {

        var col =this.viewCol % this.bufferTileColsScaled;     
        (col<0)&&(col=this.bufferTileColsScaled+col);
        this.bufferOffsetX = this.tileOffsetX + (col * this.tileWidth);

        var row =this.viewRow % this.bufferTileRowsScaled;     
        (row<0)&&(row=this.bufferTileRowsScaled+row);
        this.bufferOffsetY = this.tileOffsetY + (row * this.tileHeight);

    },


    renderBuffer : function(context){

        if (this.scaled){
            // console.log("scale", this.scale,"/", this.bufferTileColsScaled,this.bufferTileRowsScaled)
            this.bufferContext.restore();
            this.bufferContext.clearRect(0,0,this.bufferWidth,this.bufferHeight)
            this.bufferContext.save();
            if (this.scale<1){
                this.bufferContext.scale(this.scale,this.scale);
            }
            this.scaled=false;

            this.renderScrolled();
            this.updateBufferInfo();
            this.saveLastState();
            this.scrolled = false;
        }else if(this.scrolled) {
            this.renderScrolled();
            this.updateBufferInfo();
            this.saveLastState();
            this.scrolled = false;
        }

        var ox = -this.bufferOffsetX;
        var oy = -this.bufferOffsetY;
        var w= Math.floor(this.bufferWidthScaled),
            h= Math.floor(this.bufferHeightScaled);
        var buffer=this.buffer;

        if (this.scale<1){
            ox*=this.scale;
            oy*=this.scale;                
        }
        context.save();
        if (this.scale>1){
            context.scale(this.scale,this.scale);      
        }
        // debug
        // this.bufferContext.strokeRect(0,0,w,h);
        ox=ox>>0;
        oy=oy>>0;
        context.drawImage(buffer, ox, oy);
        context.drawImage(buffer, (ox+w), oy );
        context.drawImage(buffer, ox, (oy+h) );
        context.drawImage(buffer, (ox+w), (oy+h) );
        context.restore();

    },

 
    renderTile : function(context,_colInBuffer, _rowInBuffer, tileInfo) {

        var x = _colInBuffer * this.tileWidth ;
        var y = _rowInBuffer * this.tileHeight;
        if (!tileInfo || tileInfo.clear){
            this.clearTile(context,x,y);
        }
        if (tileInfo){
            context.drawImage(this.img, tileInfo.iX, tileInfo.iY, this.tileWidth, this.tileHeight, 
                x, y, this.tileWidth, this.tileHeight);

            // debug
            context.fillText(tileInfo.col+","+tileInfo.row, 5+x, 30+y);

        }
              
    },


    // common 
    render : function(context){
        // if (this.scale!=1){
        //     context.save();
        //     context.translate(this.viewWidth/2,this.viewHeight/2);
        //     context.scale(this.scale,this.scale);
        //     context.translate(-this.viewWidth/2,-this.viewHeight/2);
        // }
        this.renderBuffer(context);
        // if (this.scale!=1){
        //     context.restore();
        // }
    },


    // common 
    createBuffer : function(width, height){
        var canvas=document.createElement("canvas");
        canvas.width=width;
        canvas.height=height;
        var context=canvas.getContext("2d");
        context.font="20px Arial";
        context.lineWidth=8;
        context.strokeStyle="red";
        context.fillStyle="#000000";
                
        context.canvas=canvas;
        return context;
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


    getTileByPx : function(x, y) {
        var c = Math.floor( x / this.tileWidthScaled );
        var r = Math.floor( y / this.tileHeightScaled );              
        return this.getTileInfo(c,r);
    },

    mapToView: function(x, y, z) {
        return [x,y,0];
    },

    // common
    getTileInfo: function(c, r) {
        r = this.data[r];
        return r ? r[c] : null;
    },
    // common
    getNewCol : function(c){
        return 0<=c&&c<this.dataCols?c:null;        
    },
    // common
    getNewRow : function(r){
        return 0<=r&&r<this.dataRows?r:null;        
    },
    // common
    getNewColCircle: function(c) {
        c = c % this.dataCols;
        return c < 0 ? this.dataCols + c : c;
    },
    // common
    getNewRowCircle: function(r) {
        r = r % this.dataRows;
        return r < 0 ? this.dataRows + r : r;
    },

    destroy: function() {
        this.scene = null;
        this.rawData = null;
        this.data = null;
        this.img=null;
    },

    // common
    getMinEven : function(n){
        return n+(n%2);
    },
    // common
    getMaxEven : function(n){
        return n-(n%2);
    },
    // common
    arrayTo2D: function(arr, cols) {
        cols = cols || 1;
        var arr2 = [];
        var rows = Math.floor((arr.length + cols) / cols) - 1;
        var r = 0,
            c = 0,
            i = 0;
        for(r = 0; r < rows; r++) {
            arr2[r] = [];
            for(c = 0; c < cols; c++) {
                arr2[r][c] = arr[i++];
            }
        }
        return arr2;
    }
};







