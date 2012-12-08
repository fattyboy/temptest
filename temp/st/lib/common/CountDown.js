

;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};
	

	var CountDown = ns.CountDown =function(defalutValue){	
		this.defalutValue=defalutValue;
	};

	CountDown.prototype= {

		constructor : CountDown ,

		defalutValue : 0 ,
		value : 0 ,
		paused : false ,
		start : function(){
			this.paused=false;
			this.value=this.defalutValue;
		},
		update : function(elapsed){
			if (this.paused){
				return false;
			}
			this.value-=elapsed;
			return this.value<=0;
		}

	};

}( typeof exports!="undefined"?exports:this ));

