;(function(scope,undefined){
'use strict';


	var DomUIManager=scope.DomUIManager=function(cfg){
		merger(this, cfg);
		this.views={};
	}

	DomUIManager.prototype={
		constructor : DomUIManager ,
		timer : null,
		views : null,
		activeds : null,
		
		blockInput : false,
		blockLoop : false,

		uiPool : null ,
		uiZIndex : 1000,
		uiFadeTime : 2000,

		init : function(game){
			this.container=game.container;
			this.uiPool=this.uiPool||"ui-pool";
			this.uiPool=scope.$id(this.uiPool)||document.body;
			if ( this.uiPool!=document.body ){
				this.uiPool.style.display="none";
			}
			var uiList=this.uiPool.querySelectorAll("*[ui]");
			// var views=[];
			for (var i=0,len=uiList.length;i<len;i++){
				var ui=uiList[i];
				var route=ui.getAttribute("ui");
				if (route==="1"||route==="true"){
					route=ui.id;
				}
				// views[route]=ui;

				var u=new DomUI({
					id : ui.id,
					dom : ui.id
				})
				u.init();
				this.register(u);
			}
			console.log(this.views)
		},

		showUI : function(idOrDom,cb){
			var ui=scope.$id(idOrDom)||idOrDom;
			if (!ui){
				console.log(idOrDom)
			}
			ui.showing=true;
			ui.hidding=false;

			this.container.appendChild(ui);
			setTimeout(function(){
				if (ui.showing){
					ui.style.opacity=1;
					ui.style.zIndex=this.uiZIndex++;			
				}
			},1);
			if (cb){
				setTimeout(function(){
					if (ui.showing){
						cb();
					}
				},this.uiFadeTime);
			}
			return ui;
		},
		hideUI : function(idOrDom,cb){
			var ui=scope.$id(idOrDom)||idOrDom;
			if (!ui){
				console.log(idOrDom)
			}
			ui.style.opacity=0;
			ui.hidding=true;
			ui.showing=false;

			var Me=this;
			setTimeout(function(){
				if (ui.hidding){
					Me.uiPool.appendChild(ui);
					if (cb){
						cb();
					}			
				}		
			},this.uiFadeTime);
			return ui;
		},
		switchUI : function(fromUI,toUI){
			this.hideUI(fromUI);
			this.showUI(toUI);
		},
		getView : function(id){
			return this.views[id];
		},
		register : function(view){
			this.views[view.id]=view;
		},
		unregister : function(viewOrId){
			var id=viewOrId.id||viewOrId;
			delete this.views[id];
		},
		activate : function(view){
			this.activeds[view.id]=view;
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
		render : function(){
			for (var id in this.activeds){
				var a=this.activeds[id];
				a.render();
			}
		},

	}


}(this));







