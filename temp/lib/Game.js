
;(function(scope,undefined){
'use strict';


var Game=scope.Game=function(cfg){
    scope.merger(this,cfg);
}


Game.prototype={
    constructor : Game,

    FPS : 60 ,
    timer : null ,
    resources : null,

    width : 800,
    height : 480,
    viewWidth : null,
    viewHeight : null,

    container : null ,
    viewport : null ,
    canvas : "canvas",
    context : null,
    
    sceneIndex : 0 ,
    currentScene : null,
    
    uiManager : null ,
    
    loader : null ,
    state : null,


    init : function(){

        this.viewWidth=this.viewWidth||this.width;
        this.viewHeight=this.viewHeight||this.height;
    
        this.scenes=this.scenes||[];
        this.timeStep=Math.floor(1000/this.FPS);
        this.maxTimeStep=this.maxTimeStepTi||Math.floor(this.timeStep*1.5)
        this.timer=new scope.Timer(this.timer);     

        this.initContainer();

        // this.uiManager=new DomUIManager(this.uiManager)
        if (this.uiManager){
            this.uiManager.init(this);
            
        }

        this.initLoader();

        var Me=this;
        this.callRun = function(){
            Me.run();
        }

        this.onInit();
    },
    onInit : scope.noop ,

    initContainer : function(){
        this.container=scope.$id(this.container)||this.container;
        if (typeof this.container=="string"){
            this._container=this.container;
            this.container=null;
        }
        // if (!this.container){
        //  this.container=document.createElement("div");
        //  document.body.appendChild(this.container);
        // }
        if (this.container){
            scope.merger(this.container.style,{
                position : "relative" ,
                overflow : "hidden" ,       
                padding : "0px" ,
                width : this.width+"px" ,
                height : this.height+"px",
                marginLeft : "50%",
                left : -this.width/2+"px"
            });             
        }       

    },

    initLoader : function(){
        var Me=this;
        var loader=this.loader||{};
        this.loader=new scope.ProcessQ({
            interval : loader.interval || 1,
            defaultDelay : loader.delay || 1 ,
            paiallel : loader.paiallel||false,
            onNext : function(timeStep, queue){
                var loaded=queue.finishedWeight,
                    total=queue.totalWeight,
                    results=queue.resultPool;
                return Me.onLoading(loaded,total,results);
            },
            onFinish : function(queue){
                var loaded=queue.finishedWeight,
                    total=queue.totalWeight,
                    results=queue.resultPool;
                for (var id in results){
                    scope.ResourcePool.add(id, results[id]);
                }
                Me.onLoad=Me.onLoad||Me.ready;
                setTimeout(function() {
                    Me.onLoad(loaded,total,results);
                },1);
            }
        });
    },

    beforeLoad : scope.noop ,   
    load : function(force){     
        if (this.beforeLoad(force)===false){
            return false;
        }
        var resources=this.resources?[].concat(this.resources):[];
        this.loader.items=resources;
        this.loader.init();
        this.loader.start();
    },
    onLoading : scope.noop,
    onLoad : null,


    initViewport : function(){
        if (this.container){
            this.viewport=document.createElement("div");
            this.container.appendChild(this.viewport);      
            var domStyle=this.viewport.style;
            scope.merger(domStyle,{
                position : "absolute" ,
                left : "0px",
                top : "0px",
                overflow : "hidden" ,   
                padding : "0px" ,
                width : this.viewWidth+"px" ,
                height : this.viewHeight+"px" ,
                className : "viewport",
                backgroundColor : "transparent"
            });         
        }   
    },

    initCanvas : function(){
        
        this.canvas=scope.$id(this.canvas)||this.canvas;

        // this.canvas=this.canvas||document.createElement("canvas");

        var domStyle=this.canvas.style;
        if (domStyle){
            scope.merger(domStyle,{
                position : "absolute" ,
                left : "0px",
                top : "0px",
                zIndex : 100
            });         
        }


        this.canvas.width=this.viewWidth;
        this.canvas.height=this.viewHeight;
        this.context=this.canvas.getContext('2d');

        if (this.viewport){
            this.viewport.appendChild(this.canvas);
        }

    },

    ready : function(){
        if (this.container){
            this.pos=this.container.getBoundingClientRect();
        }else{
            this.pos={
                left : 0,
                top : 0,
                right : this.viewWidth,
                bottom : this.viewHeight,
                width : this.viewWidth,
                height : this.viewHeight
            }
        }
        
        this.initViewport();
        this.initCanvas();
        this.initUI();
        this.initEvent();

        this.onReady();
    },
    initUI : scope.noop ,
    initEvent : scope.noop ,
    onReady : scope.noop,


    activeScene : function(index){
        this.sceneIndex=index;
        this.currentScene=this.scenes[index];
        this.currentScene.init(this);
    },  
    loadScene : function(index){
        var scene=this.getSceneInstance(index);
        scene.index=index;
        this.scenes[index]=scene;
        return scene;
    },
    getSceneInstance : scope.noop , 

    start : function(index){
        this.cancelLoop();
        if (this.currentScene && this.currentScene.destroy){
            this.currentScene.destroy(this);
        }

        index=index||0;
        this.loadScene(index);
        this.activeScene(index);        

        if (!this.currentScene){
            return false;
        }
        this.runScene(this.currentScene);
    },

    runScene : function(scene){
        this.currentScene=scene;
        if (scene.beforeRun){
            scene.beforeRun(this);
        }   
        var Me=this;
        setTimeout(function(){
            Me.state=Game.PLAYING;      
            Me.timer.start();
            Me.run();
        },100)
    },

    restart : function(){   
        this.stop();
        this.start(this.sceneIndex);        
    },

    doLoop : function(fn){
        // this.mainLoop=requestAnimationFrame( this.callRun );
        this.mainLoop=setTimeout(this.callRun, this.timeStep);
    },
    cancelLoop : function(fn){
        if (this.mainLoop){
            // cancelAnimationFrame( this.mainLoop );
            clearTimeout(this.mainLoop);            
        }
    },
    blank : 0,
    run : function(){
        if (this.state==Game.PLAYING) {

            this.doLoop();
            this.timer.tick();
            var timeStep=this.timer.timeStep;

            this.frameCount++;
            this.handleInput(timeStep);
            
            if (this.paused){
                this.onPausing(timeStep);
            }else if ( timeStep>0 ){
                this.beforeLoop(timeStep);
                this.timer.runTasks();
                var t=this.blank+timeStep;
                while(t>=this.timeStep){
                    t-=this.timeStep;
                    this.update(this.timeStep);
                }
                this.blank=t;
                this.render(this.timeStep);
                this.afterLoop(this.timeStep);
            }
            this.timer.last=this.timer.now;

        }else if (this.state==Game.STOP) {
            this.stop();
        }else{
            this[this.state]&&this[this.state]();
        }

    },
    onPausing : scope.noop,

    update : function(timeStep){
        var c=this.currentScene;
        if (c.handleInput){
            c.handleInput(timeStep);
        }
        c.update(timeStep);
    },
    render : function(timeStep){
        this.currentScene.render(this.context,timeStep);
    },
    handleInput :  scope.noop,
    beforeLoop : scope.noop,
    afterLoop : scope.noop,
    
    pause : function(){
        this.paused=1;
        this.onPause();
    },
    onPause : scope.noop,
    resume : function(){
        this.paused=0;
        this.onResume();
    },
    onResume : scope.noop,
    exit : scope.noop,

    stop : function(){
        this.state=Game.STOP;
        this.paused=0;
        this.cancelLoop();
        if (this.currentScene){
            if (this.currentScene.destroy){
                this.currentScene.destroy(this);
            }
            this.scenes[this.sceneIndex]=null;
            this.currentScene=null;
        }       
        this.onStop();
    },
    onStop : scope.noop ,

    destroy : scope.noop
    
};

Game.PLAYING="playing";
Game.STOP="stop";


})(this);
