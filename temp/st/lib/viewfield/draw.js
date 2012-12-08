




function getRandom(lower, higher) {
	return Math.floor( (higher - lower + 1) * Math.random() ) + lower;
}



function createRandomPoly(n, w,h){

	n=n||4;
	h=h||w;
	var radius= w/2;
	var scaleX=scaleX||1;
	var scaleY=scaleY|| scaleX*h/w;

	var skew=Math.PI/10;

	var skewX=w>h?Math.tan(skew):0;
	var skewY=h>w?Math.tan(skew):0;

	// console.log(skewX,skewY)

	var vertices=[];
	var perAng=Math.PI*2/n;
	var fix= perAng*100>>2;
	for (var i=0;i<n;i++ ){
		var ang=perAng*i+ getRandom( -fix,fix)/100;
		var _x= radius*Math.cos(ang);
		var _y= radius*Math.sin(ang);

		var x=_x*scaleX + _y*scaleY*skewX;
		var y=_y*scaleY + _x*scaleX*skewY;
		vertices.push( [x,y]);
	}
	var poly=new Polygon({
		vertices : vertices
	})
	poly.init();
	return poly;
}



function drawNormals(context,poly){

	var normals=context.normals;
	normals.forEach(function(n,idx){
		if (idx>2){
			return
		}
		var v= context.vertices[idx];
		// console.log(v,[ v[0]+n[0],v[1]+n[1] ])
		drawLine(Game.context, v, [ v[0]+50*n[0],v[1]+50*n[1] ],"red" )
	})
}
function drawPoint(context,px,py,color){
	var bak=context.fillStyle;
	context.fillStyle=color||bak;
	context.fillRect(px-2,(py-2),4,4);
	//context.fillStyle=bak;
}

function drawPoints(context,pointLists,color,fill){
	pointLists.forEach(function(p,i){
		drawCircle(context, p[0],p[1],(i+1)*2,color||"red", fill)
	})
}

function drawLine(context,p1,p2, color){
	var bak=context.strokeStyle;
	context.strokeStyle=color||bak;
	context.beginPath();
	context.moveTo( p1[0], p1[1] );
	context.lineTo( p2[0], p2[1] );
	context.stroke();
	context.closePath();
	context.strokeStyle=bak;	
}

function drawBox(context,poly, height, rotation , color ){
	// return drawPoly(context,poly, color ,fill);

	color=color||"gray";
	var ox=-height*Math.SQRT2,
		oy=-height*Math.SQRT2;

	var cos=Math.cos(rotation);
	var sin=Math.sin(rotation);

	var ty=HEIGHT/2;

	context.save();

	context.beginPath();

	var py=(poly[0][1]-ty)*SCALE[1]+ty +oy;
	var p=[
		poly[0][0]*SCALE[1] , //*cos-py*sin,
		poly[0][1]*SCALE[1]//*sin+py*cos
	]
	context.moveTo( p[0] , p[1] );
	for (var i=0,len=poly.length;i<len;i++){
		var idx=(i+1)%len;	
		var py=(poly[idx][1]-ty)*SCALE[1]+ty +oy;
		var p=[
			poly[idx][0]*SCALE[1], //*cos-py*sin,
			poly[idx][1]*SCALE[1]//*sin+py*cos
		]

		context.lineTo( p[0] ,p[1] );
	}
	context.fillStyle="rgba(30,30,30,0.6)"
	context.fill();
	context.stroke();

	context.closePath();

	context.beginPath();
	context.moveTo( poly[0][0]+ox ,(poly[0][1]-ty)*SCALE[1]+ty +oy );
	for (var i=0,len=poly.length;i<len;i++){
		var idx=(i+1)%len;	      		
		context.lineTo( poly[idx][0]+ox ,(poly[idx][1]-ty)*SCALE[1]+ty+oy );
		context.lineTo( poly[idx][0] ,(poly[idx][1]-ty)*SCALE[1]+ty );
		context.moveTo( poly[idx][0]+ox ,(poly[idx][1]-ty)*SCALE[1]+ty+oy );
	}


	context.stroke();
	
	context.closePath();
	
	context.restore();
}

function drawPoly(context,poly, color ,fill){
	var bak=context.strokeStyle;
	context.strokeStyle=color||bak;	
	context.beginPath();
	context.moveTo( poly[0][0] ,poly[0][1] );
	for (var i=0,len=poly.length;i<len;i++){
		var idx=(i+1)%len;	      		
		context.lineTo( poly[idx][0] ,poly[idx][1] );
	}
	if (fill){
		context.fillStyle=color||bak;	
		context.fill();
	}else{
		context.stroke();
	}	
	context.closePath();

	context.strokeStyle=bak;	
}

function drawAABB(context,aabb, color){
	var bak=context.strokeStyle;
	context.strokeStyle=color||bak;	
	context.strokeRect( aabb[0], aabb[1], aabb[2]-aabb[0], aabb[3]-aabb[1]);

	context.strokeStyle=bak;	
}

function drawCircle(context,x,y,r ,color,fill){
	// console.log(context,x,y,r ,color,fill)
	var bak=context.strokeStyle;
	context.strokeStyle=color||bak;
 	context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
	if (fill){
		context.fillStyle=color||bak;	
		context.fill();
	}else{
		context.stroke();
	}
    context.closePath();
    context.strokeStyle=bak;
}

	function drawView (context, pointList , color,fill ){
		var scaleY= this.scaleY || 1;
		var lastPoint=pointList[0];
		context.beginPath();
		context.moveTo( lastPoint[0] ,lastPoint[1]*scaleY );
		var iii=0;
		context.font="20pt Arial";
		for (var i=1,len=pointList.length;i<len;i++){
			var idx=i;
			var point=pointList[idx];
			if (point.next){
				// context.fillText(++iii+"_"+point.q,point[0] ,point[1]*scaleY);
				context.lineTo( point[0] ,point[1]*scaleY );

				// context.fillText( ++iii+"n",point.next[0] ,point.next[1]*scaleY);
				context.lineTo( point.next[0] ,point.next[1]*scaleY );
			}else if (point.prev){
				// context.fillText(++iii+"p",point.prev[0] ,point.prev[1]*scaleY);
				context.lineTo( point.prev[0] ,point.prev[1]*scaleY );

				// context.fillText(++iii+"_"+point.q,point[0] ,point[1]*scaleY);
				context.lineTo( point[0] ,point[1]*scaleY );
			}else{
				// context.fillText(++iii+"_"+point.q,point[0] ,point[1]*scaleY);
				context.lineTo( point[0] ,point[1]*scaleY );
			}
		}
		context.lineTo( pointList[0][0] ,pointList[0][1]*scaleY );
		if (fill){
			context.fillStyle=color;	
			context.fill();	
		}else{
			context.strokeStyle=color;
			context.stroke();		
		}
		context.closePath();

	}

function drawPath(context,path, color,width){
	if (!path || !path.length){
		return;
	}
	width=width||1;
	context.lineWidth=width;
	var bak=context.strokeStyle;
	context.strokeStyle=color||bak;	
	context.beginPath();

	context.moveTo( path[0][0] ,path[0][1] );
	for (var i=0,len=path.length;i<len;i++){
			      		
		context.lineTo( path[i][0] ,path[i][1] );
	}
	context.stroke();
	context.closePath();
	context.lineWidth=1;

	// context.strokeStyle=bak;	
}


