
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

    repeatX: false,
    repeatY: false,


    init: function(scene) {
        this.scene = scene;

        this.viewWidth=scene.viewWidth;
        this.viewHeight=scene.viewHeight;
        

        this.initViewInfo();


        if(this.img) {
            this.initImgData();

            this.initBuffer();
        }

        this.setRawData(this.rawData);

        this.saveLastState();
        this.setViewPos(this.viewX, this.viewY, true);

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

    initViewInfo : function(){

        this.viewWidthScaled=this.viewWidth*this.scale;
        this.viewHeightScaled=this.viewHeight*this.scale;

        this.viewTileCols = this.getMinEven(Math.ceil(this.viewWidth / this.tileWidth )+1);
        this.viewTileRows = this.getMinEven(Math.ceil(this.viewHeight / this.tileHeight)+1);

        this.tileWidthScaled=this.tileWidth*this.scale;
        this.tileHeightScaled=this.tileHeight*this.scale;
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

       var cx=(this.mapWidth-this.viewWidth)/2;
       var cy=(this.mapHeight-this.viewHeight)/2;
       this.setViewPos(cx,cy,force);
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
        context.clearRect(x,y,this.tileWidth,this.tileHeight);
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
            this.lastViewRow = this.viewRow - this.viewTileRows;
        }


    },

    // common
    scaleView : function(scale,cx,cy){
        this.scale=scale;
        this.initViewInfo();
    },
 
   // common 
    saveLastState: function() {
        this.lastViewX = this.viewX;
        this.lastViewY = this.viewY;

        this.lastViewCol = this.viewCol;
        this.lastViewRow = this.viewRow;
    },

    // common 
    renderAll: function() {
        this.renderRegion(
            this.viewCol, this.viewRow, this.viewCol + this.viewTileCols, this.viewRow + this.viewTileRows);
    },
    // common
    renderScrolled: function() {

        if(this.viewCol !== this.lastViewCol) {
            var fromCol, toCol;
            if(this.viewCol > this.lastViewCol) {
                fromCol = this.lastViewCol + this.viewTileCols;
                toCol = this.viewCol + this.viewTileCols;
            } else {
                fromCol = this.viewCol;
                toCol = this.lastViewCol;
            }
            this.renderRegion(fromCol, this.viewRow, toCol, this.viewRow + this.viewTileRows);
        }

        if(this.viewRow !== this.lastViewRow) {
            var fromRow, toRow;
            if(this.viewRow > this.lastViewRow) {
                fromRow = this.lastViewRow + this.viewTileRows;
                toRow = this.viewRow + this.viewTileRows;
            } else {
                fromRow = this.viewRow;
                toRow = this.lastViewRow;
            }
            this.renderRegion(this.viewCol, fromRow, this.viewCol + this.viewTileCols, toRow);
        }

    },



    initBufferConfig : function(){

        this.bufferTileCols=this.viewTileCols;
        this.bufferTileRows=this.viewTileRows;

    },

    initBuffer : function(){

        this.initBufferConfig();

        this.bufferWidth=this.bufferTileCols*this.tileWidth;
        this.bufferHeight=this.bufferTileRows*this.tileHeight;
        this.bufferContext=this.createBuffer(this.bufferWidth,this.bufferHeight);
        this.buffer=this.bufferContext.canvas;
    },


    renderRegion : function(fromCol, fromRow, toCol, toRow){
        

        var colInBuffer = fromCol % this.bufferTileCols;
        (colInBuffer<0)&&(colInBuffer=this.bufferTileCols+colInBuffer);

        var rowInBuffer = fromRow % this.bufferTileRows;
        (rowInBuffer<0)&&(rowInBuffer=this.bufferTileRows+rowInBuffer);


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

                if (++_colInBuffer===this.bufferTileCols){
                    _colInBuffer=0;
                }
                
            }

            if (++_rowInBuffer===this.bufferTileRows){
                _rowInBuffer=0;
            }

        }

    },


    updateBufferInfo: function() {

        var col =this.viewCol % this.bufferTileCols;     
        (col<0)&&(col=this.bufferTileCols+col);
        this.bufferOffsetX = this.tileOffsetX + (col * this.tileWidth);

        var row =this.viewRow % this.bufferTileRows;     
        (row<0)&&(row=this.bufferTileRows+row);
        this.bufferOffsetY = this.tileOffsetY + (row * this.tileHeight);

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
        var w=this.bufferWidth,
            h=this.bufferHeight;
        var buffer=this.buffer;
        context.drawImage(buffer, ox, oy);
        context.drawImage(buffer, ox+w, oy);
        context.drawImage(buffer, ox, oy+h);
        context.drawImage(buffer, ox+w, oy+h);

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
            context.fillText(tileInfo.col+","+tileInfo.row, 20+x, 30+y);

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
        context.font="20pt,Arial";
        context.lineWidth=4;
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
        var c = Math.floor( x / this.tileWidth );
        var r = Math.floor( y / this.tileHeight );              
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







