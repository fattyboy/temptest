
;(function(scope,undefined){
'use strict';


	var DomUI=scope.DomUI=function (cfg){
		merger(this, cfg);
	}
	DomUI.prototype={
		constructor : DomUI ,
		domId : null,
		dom : null,
		durationShow : 1,
		durationHide : 1,
		durationMove : 1,
		hidden : true ,
		init : function(){
			this.dom=$id(this.dom)||this.dom;
			this.initValueNode();
		},

		show : function(callback){
			if (typeof this.x == "number"){
				this.dom.style.left=this.x+"px";
			}
			if (typeof this.y == "number"){
				this.dom.style.top=this.y+"px";
			}
			this.dom.style.display="block";
			this.defer(callback,this.durationShow);
			this.hidden=false;
		},
		hide : function(callback){
			this.dom.style.display="none";
			this.defer(callback,this.durationHide);
			this.hidden=true;
		},
		moveTo : function(x,y,callback){
			this.setPosition(x,y);
			this.dom.style.left=this.x+"px";
			this.dom.style.top=this.y+"px";
			this.defer(callback,this.durationMove);
		},
		destroy : function(){
			this.dom.parentNode.removeChild(this.dom);
			this.dom=null;
			this.valueNodes=null;
			this.attrNodes=null;
		},

		initValueNode : function(dom){
			dom=this.dom=dom||this.dom;
			this.valueNodes={};
			this.attrNodes={};

			var keyNodes = dom.querySelectorAll("*[key]");
			for (var i=0,len=keyNodes.length;i<len;i++){
				var node=keyNodes[i];
				var key=node.getAttribute("key");
				var arr=this.valueNodes[key]=this.valueNodes[key]||[];
				arr.push(node);
			}
			var attrNodes = dom.querySelectorAll("*[attr]");
			for (var i=0,len=attrNodes.length;i<len;i++){
				var node=attrNodes[i];
				var key=node.getAttribute("attr");
				var arr=this.attrNodes[key]=this.attrNodes[key]||[];
				arr.push(node);
			}
		},

		setNodeValue : function(key,value){
			var nodes=this.valueNodes[key];
			if (nodes){
				nodes.forEach(function(node){
					node.innerHTML=value;
				})			
			}

		},

		updateAllNodes : function(obj){
			for (var key in obj){
				if (obj.hasOwnProperty(key)){
					this.setNodeValue(key,obj[key]);			
				}
			}
		},


		setAttrValue : function(attr, name,value){
			name=name||attr;
			var nodes=this.attrNodes[attr];
			if (nodes){
				nodes.forEach(function(node){
					node.setAttribute( name , value );
				})
			}
		}

	}
	merger(DomUI.prototype, scope.AbstractUIView.prototype, false);


}(this));


