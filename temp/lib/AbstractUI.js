
;(function(scope,undefined){
'use strict';
	

	var AbstractUIView=scope.AbstractUIView=function(cfg){
		merger(this, cfg);
	}

	AbstractUIView.prototype={
		constructor : AbstractUIView ,

		id : null,
		x : null,
		y : null,

		manager : null,
		hidden : true,

		setPosition : function(x,y){
			this.x=x;
			this.y=y;
		},

		activate : function(){
			this.manager.activate(this);
		},
		inactivate : function(){
			this.manager.inactivate(this);
		},

		defer : function(fn,timeout){
			if (fn){
				var Me=this;
				this.manager.defer(function(){
					fn(Me)
				},timeout);
			}
		},

		init : function(){},

		update : function(timeStep){},
		render : function(){},
		show : function(callback){},
		hide : function(callback){},
		moveTo : function(x,y){},
		destroy : function(){}
	}

})(this);

