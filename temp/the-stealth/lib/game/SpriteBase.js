
;(function(exports, undefined){ var ns=exports.NS=exports.NS||{};

	var SpriteBase=ns.SpriteBase=function(cfg){
		for (var attr in cfg){
			this[attr]=cfg[attr];
		}
	}

	SpriteBase.prototype={
		
		anims : null,
		defaultAnimId : null,
		currentAnim : null,	
		currentAnimId : null,	
		
		initAnims : function(){
			for (var animId in this.anims){
				var anim=this.anims[animId];
				anim.id=animId;
				if ( !(anim instanceof ns.Animation) ){
					anim=this.anims[animId]=new ns.Animation(anim);
				}
				anim.init();
			}
			this.setAnim(this.defaultAnimId);
		},
		changeAnim : function(animId){
			if (animId===this.currentAnimId){
				return;
			}
			this.setAnim(animId);
		},

		setAnim : function(animId){
			this.currentAnim=this.anims[animId];
			this.currentAnimId=animId;
			this.currentAnim.setFrame(0);
		},
		
		updateAnim : function(deltaTime){
			if (this.currentAnim){
				this.currentAnim.update(deltaTime);
			}
		}
		
	};


}( typeof exports!="undefined"?exports:this ));

