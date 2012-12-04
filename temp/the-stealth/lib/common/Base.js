

;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};


	ns.noop=function(){};
	ns._TODO_=function(){};

	ns.merger=function(so, po,override) {
		if (arguments.length<2 || po === undefined ) {
			po = so;
			so = {};
		}
		for ( var key in po) {
			if ( !(key in so) || override!==false ) {
				so[key] = po[key];
			}
		}
		return so;
	};


	ns.mixin=function(receiver, supplier,override) {
        for (var i in supplier) {  
            if (supplier.hasOwnProperty(i) &&  (!(i in receiver)||override) ) {  
                receiver[i] = s[i];   
            }  
        }  
        return r;
	};


	ns.merger(ns,{

		ID_SEED : 1 ,
		genId : function (p){
			return (p||"")+"_"+(this.ID_SEED++);
		},

		delegate : function(fun, _this){
			return function(){
				return fun.apply(_this,arguments);
			};
		},

		toArray : function(collection){
			return Array.prototype.slice.call(collection, 0);
		},

		getRandom : function(lower, higher) {
			return Math.floor( (higher - lower + 1) * Math.random() ) + lower;
		},

		getEighth : function(x,y){

			var slope = 0.41421356237309503 ; //Math.tan(Math.PI/8);

			var sx=x * slope, sy=y * slope ;

            var s1 = sx + y > 0 ? 0 : 1;
			var s2 = sx - y > 0 ? 0 : 1;
	        var s3 = x + sy > 0 ? 0 : 1;
            var s4 = x - sy > 0 ? 0 : 1;
		
			var segment = (s1<<2) + ((s1 ^ s4)<<1) + (s1 ^ s2 ^ s3 ^ s4)  ;

			return segment;
		}


	});


	ns.merger( Array.prototype , {

		insertAt : function(item,idx) {
			return this.splice(idx, 0, item);
		},

		removeAt : function(idx) {
			return this.splice(idx, 1);
		},
		removeItem : function(item) {
			var idx = this.indexOf(item);
			if (idx >= 0) {
				return this.removeAt(idx);
			}
			return false;
		}
	},false);


	Array.isArray=Array.isArray||function(obj){
		return Object.prototype.toString.apply(obj) === "[object Array]"
	};

	Object.create=Object.create||function(obj){
		var tmp=function(){};
		tmp.prototype=obj;
		return new tmp();
	};

	Object.keys=Object.keys||function(obj){
		var keys=[];
		for (var key in obj){
			keys.push(key);
		}
		return keys;
	};

	Date.now=Date.now||function(){ new Date().getTime(); };
	

}( typeof exports!="undefined"?exports:this ));





