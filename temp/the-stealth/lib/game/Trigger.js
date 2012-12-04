

;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};


	var Trigger=ns.Trigger=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

	var PT={
		constructor : Trigger,


		init : function(){

		},

		check : function(actor,entity){


		},

		run : function(actor,entity){

		}
	};

	for (var p in PT){
		Trigger.prototype[p]=PT[p];
	}

}( typeof exports!="undefined"?exports:this ));

