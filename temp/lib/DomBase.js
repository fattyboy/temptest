
;(function(scope, undefined){
'use strict';
	
	scope.css={};
	if (document.createDocumentFragment){
		var fragment =document.createDocumentFragment();
		var div =document.createElement("div");
		fragment.appendChild(div);
		scope.getFragmentDom=function(){
			return div;
		};	
			
		scope.detectCssAttribute=function(attrList,style){
				style=style||scope.getFragmentDom().style;
				var normalName=attrList[0];
				for(var i=0;i<attrList.length;i++){
					if (attrList[i] in style){
						scope.css[normalName]=attrList[i];
						break ;
					}
				}	
			};
		var css4Detect=[
			["transform", "webkitTransform", "MozTransform", "msTransform", "OTransform", "msTransform"],
			["transformOrigin", "webkitTransformOrigin", "MozTransformOrigin", "msTransformOrigin", "OTransformOrigin", "msTransformOrigin"],
			["perspective", "webkitPerspective", "MozPerspective", "msPerspective", "OPerspective","msPerspective"]
		];
		var style=scope.getFragmentDom().style;
		css4Detect.forEach(function(item,idx){
				scope.detectCssAttribute(item, style);
			});
		scope.supportTransform=!!scope.css.transform ;
		scope.supportTransform3D=!!scope.css.perspective ;
		
	}


	window.devicePixelRatio=window.devicePixelRatio||1;

	scope.merger( scope ,{

		$id : function(id){
			return document.getElementById(id);
		},

		$q : function(q){
			return document.querySelector(q);
		},
		$qs : function(q){
			return document.querySelectorAll(q);
		},
		hideAddressBar : function(once){ 
			if (!window.scrollTo){
				return;
			}
			setTimeout(function(){ 
				window.scrollTo(0, 1);
				if (once===false){
					scope.hideAddressBar(once);
				}
			}, 1);			
		},

		setViewportScale : function(scale,scalable){
			scale=scale||1; // ?  1/window.devicePixelRatio ;

			var meta=document.createElement("meta");
			if (!meta || !meta.setAttribute){return};
			meta.setAttribute("name","viewport");
			var content=[
				"width=device-width", 
				"height=device-height",
				"user-scalable="+(scalable?"yes":"no"),
				"minimum-scale="+scale/(scalable?2:1), 
				"maximum-scale="+scale*(scalable?2:1),
				"initial-scale="+scale,
				"target-densitydpi=device-dpi"
			];
			meta.setAttribute("content", content.join(", "));
			document.head.appendChild(meta);
		},
		
		showWindowSize : function(){
			var bodyBounding=document.body.getBoundingClientRect();
			var size=[
				["inner",window.innerWidth, window.innerHeight],
				["screen",window.screen.width, window.screen.height],
				["avail",window.screen.availWidth, window.screen.availHeight],
				["client",document.body.clientWidth, document.body.clientHeight],
				["offset",document.body.offsetWidth, document.body.offsetHeight],
				["scroll",document.body.scrollWidth, document.body.scrollHeight],
				["Bounding",bodyBounding.width, bodyBounding.height]
			]
			console.log(size.join("--"))
			return size;
		},

		createDom : function (tag , property){
			var dom=document.createElement(tag);
			if (property!=null){
				scope.setDomProperty(dom, property);
			}
			return dom;	
		},

		setDomProperty : function(dom,property){
			var p=property.parent;
			delete property.parent;
			var domStyle=dom.style;
			for ( var key in property) {
				if (key== "style"){
					scope.merger(domStyle, property[key]);
				}else{
					dom[key] =property[key];
				}
			}
			if (p) {
				p=scope.$id(p)||p;
				if (p!=null && p.appendChild){
					p.appendChild(dom);
				}
			};

		},

		setDomStyle : function(dom,style){
			scope.setDomProperty(dom, { style : style });
		},
		
		translateDom : (function(){
				if (scope.supportTransform3D){
					return function(dom,x,y){
							dom.style[scope.css.transform]="translate3d("+ x+"px,"+y+"px,0px)";
						};
				}
				if (scope.supportTransform){
					return function(dom,x,y){
							dom.style[scope.css.transform]="translate("+ x+"px,"+y+"px)";
						};
				}
				return function(dom,x,y){
						dom.style.left=x+"px";
						dom.style.top=y+"px";
					};
				
			})(),

		removeDom : function(dom) {
			if (dom.parentNode!=null){
				dom.parentNode.removeChild(dom);
			}else {
				var fragmentChild=scope.getFragmentDom();
				fragmentChild.appendChild(dom);
				fragmentChild.innerHTML="";
			}
		},

		isDom : function(obj){
			HTMLElement=HTMLElement||null;
			if (HTMLElement!=null){
				return obj instanceof HTMLElement	;
			}
			return obj &&  ("tagName" in obj) && ("parentNode" in obj);
		},

		getBrowserInfo : function(){
			var browser={};

			if (!window.navigator || !window.navigator.userAgent){
				return browser;
			}
			var ua=window.navigator.userAgent.toLowerCase();
			var match =
					/(safari)[ \/]([\w.]+)/.exec( ua ) ||
					/(chrome)[ \/]([\w.]+)/.exec( ua ) ||
					/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
					/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
					/(msie) ([\w.]+)/.exec( ua ) ||
					!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) || [];		
			
			
			browser[ match[1] ]=true;
			
			browser.mobile=ua.indexOf("mobile")>0 || "ontouchstart" in document; 

			browser.retain=window.devicePixelRatio>1.5;

			browser.iPhone=/iphone/.test(ua);
			browser.iPad=/ipad/.test(ua);
			
			browser.iOS4=browser.iOS && ua.indexOf("os 4")>0;
			browser.iOS5=browser.iOS && ua.indexOf("os 5")>0;
			browser.iOS6=browser.iOS && ua.indexOf("os 6")>0;

			browser.viewport={
				width:window.innerWidth,
				height:window.innerHeight
			};
			browser.screen={
				width:window.screen.availWidth*window.devicePixelRatio, 
				height:window.screen.availHeight*window.devicePixelRatio
			};
				
			return browser;
		},

		getHeadTag : function(){
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			return head;
		},

		createScriptTag : function(src,onload){
			var script = document.createElement("script");
			script.type = "text/javascript";
			if (src) {
				script.src = src;
				script.defer=false;
				var done = false;
				script.onload = script.onreadystatechange = function(e){
					if ( !done && 
						( !this.readyState || this.readyState == "loaded" || this.readyState == "complete") ) {
						done = true;
						if (onload){
							onload(e);
						}
						this.onload = this.onreadystatechange = null;
					}
				};
			}
			return script;
			
		},	

		includeJS : function(jspath,onload,useAjax,id){
			if (!jspath){ 	
				return false; 
			}
			if (typeof id == 'function') {
				var _onload=onload;
				onload=id;
				id=_onload;
			}
			//TODO : 
			jspath=jspath+"?tamp="+Date.now();

			var head=scope.getHeadTag();	
			
			if (!useAjax){
				var script=scope.createScriptTag(jspath,onload);
				if (id) {
					script.id=id;
				}
				head.appendChild( script );
				return;
			}		
			// method 2
			scope.bodyLoaded= document.readyState=='complete';
			var xmlhttp = new XMLHttpRequest(); 
			xmlhttp.open("GET", jspath, false); 
			xmlhttp.onreadystatechange = function() { 
				if (xmlhttp.readyState == 4) { 
					var scriptCode=xmlhttp.responseText;
					if (! scope.bodyLoaded ) {
						var script=scope.createScriptTag();
						if (id) {
							script.id=id;
						}
						script.appendChild( document.createTextNode( scriptCode ) );
						//script.text = scriptCode;
						head.appendChild( script );
						if (onload){
							onload(e);
						}
					}
				} 
			} 
			xmlhttp.send(null); 
			
		},

		includeJSList : function(allJSList,onload,useAjax){
			var loaded=0;
			var total=allJSList.length;
			function _onloadJS(e){
				loaded++;
				if (loaded<total){
					scope.includeJS(allJSList[loaded], _onloadJS, useAjax);
				}else if(onload){
					setTimeout(function(){
						onload();
					},10);
				}
			}
			scope.includeJS(allJSList[loaded], _onloadJS, useAjax);
		},

        ajax : function(url,data,callback,options){
                options=options||{};
                var method=options.method||"post";
                var headers=options.headers||null;
                var withCredentials=options.withCredentials;
                var timeout=options.timeout || 15*1000;

                var xhr=new XMLHttpRequest();
                xhr.open(method, url, true);
                for (var key in headers){
                    var value=headers[key];
                    if (value) xhr.setRequestHeader(key, value);
                }
                var completed=false;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                    	completed=true;
                        callback(
                            xhr.responseText,
                            xhr.status,
                            xhr.getAllResponseHeaders(),
                            xhr
                        );
                    }
                };
                if (withCredentials) {
                    xhr.withCredentials = true;
                }                
                xhr.send(data || '');

                setTimeout(function(){
                	if (!completed){
                		xhr.abort();
                		callback(null,-1,null);
                	}
                },timeout)
        },

		recordKeyState : function(onDown,onUp){
			window.addEventListener("keydown", function(event) {
				scope.KeyState[event.keyCode] = true;
				if (onDown){
					onDown(event);
				}
			}, true);

			window.addEventListener("keyup", function(event) {
				scope.KeyState[event.keyCode] = false;
				if (onUp){
					onUp(event);
				}
			}, true);
		}

	});

	scope.browser=scope.getBrowserInfo();

	(function() {
		var vendors = ['o', 'ms', 'moz', 'webkit', ];
		for(var i = vendors.length-1; i>=0 && !window.requestAnimationFrame; i--) {
			window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame']
									   || window[vendors[i]+'CancelRequestAnimationFrame'];
		}

	 scope.supportRequestAnimationFrame=!!window.requestAnimationFrame;

		if (!scope.supportRequestAnimationFrame){
			 window.requestAnimationFrame = function(callback, element) {
					return window.setTimeout(callback ,16 );
				};
		}
	 
		if (!window.cancelAnimationFrame){
			window.cancelAnimationFrame = window.clearTimeout
		}

	}());

}(this));