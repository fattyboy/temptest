
;(function(scope,undefined){


	var Polygon=scope.Polygon=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	Polygon.prototype={
		constructor : Polygon,

		static : false ,

		updatedCount : 0,

		toString : function(){
			return JSON.stringify( this.vertices );
		},

		ignor : function(){},

		init : function(){
			this.initBase();
		},

		initBase : function(){
			this.origVertices=this.vertices||[];
			this.vertices=[];

			this.origNormals=[];
			this.normals=[];
			this.aabb=[];

			this.x=this.x||0;
			this.y=this.y||0;
			this.setRotation(this.rotation||0);
			this.verticeCount=this.origVertices.length;

		
			if (this.verticeCount>0){

				var centroid=this.centroid=this.centroid||Polygon.computeCentroid(this.origVertices);
				this.x=centroid[0];
				this.y=centroid[1];
				centroid[0]=centroid[1]=0;


				Polygon.computeNormals(this.origVertices,this.origNormals);

				for(var i=0; i<this.verticeCount; i++){
					var v=this.origVertices[i];
					this.vertices.push([]);
					this.normals.push([]);
					v[0]-=this.x;
					v[1]-=this.y;
				}
			}

			this.update();
		},

		setPos : function(x,y){
			this.lastX=this.x;
			this.lastY=this.y;
			this.x=x;
			this.y=y;
		},
		
		setRotation : function(rotation){
			this.lastRotation=this.rotation;
			this.rotation=rotation;
			this.cos=Math.cos(rotation);
			this.sin=Math.sin(rotation);
		},


		update : function(){
			this.updateVertices();
			this.updateNormals();
			this.updateAABB();
			this.updatedCount++;
		},

		updateVertices : function(){
			var len=this.verticeCount;
			for (var i=0;i<this.verticeCount;i++){
				var ov=this.origVertices[i];
				var px=ov[0], py=ov[1];
				var x= px*this.cos- py*this.sin;
				var y= px*this.sin+ py*this.cos;
				var v=this.vertices[i];
				v[0]=x+this.x;
				v[1]=y+this.y;
			}
		},

		updateNormals : function(){
			for (var i=0;i<this.verticeCount;i++){
				var on=this.origNormals[i];
				var x= this.cos * on[0] - this.sin * on[1];
				var y= this.sin * on[0] + this.cos * on[1];

				var n=this.normals[i];
				n[0]=x;
				n[1]=y;

				var v=this.vertices[i];
				n[2]=x*v[0]+y*v[1];
			}
		},

		updateAABB : function(){
			var minX=Number.MAX_VALUE, minY=Number.MAX_VALUE;
			var maxX=-minX, maxY=-minY;
			var len=this.verticeCount;

			for(var i =0;i <len; i++){
				var v=this.vertices[i];

				if (v[0]<minX){
					minX=v[0];
				}

				if (v[0]>maxX){
					maxX=v[0];
				}

				if (v[1]<minY){
					minY=v[1];
				}
				if (v[1]>maxY){
					maxY=v[1];
				}
				
			}
			this.aabb[0]=minX;
			this.aabb[1]=minY;
			this.aabb[2]=maxX;
			this.aabb[3]=maxY;

			return this.aabb;

		}

	};


Polygon.computeAABB=function(vertices,aabb) {
	aabb=aabb||[];
	var minX=Number.MAX_VALUE, minY=Number.MAX_VALUE;
	var maxX=-minX, maxY=-minY;
	var len=vertices.length;

	for(var i =0;i <len; i++){
		var v=vertices[i];

		if (v[0]<minX){
			minX=v[0];
		}

		if (v[0]>maxX){
			maxX=v[0];
		}

		if (v[1]<minY){
			minY=v[1];
		}
		if (v[1]>maxY){
			maxY=v[1];
		}
		
	}
	aabb[0]=minX;
	aabb[1]=minY;
	aabb[2]=maxX;
	aabb[3]=maxY;

	return aabb;

}


Polygon.computeCentroid=function(vertices) {

		var len=vertices.length;
	
		var c = [0,0];

		var area = 0;	

		var v0= vertices[len-1];
		var x1=v0[0], y1=v0[1];
		for (var i = 0; i < len; ++i){
	
			var v1= vertices[i];
			var x2=v1[0], y2=v1[1];

			var triangleArea2 = (x1 * y2 - y1 * x2) ;
			area += triangleArea2;
			
			c[0] += triangleArea2 * (x1 + x2);
			c[1] += triangleArea2 * (y1 + y2);

			x1=x2;
			y1=y2;
		}

		c[0] /= area*3;
		c[1] /= area*3;

		return c;
	};


Polygon.cloneVertices=function(vertices,newVertices){
	newVertices=newVertices||[];
	for (var i=0,len=vertices.length;i<len;i++){
		var v=vertices[i];
		newVertices.push( v.slice()	);
	}
	return newVertices;
}


Polygon.computeNormal = function(v0, v1) {

		var nx = v1[1] - v0[1];
		var ny = v0[0] - v1[0];

		var length = Math.sqrt(nx * nx + ny * ny);
		nx /= length;
		ny /= length;

		var np=nx*v0[0]+ny*v0[1];
		
		return [ nx, ny , np ];
	};

Polygon.computeNormals = function(vertices,normals){
		var len=vertices.length;
		normals=normals||[];
		normals.length=0;
		var normal, vertex, lastVertex = vertices[len - 1];
		for (var i = 0; i < len; i++) {
			vertex = vertices[i];
			normal= Polygon.computeNormal(lastVertex, vertex);
			normals.push(normal);
			lastVertex = vertex;
		}
		normals.push( normals.shift() );
		return 	normals;	
	}


Polygon.containPoint= function(vertices,x, y) {
	var len = vertices.length;
	var p = vertices[len - 1], px = p[0] , py = p[1];
	var found = 0;

	for (var i = 0; i < len; i++) {
		var q = vertices[i], qx = q[0], qy = q[1];

		var minX, maxX;
		if (px < qx) {
			minX = px;
			maxX = qx;
		}else {
			minX = qx;
			maxX = px;
		}

		if (x >= minX && x <= maxX) {
			var det = (qy - py) * (x-px)+ (px - qx) * (y-py);
			if (det >= 0) {
				return false;
			}
			if (found == 1){
				return true;
			}
			found++;// one edge found.
		}

		px = qx;
		py = qy;
	}

	return false;
}

}(this));

