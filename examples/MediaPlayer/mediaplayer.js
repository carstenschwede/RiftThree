if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var riftifyOptions = {
				useHeadTracking: true
			};


			var geometry, texture,scene,camera, renderer,media;
			var cameraAutoPilot = null;


			/*********************************************/
			//Load Shaders
			/*********************************************/

			$.when($.ajax("shader3d.frag"),$.ajax("shader3d.vert")).done(function(fragment,vertex) {
				if (init(fragment[0],vertex[0])) animate();
			}).fail(function() {
				console.log("Failure loading Shaders");
			});

			function init(fragment,vertex) {
				var container = document.createElement( 'div' );
				document.body.appendChild( container );

				scene = new THREE.Scene();


				/*********************************************/
				//Camera, FOV = 120
				/*********************************************/
				camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 1, 10000 );



				/*********************************************/
				//Renderer
				/*********************************************/
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );


				/*********************************************/
				//Statistics, FPS, ...
				/*********************************************/
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );


				/*********************************************/
				//Determine 2d/3d source
				/*********************************************/
				$('.riftmedia').css("display","none");
				var index = 0;
				if (document.location.hash) {
					index = parseInt(document.location.hash.replace("#","")) || 0;
				}
				media = $('.riftmedia').get(index);
				if (!media) {
					console.log("no rift media found");
					return false;
				}
				var stereoTypeKey = media.getAttribute("data-stereotype").toUpperCase();
				var stereoType = RiftThree.StereoTypes[stereoTypeKey];
				if (!stereoType) {
					console.log(media,stereoType,"is unknown type, use",Object.keys(RiftThree.StereoTypes));
					return false;
				}

				/*********************************************/
				//Load media
				/*********************************************/
				var isVideo = (media.tagName == "VIDEO");
				if (isVideo) {
					media.addEventListener('loadedmetadata', function() {
						texture = new THREE.Texture(media);
						onMediaLoaded({
							width: media.videoWidth,
							height: media.videoHeight,
							duration: media.duration
						});
					});
					media.play();
				} else {

					var src = media.getAttribute("src");
					if (src) {
						texture = new THREE.ImageUtils.loadTexture(src,false,function() {
							onMediaLoaded({
								width: media.width,
								height: media.height,
								duration: 0
							});
						});
					}
					var address = media.getAttribute("data-address");
					if (address ) {
						var lat = address.split(", ")[0];
						var lng = address.split(", ")[1];
						var _panoLoader = new GSVPANO.PanoLoader({zoom: 3});

						_panoLoader.onPanoramaLoad = function() {

							texture = new THREE.Texture(_panoLoader.canvas);
							texture.needsUpdate = true;

							onMediaLoaded({
								width: _panoLoader.canvas.width,
								height: _panoLoader.canvas.height,
								duration: 0
							});
						};

						_panoLoader.load(new google.maps.LatLng(lat,lng));
					};
				}

				function onMediaLoaded(properties) {
					texture.minFilter = texture.magFilter = THREE.LinearFilter;
					texture.format = THREE.RGBAFormat;
					texture.generateMipmaps = false;

					var uniforms = {
						texture: { type: "t", value: texture},
						fBrightess: {type:"f",value:1.0},
						fContrast: {type:"f",value:1.0},
						fSaturation: {type:"f",value:1.6},
						fGamma: {type:"f",value:0.8},
						uDisplacementBias: {type:"f",value:0.0},
						uDisplacementScale: {type:"f",value:400.0}
					};

					if (media.getAttribute("data-displacement")) {
						uniforms.uDisplacementScale.value = parseFloat(media.getAttribute("data-displacement"),10);
					}

					//Add float flags to let shader know what kind of "stereotype" we have (false < 0.5 < true)
					Object.keys(RiftThree.StereoTypes).forEach(function(key) {var obj = {type: "f"};if (key == stereoTypeKey) {obj.value = 1.0;} else {obj.value = 0.0;}uniforms["b" + key.replace(/!/g,"")] = obj;});

					var materialVideo = new THREE.ShaderMaterial({
						uniforms: uniforms,
						vertexShader: vertex,
						fragmentShader: fragment,
						side: THREE.DoubleSide
					});


					/*********************************************/
					//Calculate actual size of content image
					/*********************************************/
					var left = [], right = [];
					stereoType.uv({x: 0,y: 0},left,right);
					stereoType.uv({x: properties.width,y: properties.height},left,right);

					var pixelSize = {
						width: Math.floor(left[1].x-left[0].x),
						height: Math.floor(left[1].y-left[0].y),
						ar: 0
					};

					pixelSize.ar = pixelSize.width/pixelSize.height;
					var ar = pixelSize.ar;//properties.width/properties.height;
					if (media.getAttribute("data-ar")) {
						ar = parseFloat(media.getAttribute("data-ar"),10);
					}

					var geometrySize = {
						width: 1000,
						height: 0
					};

					geometrySize.height = Math.floor(geometrySize.width/ar);
					//console.log(geometrySize,properties,pixelSize);
					/*********************************************/
					//Calculate number of segments to display image
					/*********************************************/

					var depthResolution = 0.1;
					var segmentSize = {
						width: Math.floor(geometrySize.width*depthResolution),
						height: Math.floor(geometrySize.height*depthResolution)
					};

					if (!stereoType.disp) {
						segmentSize.width = segmentSize.height = 1;
					}

					switch(stereoType.geometry.toLowerCase()) {
						case "sphere":
							geometry = new THREE.SphereGeometry( 1500, 64, 64 );

							camera.position.x = camera.position.y = camera.position.z = 0;
							break;
						case "plane":
							geometry = new THREE.PlaneGeometry(geometrySize.width,geometrySize.height,segmentSize.width,segmentSize.height);
							geometry.computeTangents();
							camera.position.z = 400;
							break;
					}

					geometry.stereoType = stereoType;
					riftifyOptions.geometriesWith3DTextures = [geometry];

					var movieScreen = new THREE.Mesh(geometry, materialVideo);

					switch(stereoType.geometry.toLowerCase()) {
						case "sphere":
							movieScreen.rotation.y = Math.PI/2;
							break;
						case "plane":
							movieScreen.position.set(0,100,0);
							break;
					}

					if(stereoType.disp) {
						camera.position.x = 0;
						camera.position.y = 100;
						camera.position.z = 1000;
						if (cameraAutoPilot === null)
							cameraAutoPilot = true;
					}

					scene.add(movieScreen);

					/*********************************************/
					//Create HUD with forward/backward buttons
					/*********************************************/
					/*
					HUD.init({
						forward: {
							geometry: {
								geometry: new THREE.SphereGeometry(20,10,10),
								material: new THREE.MeshBasicMaterial({
									color: 0xff00ff
								}),
								position: new THREE.Vector3(50,400,0)
							},
							action: function(button) {
								video.currentTime = video.currentTime + 10;
							},
							keepPressed: true
						},
						backward: {
							geometry: {
								geometry: new THREE.SphereGeometry(20,10,10),
								material: new THREE.MeshBasicMaterial({
									color: 0xff00ff
								}),
								position: new THREE.Vector3(-50,400,0)
							},
							action: function(button) {
								video.currentTime = Math.max(video.currentTime - 10,0);
							},
							keepPressed: true
						}
					},scene);
					*/

					window.addEventListener( 'resize', onWindowResize, false );
					window.renderer = renderer;
					window.RiftThree(null,riftifyOptions);
				}

				return true;
			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {
				requestAnimationFrame(animate);
				render();
				//HUD.update(camera);
				stats.update();
			}

			function render() {
				if (media.readyState && media.readyState === media.HAVE_ENOUGH_DATA ) {
					if (texture) texture.needsUpdate = true;
				}



				// move the camera back and forth
				if (cameraAutoPilot) {
					var seconds		= Date.	now() / 1000;
					var radius		= 1200;
					var angle		= Math.sin(0.25 * seconds * Math.PI) / 4;
					camera.position.x	= Math.cos(angle - Math.PI/2) * radius;
					camera.position.y	= 100 + Math.sin(0.25 * seconds * Math.PI/2) * 200;
				}




				renderer.render(scene,camera);
			}

