
/*
//BOOKMARKLET FOR EXAMPLES
var cmd = "function loadJS(path,callback) {var script = document.createElement('script');script.type = 'text/javascript';script.async = true;script.onload = callback;script.src = path;document.getElementsByTagName('head')[0].appendChild(script);};loadJS('//raw.github.com/carstenschwede/RiftThree/master/lib/RiftThree.js', function() {window.RiftThree();});";
var i = document.getElementById('viewer');
var p = document.getElementById('panel');
if (i && p) {
	var is = i.style, ps = p.style, iD,s;
	ps.zIndex = 2;
	ps.bottom = is.left = 0;
	is.width = ps.width = "100%";
	ps.height = "100px";
	iD = i.contentWindow.document;
	s = iD.createElement('script');
	s.text = cmd;
	iD.getElementsByTagName("head")[0].appendChild(s);
} else {
	eval(cmd);
}
*/

;(function(window) {
	if (window.RiftThree !== undefined) return;
	var calls = [];
	var ready = false;
	window.RiftThree = function(renderer,options) {
		if (ready) {
			riftify(renderer,options);
		} else {
			calls.push([renderer,options]);
		}
	};

	window.RiftThree.StereoTypes = {
		"3602D": {
			uv: function(uv,left,right) {
				//NEED TO MIRROR X-AXIS CAUSE WE ARE INSIDE THE SPHERE
				left.push(new THREE.Vector2(1-uv.x,uv.y));
				right.push(new THREE.Vector2(1-uv.x,uv.y));
			},
			geometry: "sphere"
		},
		"L": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x,uv.y));
				right.push(new THREE.Vector2(uv.x,uv.y));
			},
			geometry: "plane"
		},
		"LD": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*0.5,uv.y));
				right.push(new THREE.Vector2(uv.x*0.5,uv.y));
			},
			disp: true,
			geometry: "plane"
		},
		"D": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x,uv.y));
				right.push(new THREE.Vector2(uv.x,uv.y));
			},
			disp: true,
			geometry: "plane"
		},
		"L_D": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x,uv.y*0.5+0.5));
				right.push(new THREE.Vector2(uv.x,uv.y*0.5+0.5));
			},
			disp: true,
			geometry: "plane"
		},
		"LR": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*0.5,uv.y));
				right.push(new THREE.Vector2(uv.x*0.5+0.5,uv.y));
			},
			geometry: "plane"
		},
		"LR!L": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*0.5,uv.y));
				right.push(new THREE.Vector2(uv.x*0.5,uv.y));
			},
			geometry: "plane"
		},
		"LR!R": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*0.5+0.5,uv.y));
				right.push(new THREE.Vector2(uv.x*0.5+0.5,uv.y));
			},
			geometry: "plane"
		},
		"LRD": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*1.0/3.0,uv.y));
				right.push(new THREE.Vector2(uv.x*1.0/3.0+1.0/3.0,uv.y));
			},
			disp: true,
			geometry: "plane"
		},
		"LRD!L": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*1.0/3.0,uv.y));
				right.push(new THREE.Vector2(uv.x*1.0/3.0,uv.y));
			},
			disp: true,
			geometry: "plane"
		},
		"LRD!R": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x*1.0/3.0+1.0/3.0,uv.y));
				right.push(new THREE.Vector2(uv.x*1.0/3.0+1.0/3.0,uv.y));
			},
			disp: true,
			geometry: "plane"
		},
		"L_R": {
			uv: function(uv,left,right) {
				left.push(new THREE.Vector2(uv.x,uv.y*0.5));
				right.push(new THREE.Vector2(uv.x,uv.y*0.5+0.5));
			},
			geometry: "plane"
		}
	};

	function loadJS(path,callback) {var script = document.createElement('script');script.type = 'text/javascript';script.async = true;script.onload = callback;script.src = path;document.getElementsByTagName('head')[0].appendChild(script);}

	var riftify = function(renderer,options) {
		var riftEnabled = true,stackSize = 0;

		/*********************************************/
		//Try to find WebGL renderer as a global
		/*********************************************/
		if (!renderer) {
			var constructors = [THREE.WebGLRenderer];
			for(var i in window) {if (window.hasOwnProperty(i)) {if (window[i] && constructors.indexOf(window[i].constructor) > -1) {renderer = window[i];break;}}}
		}

		if (!renderer) {
			console.log("Instance of WebGLRenderer could not be found in global scope, please call riftify(renderer).");
			return;
		}

		/*********************************************/
		//Setup options
		/*********************************************/
		options = options || {};
		options.useHeadTracking = options.useHeadTracking === undefined ? true : options.useHeadTracking;
		options.assignKeys = options.assignKeys === undefined ? true : options.assignKeys;
		options.scale = options.scale || 1.0;


		/*********************************************/
		//Load media
		/*********************************************/
		["Left","Right"].forEach(function(side) {
			options["pre" + side] = options["pre"+side] || [];

			if (typeof(options["pre"+side]) == "function") {
				options["pre"+side] = [options["pre"+side]];
			}
		});


		/*********************************************/
		//Calculate UV TexMaps for Left/Right Eye
		/*********************************************/
		options.geometriesWith3DTextures = options.geometriesWith3DTextures || [];
		options.geometriesWith3DTextures.forEach(function(geometry) {
			var mappingLeft = [];
			var mappingRight = [];

			geometry.faceVertexUvs[0].forEach(function(uvs) {
				var mappedLeft = [];
				var mappedRight = [];
				uvs.forEach(function(uv) {
					geometry.stereoType.uv(uv,mappedLeft,mappedRight);
				});
				mappingLeft.push(mappedLeft);
				mappingRight.push(mappedRight);
			});

			mappingLeft = [mappingLeft];
			mappingRight = [mappingRight];

			var alternating = 0;
			options.preLeft.push(function() {
				if (options.alternate) {
					geometry.faceVertexUvs = (alternating ? mappingLeft : mappingRight);
				} else {
					geometry.faceVertexUvs = mappingLeft;
				}
				geometry.uvsNeedUpdate = true;
			});

			options.preRight.push(function() {
				if (options.alternate) {
					geometry.faceVertexUvs = (alternating ? mappingLeft : mappingRight);
				} else {
					geometry.faceVertexUvs = mappingRight;
				}
				geometry.uvsNeedUpdate = true;
				alternating = !alternating;
			});
		});

		/*********************************************/
		//Create actuall OculusRiftEffect
		/*********************************************/
		var effect = new THREE.OculusRiftEffect( renderer, options );
		effect.setSize( window.innerWidth, window.innerHeight );

		window.addEventListener( 'resize', function() {
			effect.setSize( window.innerWidth, window.innerHeight );
		}, false );


		window.toggleRift = function() {riftEnabled = !riftEnabled;stackSize = 0;if (onWindowResize) onWindowResize();};

		vr.load(function(error) {
			if (error) {
				console.log('Unable to load vr.js for headtracking: ' + error.toString());
			}
		});

		var vrstate = new vr.State();

		var initQuaternion = false;
		if (vrstate && options.assignKeys) {
			window.addEventListener('keydown', function(evt) {
				var ascii = String.fromCharCode(evt.keyCode).toLowerCase();

				if (ascii == "r") {
					initQuaternion = false;
				}

				if (ascii == "h") {
					options.useHeadTracking = !options.useHeadTracking;
					if (options.useHeadTracking) initQuaternion = false;
				}

			});
		}


		/*********************************************/
		//Overwrite actual renderer so we don't have
		//to change OculusRiftEffect.js
		//Messy
		/*********************************************/

		var defaultRenderer = renderer.render;
		var tempQuat = new THREE.Quaternion();

		renderer.render = function(a,camera) {
			if (!riftEnabled) {
				defaultRenderer.apply(renderer,arguments);
				return;

			}
			if (stackSize === 0) {
				/*********************************************/
				//Use vr.js for Headtracking when available
				/*********************************************/

				if (vrstate) {
					var polled = vr.pollState(vrstate);
					if (polled) {
						if (initQuaternion) {
							var current = new THREE.Quaternion(	vrstate.hmd.rotation[0],
																vrstate.hmd.rotation[1],
																vrstate.hmd.rotation[2],
																vrstate.hmd.rotation[3]);

							tempQuat.copy(initQuaternion);
							if (options.useHeadTracking)
								camera.quaternion.copy(tempQuat.multiply(current));

						} else {
							if (vrstate.hmd.rotation[0] !== 0) {
								initQuaternion  = new THREE.Quaternion(vrstate.hmd.rotation[0],vrstate.hmd.rotation[1],
									vrstate.hmd.rotation[2],vrstate.hmd.rotation[3]).inverse();
							}
						}
					}
				}

				stackSize = 4;
				effect.render.apply(effect,arguments);
			} else {
				stackSize--;
				defaultRenderer.apply(renderer,arguments);
			}
		};
	};

	var self = this;
	loadJS("//raw.github.com/benvanik/vr.js/master/lib/vr.js", function() {
		loadJS("//raw.github.com/carstenschwede/RiftThree/master/lib/OculusRiftEffect.js", function() {
			ready = true;
			calls.forEach(function(call) {
				riftify.apply(self,call);
			});
		});
	});

})(window);