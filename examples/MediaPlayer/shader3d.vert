
	uniform sampler2D texture;
	uniform sampler2D dispTexture;

	uniform float uDisplacementScale;
	uniform float uDisplacementBias;
	uniform float fNumImages;
	uniform float bL;
	uniform float bLD;
	uniform float bL_D;
	uniform float bD;


	uniform float bLR;
	uniform float bLRD;
	uniform float bLRDL;
	uniform float bLRDR;


	varying vec2 vUv;
	varying vec3 vNormal;

	void main() {
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		vNormal = normalize( normalMatrix * normal );


		vUv = uv;

		vec2 dispCoord = vec2(uv);

		//SBS 2D

		vec4 displacedPosition = mvPosition;

		if (bL > 0.5) {

		}

		if (bLR > 0.5) {

		}


		//DEPTH MAPPING
		if (bLD > 0.5) {
			if (dispCoord.x > 0.5)
				dispCoord.x = dispCoord.x - 0.5;
			dispCoord.x+=0.5;
			vec4 dv  = texture2D( texture, dispCoord );
			float l = length(dv.xyz)/3.0*dv.a;
			displacedPosition  = vec4( vNormal.xyz * l * uDisplacementScale + uDisplacementBias, 0.0 ) + mvPosition;
		}

		if (bL_D > 0.5) {
		dispCoord.y-=0.5;
			vec4 dv  = texture2D( texture, dispCoord ).rgba;
			float l = length(dv.xyz)/3.0*dv.a;
			displacedPosition  = vec4( vNormal.xyz * l * uDisplacementScale + uDisplacementBias, 0.0 ) + mvPosition;
		}

		if (bD > 0.5) {
			vec4 dv  = texture2D( texture, dispCoord ).rgba;
			float l = dv.r*dv.a;
			displacedPosition  = vec4( vNormal.xyz * l * uDisplacementScale + uDisplacementBias, 0.0 ) + mvPosition;
		}

		if (bLRD > 0.5 || bLRDL > 0.5 || bLRDR > 0.5) {
			if (dispCoord.x > 1.0/3.0)
				dispCoord.x = (dispCoord.x - 1.0/3.0);
			dispCoord.x+=2.0/3.0;
			vec3 dv  = texture2D( texture, dispCoord ).xyz;
			float l = dv.r;
			displacedPosition  = vec4( vNormal.xyz * l * uDisplacementScale + uDisplacementBias, 0.0 ) + mvPosition;
		}


		gl_Position = projectionMatrix * displacedPosition;
}