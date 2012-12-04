

;(function(scope,undefined){



var ViewTriangle = scope.ViewTriangle = function(cfg) {
		for (var key in cfg) {
			this[key] = cfg[key];
		}
		
		this.static=false;
		this.centroid=[this.x,this.y];


		this.setRadius(this.radius);
		this.setAngle(this.angle);
		this.updateTriangle()

	};



var PT={
	constructor : ViewTriangle,

	ZERO : 0.0004 ,
	radius : 100,
	angle : 70 ,

	viewPoint : null,
	rightPoint : null,
	leftPoint : null,
	
	init : function(){
		this.initBase();
		this.initView();
	},

	changeShape : function(angle,radius){
		this.centroid=[this.x,this.y];
		this.setAngle(angle||this.angle);
		this.setRadius(radius||this.radius);
		this.updateTriangle();
		this.init();
	},

	setRadius: function(radius){
		this.radius=radius;
		this.radiusSq=this.radius*this.radius;
	},

	setAngle : function(angle){

		this.angle=angle;
		this.halfAngle=angle/2;
		this.tanHalfAngle=Math.tan(this.halfAngle);
		this.cosHalfAngle=Math.cos(this.halfAngle);

	},
	updateTriangle : function(){
		var x=this.centroid[0], y=this.centroid[1]
		this.vertices=[
			[x, y],
			// [x+this.radius, y],
			[x+this.radius,  y-this.radius*this.tanHalfAngle ],
			[x+this.radius,  y+this.radius*this.tanHalfAngle ]
		];
	},

	initView : function(){

		this.frontLineNo=2;
		this.waistLength=this.radius / this.cosHalfAngle
		this.waistLengthSq= this.waistLength * this.waistLength ;


		var vp=this.viewPoint=this.vertices[0];
		var lp=this.leftPoint=this.vertices[1];
		var rp=this.rightPoint=this.vertices[2];

		vp.pid=rp.pid=lp.pid=-1;

		vp.no=0;
		vp.start=true;
		vp.end=false;

		rp.no=1;
		rp.start=true;
		rp.end=false;
		rp.disSq=this.waistLengthSq;

		lp.no=2;
		lp.start=false;
		lp.end=true;
		lp.disSq=this.waistLengthSq;
		
		this.frontSide=[rp,lp];

		this.borderCross=[];
		this.edgeList=[];
	},

	updateAABB : function(){
		var vp=this.vertices[0], lp=this.vertices[1], rp=this.vertices[2];
		var minX=Math.min(vp[0],lp[0],rp[0])-1;
		var minY=Math.min(vp[1],lp[1],rp[1])-1;
		var maxX=Math.max(vp[0],lp[0],rp[0])+1;
		var maxY=Math.max(vp[1],lp[1],rp[1])+1;

		this.aabb[0]=minX;
		this.aabb[1]=minY;
		this.aabb[2]=maxX;
		this.aabb[3]=maxY;

	},

	normalLine : function(p1, p2) {

		var nx = p2[1] - p1[1];
		var ny = p1[0] - p2[0];

		var np=nx*p1[0]+ny*p1[1];
		
		return [nx, ny , np ];
	},


	containPoint : function(x,y ){
		// return this.aabb[0]<x && x<this.aabb[2] &&  this.aabb[1]<y && y<this.aabb[3]
					// && Polygon.containPoint(this.vertices,x,y);
		var c=this.aabb[0]<x && x<this.aabb[2] &&  this.aabb[1]<y && y<this.aabb[3];
		var dx=x-this.x , dy=y-this.y;
		if (!c || ( Math.pow( dx , 2)+Math.pow( dy , 2)>=this.radiusSq )){
			return false
		}
		var ldx=this.leftPoint[0]-this.x;
		var ldy=this.leftPoint[1]-this.y;
		var q1=this.getQuadrant( ldx,ldy );
		var rotateQuadrant = q1<3;
		if (rotateQuadrant){
			ldx=-ldx;
			ldy=-ldy;
			dx=-dx;
			dy=-dy;
		}
		var a1=Math.atan2(ldy, ldx);
		var a2=Math.atan2(dy, dx);
		return a2>a1 && a2<a1+this.angle;


	},

	canSee : function(x,y){

		var edgeCount=this.edgeList.length;

		var vp=this.viewPoint;
		var p=[x,y];
		var normal=this.normalLine(vp,p);
		for (var i=0;i<edgeCount;i++){
			var edge=this.edgeList[i];
			var sp=edge[0];
			var ep=edge[edge.length-1];
			var n=this.normalLine(sp,ep);
			if ( this.checkSegmentCross(vp,p,normal,sp,ep,n) ){
				return false;
			}
		}

		return true;

	},

	getPolysInAABB : function(polys){

		var inPolys=[];
		var aabb1=this.aabb;
		for (var i=0;i<polys.length;i++){
			var p=polys[i];
			var aabb2=p.aabb;
			if ( aabb1[0]<aabb2[2] && aabb1[1]<aabb2[3] 
				&& aabb2[0]<aabb1[2] && aabb2[1]<aabb1[3] 
			){
				inPolys.push(p);
			}
		}
		return inPolys;
	},
 
	updateField : function(polys,force){

		this.tryUpdateVisibleEdge(polys,force);
		return this.getVisiblePointsOnEdge(this.edgeList);

	},

	tryUpdateVisibleEdge : function(polys, force){
		if (force || this.updatedCount!==this.edgeList.updatedCount){
			this.updateVisibleEdge(polys);
		}

	},

	updateVisibleEdge : function(polys){

		polys=this.getPolysInAABB(polys);

		var edgeList=this.edgeList;
		edgeList.updatedCount=this.updatedCount;
		edgeList.length=0;

		var fVertices=this.vertices;
		var fNormals=this.normals;
		var fVerCount=this.verticeCount;

		var viewPoint=this.viewPoint;
		var borderCross=this.borderCross;
		borderCross[0]=this.rightPoint;
		borderCross[1]=this.leftPoint;

		var polyCount=polys.length;
		
		// 建立edge(viewPoint在edge外侧, edge的点在视野内) , 并求出edge和视野边界的交点 & 远端视野裁剪
		// 
		for (var i=0;i<polyCount;i++ ){
			var edgeId=i;

			var edge1=[];
			var edge2=[];
			var edge=edge1;

			var poly=polys[i];
			var vertices=poly.vertices;
			var normals=poly.normals;
			var verCount=poly.verticeCount;

			var lastP=vertices[verCount-1];
			var lastN=normals[verCount-1];
			var lastDet=viewPoint[0]*lastN[0]+viewPoint[1]*lastN[1]-lastN[2];

			for (var k = 0; k < verCount; k++) {
				var p=vertices[k] , px=p[0] , py=p[1];
				var n=normals[k];
				var det=viewPoint[0]*n[0]+viewPoint[1]*n[1]-n[2];
				// if (lastDet==0 && det==0){
				// 	continue;
				// }
				if (lastDet>=0){
					var pp=[ lastP[0], lastP[1] ];
					pp.pid=edgeId;
					pp.normal=lastN;
					edge.push(pp);
					if (det<0){ // det<=0
						pp=[ p[0], p[1] ];
						pp.pid=edgeId;
						pp.normal=n;
						edge.push(pp);
						edge=edge2;
					}
				}
				lastP=p;
				lastN=n;
				lastDet=det;
			}
			if (edge1.length+edge2.length<2){
				continue;
			}
			edge=edge2.concat(edge1);
			edge.id=edgeId;

			// drawPath(context,edge,"red");

	// 以上找到多边形里 面向视点的边, 构成若干条路径(edge)
	// 以下对路径进行裁剪, 保留在视野内的路径 并做适当裁剪

			var lastPoint=fVertices[fVerCount-1];
			var lastNormal=fNormals[fVerCount-1];
			for (var j=0; j<fVerCount;j++){
				var point=fVertices[j];
				var normal=fNormals[j];
				var normalX=lastNormal[0], normalY=lastNormal[1], normalP=lastNormal[2];

				var edgeLen=edge.length;
				var lastP=edge[0];
				lastP.no=0;
				var lastN=lastP.normal;
				var lastDet=normalX*lastP[0]+normalY*lastP[1]-normalP;
				var headIdx=0;
				var tailIdx=edgeLen;
				var coll=false;
				var allOutside=true;
				for (var k=1;k<edgeLen;k++){
					var p=edge[k];
					p.no=k;
					var n=p.normal;

					var det = normalX * p[0] + normalY * p[1] - normalP;
					if (det*lastDet<=0){
						var denominator = normalX * lastN[1]  - normalY * lastN[0] ;
						if (denominator!=0){
							var det1= lastN[0] * lastPoint[0] + lastN[1] * lastPoint[1]-lastN[2];
							var det2= lastN[0] * point[0] + lastN[1] * point[1]-lastN[2];

							if (det1*det2<0){
								coll=true;
								var fraction= det1 / denominator;
								var dx=fraction * normalY , dy= - fraction * normalX;

								var x=lastPoint[0] + dx, y=lastPoint[1] + dy ;

								var cp=[x,y];

								cp.normal=lastN;
								cp.dd=[dx,dy];					        
								cp.pid=edgeId;
								if (j==this.frontLineNo){
									if (lastDet>=0){
										headIdx=lastP.no;
										cp.no=headIdx;
									}else{
										tailIdx=p.no+1;
										cp.no=p.no;									
									}
									edge[cp.no]=cp;
								}else {
									cp.no=lastP.no+0.5;
									cp.disSq=dx*dx+dy*dy;
									var lc=borderCross[j];
									(j==0) && (cp.disSq=-cp.disSq);
									if ( cp.disSq<=lc.disSq){
										lc.dead=true;
										borderCross[j]=cp;
									}
									if(lastDet>=0){
										headIdx=k-1;
										lastP.dead=true;
										if (headIdx>0
											// && nearByPoints(cp,lastP,14)
											){
											headIdx--;
											edge[headIdx].dead=true;
										 }
									}else if(det>=0){
										tailIdx=k+1;
										p.dead=true;
										if (tailIdx<edgeLen 
											// && nearByPoints(cp,p,14)
											){
											tailIdx++;
											edge[tailIdx-1].dead=true;				        		
										}
									} 
								}

							}
						}
					}else{

					}
					if (lastDet<=0 || det<=0  ){
						allOutside=false;
					}

					lastN=n;
					lastP=p;
					lastDet=det;
				}
				if (allOutside){
					edge=null;
					break;
				}

				if (coll){
					edge=edge.slice(headIdx,tailIdx);
				}		
				lastPoint=point;
				lastNormal=normal;

			}
			if (!edge || edge.length<2){
				continue;
			}
			if(!coll){
				// TODO
				coll=this.checkEdgePolyCollide(edge,fVertices);

				if (!coll){
					edge=null;
				}
			}
			if (edge){
				edge.id=edgeId;
				var lastPoint=edge[edge.length-1];
				lastPoint.normal=Polygon.computeNormal(lastPoint,edge[0]);
				edge[0].start=true;
				lastPoint.end=true;
				edgeList.push(edge);

				// drawPath(context,edge,"red");
			}

		}

		return edgeList;

	},


	getVisiblePointsOnEdge : function(edgeList){

		var edgeCount=edgeList.length;

		var fVertices=this.vertices;
		var fNormals=this.normals;
		var viewPoint=this.viewPoint;
		var leftPoint=this.leftPoint;
		var rightPoint=this.rightPoint;

		var frontSide=this.frontSide;
		var n=fNormals[1]
		rightPoint.normal=[-n[0],-n[1],-n[2]];
	
		var crossPoints=[];
		var checkPoints=[];

		// 探测edge里的dead点, (dead点 : 与视点的连线不与其他edge相交 )

		for (var i=0;i<edgeCount;i++){
			var edge=edgeList[i];
			for (var j=0,edgeLen=edge.length;j<edgeLen;j++){
				var point=edge[j];

				if (!point.dead){

					// drawLine(context,viewPoint,point,"#999999",1)

					var _normal=Polygon.computeNormal(viewPoint,point);
					var coll=false;
					for (var k=0;k<edgeCount;k++){
						if (k!=i){
							var _edge=edgeList[k];
							var lastPoint=_edge[_edge.length-1];
							//取得线段交点
							var coll=this.checkSegmentCross( viewPoint,point,_normal, 
										lastPoint,_edge[0],lastPoint.normal );
							if (coll){
								point.dead=true;
								break;
							}
						}
					}

					if (!coll && ( j==0 || j==edgeLen-1)){
						point.normalToView=_normal;
					}				
				}
			}
		}


		// 找出edge的非dead端点 与视点连线(视点到端点的射线), 求出射线与所有edge的最近交点

		edgeList.push(frontSide);
		var checkEdgeCount=edgeCount+1;

		for (var i=0;i<edgeCount;i++){
			var edge=edgeList[i];
			var edgeLen=edge.length-1;
			for (var j=0;j<=edgeLen;j+=edgeLen){
				var point=edge[j];
				if (!point.dead){

					var normal=point.normalToView;
					var coll=false;
					var closestPoint=null,cp=null;
					var minDisSq=Infinity;
					for (var k=0;k<checkEdgeCount;k++){
						if (k!=i){
							var _edge=edgeList[k];
							//取得射线和edge的交点
							cp=this.getLineEdgeIntersPoints(viewPoint,point,normal,_edge);
							if (cp){
								var dis=cp.dd;
								dis=dis[0]*dis[0]+dis[1]*dis[1];
								if (dis<=minDisSq){
									closestPoint=cp;
									minDisSq=dis;
								}
							}
						}
					}
					if (closestPoint){
						cp=closestPoint;
						cp.pid= rightPoint.pid;
						crossPoints.push(cp);

						if (point.start){
							point.prev=cp;
						}else if(point.end){
							point.next=cp;
						}
					}
				}
			}
		}


		for (var i=0;i<edgeCount;i++){
			var edge=edgeList[i];
			for (var j=0,len=edge.length;j<len;j++){
				var p=edge[j];
				if ( !p.dead  ){	
					checkPoints.push(p);
				}
			}
		}

		var checkPoints=this.sortPoints(viewPoint,checkPoints) ;

// drawPoints(context,checkPoints,"red")

		checkPoints.unshift(this.borderCross[0]);
		checkPoints.push(this.borderCross[1]);
		checkPoints.unshift(viewPoint);

		return checkPoints;

	},

	sortPoints : function(center, pointList){
		var x=this.x , y=this.y;

		var dx=this.leftPoint[0]-x;
		var dy=this.leftPoint[1]-y;
		var q1=this.getQuadrant( dx,dy );

		var rotateQuadrant = q1<3;
		for (var i=0;i<pointList.length;i++){
			var point=pointList[i];
			var px=point[0],  py=point[1];
			var dx=px-x, dy=py-y;

			if (rotateQuadrant){
				dx=-dx;
				dy=-dy;
			}
			point.r=Math.atan2(dy,dx);
		}

		pointList.sort(this._sortByAtan2);
		return pointList;

	},

	_sortByAtan2 : function(p1,p2){

		var deltaR=p2.r-p1.r;

		if ( Math.abs(deltaR)<0.0004 ){
			if (p1.pid==p2.pid){
				return p1.no-p2.no;
			}
			if ( p2.end && !p1.start && !p1.end
				|| p1.start && (p2.end || !p2.start) ){
				return 1;
			}

			if (p2.start && !p1.start && !p1.end 
				|| p1.end && (p2.start || !p2.end) ){
				return -1;
			}
			return 0;
		}

		return deltaR;

	},


	//取得向量所在区间
	getQuadrant : function(x,y){
		if ( x < 0){
            return y < 0?3:2;
        }else{
            return y < 0?4:1;
        }
	},

	// 判断线段是否相交 (已知法线向量)
	checkSegmentCross : function( aP1,aP2, aNoraml, bP1,bP2, bNoraml )  {
  	
        var aX1=aP1[0], aY1=aP1[1];
     	var aX2=aP2[0], aY2=aP2[1];           
   		var bNx=bNoraml[0], bNy=bNoraml[1], bNp=bNoraml[2];


        if ( (bNx * aX1  + bNy * aY1-bNp)*(bNx * aX2  + bNy * aY2-bNp)>=-this.ZERO  ) {
        	return false;
        } 

      	var bX1=bP1[0], bY1=bP1[1];
        var bX2=bP2[0], bY2=bP2[1];
        var aNx=aNoraml[0], aNy=aNoraml[1], aNp=aNoraml[2];	

        if ( (aNx * bX1  + aNy * bY1-aNp)* (aNx * bX2  + aNy * bY2-aNp) >=-this.ZERO  ) {
        	return false;
        }

       	return true;
    },

   	// 判断edge与多边形是否相交
	checkEdgePolyCollide : function(edge, polyVertices) {
		var len1 = edge.length,
			len2 = polyVertices.length;

		for (var i = 0; i < len1; i++) {
			var q=edge[i];
			var n=q.normal;
			var nx=n[0],ny=n[1],np=n[2];
			var allOutside = true;
			for (var j = 0; j < len2; j++) {
				var v=polyVertices[j];
				var vx = v[0];
				var vy = v[1];
				var det = nx * vx + ny * vy - np;
				if (det < 0) {
					allOutside = false;
					break;
				}
			}
			if (allOutside){
				return false;
			}
		}
		return true;
	},

	//取得射线(p1 ,p2)与edge的交点
	getLineEdgeIntersPoints : function(p1, p2, normal, edge){
		
		var normalX=normal[0],normalY=normal[1],normalP=normal[2];
		var crossPoint=null;
		var edgeLen=edge.length;
		var allOutside = true;

		var startP=edge[0];
		var endP=edge[edgeLen-1];
		var startDet=normalX * startP[0] + normalY * startP[1] - normalP;
		var endDet=normalX * endP[0] + normalY * endP[1] - normalP;

		var detX=startDet*endDet;
		if (detX>=0){
			return crossPoint;
		}

		var inout=startDet<=0;
		var lastP=startP;
		var lastDet=startDet;
		var lastN = lastP.normal;

		for (var i = 1; i < edgeLen; i++) {
			var p=edge[i] , px=p[0] , py=p[1];
			var n=p.normal;
			var det = normalX * px + normalY * py - normalP;
			var detX=det*lastDet;

			if (  detX<=0   ){

				var aNx=normal[0], aNy=normal[1], aNp=normal[2];
				var bNx=lastN[0], bNy=lastN[1], bNp=lastN[2];

			   var denominator = aNx * bNy  - aNy * bNx  ;
				
				if (denominator==0){
					// console.log("denominator==0 " ,denominator)
					return false;
				}

				var det1=bNx * p1[0]  + bNy * p1[1]-bNp;
				// var det2= bNx * p2[0]  + bNy * p2[1]-bNp;
		
		        if ( det1*denominator>=0 && 
		        	 (bNx * p2[0]  + bNy * p2[1]-bNp) *denominator>=0  ) {
		        	// console.log("out of ray endpoint")
		        	return false;
		        }


				var fraction= det1 / denominator;
				var dx=fraction * aNy , dy= - fraction * aNx;
				var x=p1[0] + dx, y=p1[1] + dy ;

				var cp=[ x , y , lastN];
				cp.dd=[dx,dy];
				cp.no=lastP.no+0.5;
				cp.pid=edge.id;
				crossPoint=cp;
				return crossPoint;
			}

			lastDet=det;
			lastP=p;
			lastN=n;
		}
		return crossPoint;
	}



	};



	var PPT=Polygon.prototype;
	for (var p in PPT){
		ViewTriangle.prototype[p]=PPT[p];
	}
	for (var p in PT){
		ViewTriangle.prototype[p]=PT[p];
	}

}(this));




