var stereoTypes = {
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