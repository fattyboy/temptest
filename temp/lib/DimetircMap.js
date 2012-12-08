function DimetircMap(cfg) {
    for(var property in cfg) {
        this[property] = cfg[property];
    }
}

DimetircMap.prototype = {

    constructor: DimetircMap,

    mapData: null,
    mapDataInfo: null,

    tileWidth: 72,
    tileHeight: 36,
    tileOffsetX: 0,
    tileOffsetY: 0,

    x: 0,
    y: 0,
    col: 0,
    row: 0,
    offsetX: 0,
    offsetY: 0,

    viewWidth: 0,
    viewHeight: 0,
    viewX: 0,
    viewY: 0,
    viewCol: 0,
    viewRow: 0,
    viewCols: 0,
    viewRows: 0,
    viewScaleY: null,
    viewRotation: Math.PI / 4,

    repeatX: false,
    repeatY: false,

    img: null,

    startTileIndex: 1,
    useCarmack: true,

    init: function(scene) {
        this.scene = scene;

        this.viewWidth = scene.viewWidth;
        this.viewHeight = scene.viewHeight;

        this.viewScaleY = this.viewScaleY || this.tileHeight / this.tileWidth;
        this.viewScaleZ = Math.sqrt(1 - this.viewScaleY * this.viewScaleY);
        this.cos = Math.cos(this.viewRotation);
        this.sin = Math.sin(this.viewRotation);

        this.halfTileWidth = this.tileWidth / 2;
        this.halfTileHeight = this.tileHeight / 2;
        this.tileSide = Math.sqrt(Math.pow(this.halfTileWidth, 2) + Math.pow(this.halfTileHeight, 2));

        this.viewCols = (this.viewWidth / this.tileWidth + 4) >> 1 << 1;
        this.viewRows = (this.viewHeight / this.halfTileHeight + 4) >> 1 << 1;


        this.mapDataCols = this.mapDataCols || 1;
        this.mapData = (this.mapData[0] && this.mapData[0].length > 0) ? this.mapData : this.arrTo2dArr(this.mapData, this.mapDataCols);
        this.mapDataCols = this.mapData[0].length;
        this.mapDataRows = this.mapData.length || 0;

        this.mapCols = this.mapCols || this.mapDataCols;
        this.mapRows = this.mapRows || this.mapDataRows;

        this.mapWidth = (this.mapCols + this.mapRows) * this.halfTileWidth;
        this.mapHeight = (this.mapCols + this.mapRows) * this.halfTileHeight;


        if(this.repeatX) {
            this.getNewCol = this.getNewColCircle;
        } else {
            if(this.mapWidth < this.viewWidth) {
                this.viewWidth = this.mapWidth;
            }
        }
        if(this.repeatY) {
            this.getNewRow = this.getNewRowCircle;
        } else {
            if(this.mapHeight < this.viewHeight) {
                this.viewHeight = this.mapHeight;
            }
        }

        if(this.img) {
            this.initImgDataInfo();
        }

        if(this.useCarmack) {
            this.initBufferCarmack();
            this.render = this.renderCarmack;
        } else {
            this.render = this.renderOrigin;
        }

        this.initMapDataInfo();

        this.setViewPos(0, 0, true);

    },

    initImgDataInfo: function() {
        this.imgTileCols = Math.floor(this.img.width / this.tileWidth);
        this.imgTileRows = Math.floor(this.img.height / this.tileHeight);
        this.maxTileIndex = this.imgTileRows * this.imgTileCols - 1 + this.startTileIndex;
    },

    initMapDataInfo: function() {

        this.emptyTileInfo = this.emptyTileInfo || {
            no: 0,
            col: 0,
            row: 0,
            iX: 0,
            iY: 0,
            iNo: 0
        };

        this.mapDataInfo = [];
        for(var r = 0; r < this.mapDataRows; r++) {

            this.mapDataInfo[r] = [];

            for(var c = 0; c < this.mapDataCols; c++) {
                var no = this.mapData[r][c];
                var tile = this.createTile(c, r, no);
                this.mapDataInfo[r][c] = this.initTile(tile) || tile;
            }

        }

    },
    createTile: function(c, r, no) {

        var tile = {
            no: no,
            col: c,
            row: r
        };
        if(this.img) {
            var clean = no === null || no === undefined || no < this.startTileIndex || no > this.maxTileIndex;
            var imgNo = no - this.startTileIndex;
            var imgX = (imgNo % this.imgTileCols) * this.tileWidth;
            var imgY = Math.floor(imgNo / this.imgTileCols) * this.tileHeight;
            tile.iX = imgX;
            tile.iY = imgY;
            tile.iNo = clean ? null : imgNo;
        }
        return tile;
    },

    initTile: function(tile) {

        return tile;
    },


    setViewPos: function(vx, vy, force) {

        this.viewX = vx;
        this.viewY = vy;

        this.viewCol = Math.floor(this.viewX / this.tileWidth);
        this.viewRow = Math.floor(this.viewY / this.halfTileHeight);

        this.tileOffsetX = this.viewX - (this.viewCol * this.tileWidth);
        this.tileOffsetY = this.viewY - (this.viewRow * this.halfTileHeight);

        if(force || this.lastViewX !== this.viewX || this.lastViewY !== this.viewY) {
            this.scrolled = true;
            if(force) {
                this.lastViewRow = this.viewRow - this.viewRows;
            }
        }

    },
    saveLastState: function() {
        this.lastViewX = this.viewX;
        this.lastViewY = this.viewY;

        this.lastViewCol = this.viewCol;
        this.lastViewRow = this.viewRow;
    },

    initBufferCarmack: function() {
        this.buffer = document.createElement("canvas");
        this.buffer.width = this.bufferWidth = this.viewCols * this.tileWidth + this.halfTileWidth;
        this.buffer.height = this.bufferHeight = this.viewRows * this.halfTileHeight + this.halfTileHeight;
        this.bufferContext = this.buffer.getContext("2d");
    },

    updateBufferCarmack: function() {

        var colFrom, colTo;
        var rowFrom, rowTo;

        if(this.viewCol !== this.lastViewCol) {
            if(this.viewCol > this.lastViewCol) {
                colFrom = this.lastViewCol + this.viewCols;
                colTo = this.viewCol + this.viewCols;
            } else {
                colFrom = this.viewCol;
                colTo = this.lastViewCol;
            }
            this.drawRegionCarmack(colFrom, this.viewRow, colTo, this.viewRow + this.viewRows);
        }

        if(this.viewRow !== this.lastViewRow) {

            if(this.viewRow > this.lastViewRow) {
                rowFrom = this.lastViewRow + this.viewRows;
                rowTo = this.viewRow + this.viewRows;
            } else {
                rowFrom = this.viewRow;
                rowTo = this.lastViewRow;
            }
            this.drawRegionCarmack(this.viewCol, rowFrom, this.viewCol + this.viewCols, rowTo);
        }

    },

    drawRegionCarmack: function(fromCol, fromRow, toCol, toRow) {
        var dataCol = Math.ceil((fromCol * 2 + fromRow) / 2);
        var dataRow = fromRow - dataCol;
        var even = fromRow % 2 == 0;

        var rowInBuffer = fromRow % this.viewRows;
        rowInBuffer = (rowInBuffer + this.viewRows) % this.viewRows;

        var colInBuffer = fromCol % this.viewCols;
        colInBuffer = (colInBuffer + this.viewCols) % this.viewCols;

        var _colInBuffer, _rowInBuffer;


        _rowInBuffer = rowInBuffer;
        for(var r = fromRow; r < toRow; r++) {

            var col = dataCol,
                row = dataRow;

            _colInBuffer = colInBuffer;
            for(var c = fromCol; c < toCol; c++) {

                var tileInfo = null;
                var _row = this.getNewRow(row);
                if(_row != null) {
                    var _col = this.getNewCol(col);
                    if(_col != null) {
                        tileInfo = this.mapDataInfo[_row][_col];
                    }
                }

                tileInfo = !tileInfo || !tileInfo.iNo ? this.emptyTileInfo : tileInfo;
                var x = _colInBuffer * this.tileWidth + (_rowInBuffer % 2 != 0 ? (this.halfTileWidth) : 0);
                var y = _rowInBuffer * this.halfTileHeight;
                this.bufferContext.drawImage(this.img, tileInfo.iX, tileInfo.iY, this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight);
                // this.bufferContext.strokeText(dataCol+","+dataRow,x+50,y+30)
                _colInBuffer = (++_colInBuffer) % this.viewCols;

                col++;
                row--;
            }

            if(even) {
                dataCol++;
            } else {
                dataRow++;
            }
            even = !even;

            _rowInBuffer = (++_rowInBuffer) % this.viewRows;

        }
    },

    updateBufferInfoCarmack: function() {
        this.bufferCol = this.viewCol % this.viewCols;
        this.bufferCol = (this.bufferCol + this.viewCols) % this.viewCols;
        this.bufferOffsetX = this.tileOffsetX + (this.bufferCol * this.tileWidth) + this.halfTileWidth;

        this.bufferRow = this.viewRow % this.viewRows;
        this.bufferRow = (this.bufferRow + this.viewRows) % this.viewRows;
        this.bufferOffsetY = this.tileOffsetY + (this.bufferRow * this.halfTileHeight) + this.halfTileHeight;

    },


    renderCarmack: function(context) {
        if(this.scrolled) {
            this.updateBufferCarmack();
            this.updateBufferInfoCarmack();
            this.saveLastState();
            this.scrolled = false;
        }
        var ox = this.bufferOffsetX;
        var oy = this.bufferOffsetY;
        var x, y;

        for(var r = 0; r < 2; r++) {
            for(var c = 0; c < 2; c++) {
                x = c * (this.bufferWidth - this.halfTileWidth) - ox;
                y = r * (this.bufferHeight - this.halfTileHeight) - oy;
                context.drawImage(this.buffer, x, y);
            }
        }

        
    },

    renderOrigin: function(context) {

        if(this.scrolled) {
            this.saveLastState();
        }

        var mapDataInfo = this.mapDataInfo;
        var rr = this.viewRow - 1;
        for(var r = -1; r < this.viewRows - 1; r++) {
            var cc = this.viewCol;
            for(var c = 0; c < this.viewCols; c++) {
                var dataCol = Math.ceil((cc * 2 + rr) / 2);
                var dataRow = rr - dataCol;
                var tileInfo = this.mapDataInfo[dataRow] ? this.mapDataInfo[dataRow][dataCol] : 0;
                if(tileInfo && tileInfo.iNo) {
                    var x = c * this.tileWidth + (rr % 2) * this.halfTileWidth;
                    var y = r * this.halfTileHeight;
                    var xx = x - this.tileOffsetX - this.halfTileWidth;
                    var yy = y - this.tileOffsetY;

                    context.drawImage(this.img, tileInfo.iX, tileInfo.iY, this.tileWidth, this.tileHeight, xx, yy, this.tileWidth, this.tileHeight);
                }

                cc++;
            }
            rr++;
        }

    },
    render: null,
    update: function(timeStep) {

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


    getMapPos: function() {
        var ix = this.y + this.x * this.this.viewScaleY;
        var iy = this.y - this.x * this.this.viewScaleY;
        return [ix, iy];
    },

    setMapPos: function(x, y, force) {
        var vx = x - y;
        var vy = (x + y) * this.this.viewScaleY;
        this.setViewPos(vx, vy, force);
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

    getTileInfoByPx: function(x, y) {

        var f = this.mapPxToMapTile(x, y);

        return f ? this.getTileInfo(f.col, f.row) : null;

    },


    getTileInfo: function(c, r) {
        r = this.mapDataInfo[r];
        return r ? r[c] : null;
    },

    getNewColCircle: function(c) {
        var _c = c % this.mapDataCols;
        return _c < 0 ? this.mapDataCols + _c : _c;
    },
    getNewRowCircle: function(r) {
        var _r = r % this.mapDataRows;
        return _r < 0 ? this.mapDataRows + _r : _r;
    },

    getNewCol: function(c) {
        return c < 0 || c >= this.mapDataCols ? null : c;
    },
    getNewRow: function(r) {
        return r < 0 || r >= this.mapDataRows ? null : r;
    },

    reset: function() {
        this.init(this.game);
    },

    destroy: function() {
        this.game = null;
        this.mapDataInfo = null;
        this.mapData = null;
    },

    arrTo2dArr: function(arr, cols) {
        cols = cols || 1;
        var mapData2 = [];
        var rows = Math.floor((arr.length + cols) / cols) - 1;
        var r = 0,
            c = 0,
            i = 0;
        for(r = 0; r < rows; r++) {
            mapData2[r] = [];
            for(c = 0; c < cols; c++) {
                mapData2[r][c] = arr[i++];
            }
        }
        return mapData2;
    }

}