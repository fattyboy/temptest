


var stick1;

var soltRadius=50*window.devicePixelRatio;
var stickRadius=30*window.devicePixelRatio;
var stickX=40*window.devicePixelRatio;
var stickY=window.innerHeight - stickX - soltRadius*2;

var stickX2=window.innerWidth - stickX - soltRadius*2;
var stickY2=stickY+10;

var maxHeight=window.screen.width;

function initJoystick(){

	var joystick=document.querySelector(".joystick");
	joystick.style.position="absolute";
	joystick.style.left=stickX+"px";
	// joystick.style.top=stickY+(window.innerHeight-HEIGHT)+"px";
	joystick.style.top=stickY+"px";


	stick1=$id("stick1");

	var style=$id("slot1").style;
	var cfg={
		zIndex : 101,
		position : "absolute",
		left : 0+"px",
		top : 0+"px",
		width : soltRadius*2+"px",
		height : soltRadius*2+"px",
		borderRadius : soltRadius+"px"
	}
	for (var p in cfg){
		style[p]=cfg[p];
	}

	var style=stick1.style;
	var cfg={
		zIndex : 102,
		position : "absolute",
		left : soltRadius-stickRadius+"px",
		top : soltRadius-stickRadius+"px",
		width : stickRadius*2+"px",
		height : stickRadius*2+"px",
		borderRadius : stickRadius+"px"
	}
	for (var p in cfg){
		style[p]=cfg[p];
	}

	var stick2=$id("stick2");
	for (var p in cfg){
		stick2.style[p]=cfg[p];
	}
	stick2.style.left=stickX2+"px";
	stick2.style.top=stickY2+"px";

}

var button=new Toucher.Tap({
	isTrigger : function(touchWrapper,wrapperList,touchCoontroller){
		var id=touchWrapper.startTarget.id;
		return id=="stick2" || id=="sticktext";
	},
	onTap : function(touchWrappers,event,touchController){
		player.doAction()

	}

});

var joystick=new Toucher.Joystick({

	maxRadius : soltRadius-10 ,

	isTrigger : function(touchWrapper,wrapperList,touchCoontroller){
		return touchWrapper.startTarget.id=="slot1"
				|| touchWrapper.startTarget.id=="stick1";
	},

	onMove : function(touchWrappers,event,touchController){
		var x=this.moveX, 
			y=this.moveY;
		var distance=this.moveDistance,
			rotation=this.rotation

		TS.setDomPos(stick1 , x , y);
		// info.innerHTML=" ["+x+","+y+"],"+distance+","+rotation;
	},
	onEnd : function(touchWrappers,event,touchController){
		TS.setDomPos(stick1 , 0 , 0);
		// info.innerHTML=" ["+0+","+0+"]";
	}
});


var controller=new Toucher.Controller({
	beforeInit : function(){
		this.dom=document.body;
	},
	preventDefaultMove :true
});


function initToucher(){
	controller.init();
	controller.addListener(joystick);
	controller.addListener(button);
}


