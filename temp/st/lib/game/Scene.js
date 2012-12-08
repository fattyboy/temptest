
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};


	var Scene=ns.Scene=function(cfg){

		for (var key in cfg) {
			this[key] = cfg[key];
		}
	}

Scene.prototype={

	constructor : Scene ,

	id : null ,
	index : null ,
	game : null ,
	container : null ,

	beforeInit : ns.noop,	
	init : function(game){
		this.beforeInit(game);
		this.game=game;
		this.viewWidth=this.game.viewWidth;
		this.viewHeight=this.game.viewHeight;
		this.onInit(game);
	},
	onInit : ns.noop,

	beforeRun : ns.noop,

	update : ns.noop,

	render : ns.noop,

	handleInput : ns.noop,
	
	destroy : ns.noop

};
	
}( typeof exports!="undefined"?exports:this ));
