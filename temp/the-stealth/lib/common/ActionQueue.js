
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};


	var ActionQueue=ns.ActionQueue=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	ActionQueue.prototype={
		constructor : ActionQueue,

		queue : null ,
		currentIndex : -1 ,
		currentAction : null,

		onEnd : null,
		onNext : null,

		paused : false ,
		start : function(actor){
			this.currentIndex=0;
			this.currentAction=this.queue[0]||null;
		},

		next : function(actor){
			this.currentIndex++;
			this.currentAction=this.queue[this.currentIndex]||null;

			var hasNext=this.currentAction!=null;
			if (hasNext && this.onNext!=null){
				this.onNext(actor);
			}
			return hasNext;

		},

		update : function(actor){
			if (this.paused){
				return false;
			}
			var allFinished = this.run(actor);

			if (allFinished && this.onEnd!=null){
				this.onEnd(actor);
			}
			return allFinished;


		},
		// return true : finished all
		run : function(actor){

			return this.currentAction==null 
				|| this.currentAction.update(actor) && !this.next(actor) ;
		}

	};


}( typeof exports!="undefined"?exports:this ));


