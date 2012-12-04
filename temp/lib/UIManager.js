;(function(scope,undefined){
'use strict';


	var ViewManager=scope.ViewManager=function(cfg){
		merger(this, cfg);
		this.views={};
	}

	ViewManager.prototype={
		constructor : ViewManager ,
		timer : null,
		activeds : null,
		
		blockInput : false,
		blockLoop : false,

		views : null ,
		viewZIndex : 1000,
		viewStack : null,
		focus : null ,

		init : function(game){
			this.game=game;
			this.timer=game.timer;
			this.views=this.views||{};
		},

		defer : function(fn,timeout){
			this.timer.addTask(fn,timeout);
		},

		showView : function(viewOrId,cb){
			var view=this.views[viewOrId]||viewOrId;
			if (!view){
				console.log(viewOrId)
			}
			if (!view.showing && !view.displayed){
				view.hiding=false;
				view.showing=true;
				view.show(cb);
				return view;
			}
			return false;
		},

		hideView : function(viewOrId,cb){
			var view=this.views[viewOrId]||viewOrId;
			if (!view){
				console.log(viewOrId)
			}
			if (!view.hiding && view.displayed){
				view.showing=false;
				view.hiding=true;
				view.hide(cb);
				return view;
			}
			return false;
		},

		updateView : function(viewOrId,data,cb){
			var view=this.views[viewOrId]||viewOrId;
			if (!view){
				console.log(viewOrId)
			}
			view.hide(data,cb);
		},

		mask : function(cb){

		},

		register : function(view){
			this.views[view.id]=view;
		},
		unregister : function(viewOrId){
			var id=viewOrId.id||viewOrId;
			delete this.views[id];
		},

		activate : function(viewOrId){
			var id=viewOrId.id||viewOrId;
			this.activeds[id]=this.views[id];
		},
		inactivate : function(viewOrId){
			var id=viewOrId.id||viewOrId;
			delete this.activeds[id];
		},

		update : function(timeStep){
			for (var id in this.activeds){
				var a=this.activeds[id];
				a.update(timeStep);
			}
		},
		render : function(context){
			for (var id in this.activeds){
				var a=this.activeds[id];
				a.render(context);
			}
		}

	}


}(this));







