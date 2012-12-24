function MovePath(cfg) {
    merger(this, cfg);
}

MovePath.prototype = {

    constructor: MovePath,

    points : null , //[]

    setPoints : function(points){
        this.points=[];
        var len=points.length;
        var last=points[0];
        this.points.push([
            last.x,
            last.y
        ]);
        for (var i=1;i<len;i++){
            var node=points[i];
            var p=[
                node.x,
                node.y,
            ];
            var dx=node.x-last.x ,
                dy=node.y-last.y;
            var rad=Math.atan2( dy , dx );
            p[2]=Math.cos(rad);
            p[3]=Math.sin(rad);
            p[4]=rad;
            this.points.push(p);
            last=node;
        }
        // console.log(points)
    },

    update : function(entity){

        var pos=this.points[entity.targetIndex];

        if (!pos){
            return;
        }

        var dx=pos[0]-entity.x,
            dy=pos[1]-entity.y;
        
        if (dx*entity.dx >=0){
            if (Math.abs(entity.dx)>=Math.abs(dx) ){
                entity.dx=0;//dx;
                entity.vx=0;
                entity.x=pos[0];
            }
        }
        //
        if (dy*entity.dy >=0){
            if (Math.abs(entity.dy)>=Math.abs(dy) ){
                entity.dy=0;//dy;
                entity.vy=0;
                entity.y=pos[1];
            }
        }
        if (!entity.vx && !entity.vy){
            entity.targetIndex++;
            var nextPos=this.points[entity.targetIndex];
            if (nextPos){
                entity.vx=entity.velocity*nextPos[2];
                entity.vy=entity.velocity*nextPos[3];
                entity.rotation=nextPos[4];
            }
        }
    },

    isFinished : function(){

    },
    getVelocity : function(current,next){
    	
    }

}

