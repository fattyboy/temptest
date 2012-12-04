
;(function(scope,undefined){
'use strict';
	
	var Sound=scope.Sound=function(cfg){
		for (var key in cfg){
			this[key]=cfg[key]
		}
	};

	Sound.prototype={
		audio : null,
		loop : false,
		volume : 1,
		init : function(){
			
		},
		play : function(){
			this.setCurrentTime(0);
			this.audio.play();
		},
		setCurrentTime : function(time){
			if (this.audio.seekTo){
				this.audio.seekTo(time);
			}else if (this.audio.currentTime!=time){
				this.audio.currentTime=time;
			}
		},
		setVolume : function(volume){
			if (this.audio.setVolume){
				this.audio.setVolume(volume)
			}else{
				this.audio.volume=volume;
			}
		},
		pause : function(){
			this.audio.pause();
		},
		stop : function(){
			if (this.audio.stop){
				this.audio.stop();
			}else{
				this.audio.pause();
				this.audio.currentTime=0;
			}
		}

	}

}(this));

