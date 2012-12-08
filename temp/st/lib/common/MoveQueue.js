
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};

	var MoveQueue=ns.MoveQueue=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	var PPT=ns.ActionQueue.prototype;
	for (var p in PPT){
		MoveQueue.prototype[p]=PPT[p];
	}

	MoveQueue.prototype.constructor = MoveQueue;
	MoveQueue.prototype.run = function(actor){
			if (this.currentAction==null){
				return true;
			}

			var dx=this.currentAction[0]-actor.x,
				dy=this.currentAction[1]-actor.y;
			
			var arrived=0;
			if (dx*actor.dx>=0 && Math.abs(actor.dx)>=Math.abs(dx) ){
				actor.x=this.currentAction[0];
				actor.dx=0;
				arrived++;
			}
			if (dy*actor.dy>=0 && Math.abs(actor.dy)>=Math.abs(dy) ){
				actor.y=this.currentAction[1];
				actor.dy=0;
				arrived++;
			}

			if (arrived==2 && !this.next(actor) ){
				return true;
			}

			actor.x+=actor.dx;
			actor.y+=actor.dy;

			return false;

		}



}( typeof exports!="undefined"?exports:this ));

