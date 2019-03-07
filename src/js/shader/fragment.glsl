uniform float time;
uniform float progress;
uniform float inside;

varying vec2 vUv;
varying vec2 vUv1;


// matcap
uniform samplerCube tCube;
uniform sampler2D matcap;
varying vec3 eye;
varying vec3 vNormal;
varying vec3 vPosition;

varying vec3 vReflect;

varying float vTemp;


void main()	{

	// matcap calc
	vec3 r = reflect( eye, vNormal );
	float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
	vec2 vN = r.xy / m + .5;
	vec3 base = texture2D( matcap, vN ).rgb;
	vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
	// end matcap

	vec3 light = normalize(vec3(12.,10.,10.));
	vec3 light1 = normalize(vec3(-12.,-10.,-10.));
	float l = clamp(dot(light, vNormal),0.6,1.);
	l += clamp(dot(light1, vNormal),0.2,1.)/2.;
	l /= 2.;
	
	if(inside>0.5){
		gl_FragColor = vec4(1.,0.,0.,1.);
		gl_FragColor = vec4(l,l,l,1.);
		// gl_FragColor = vec4(vNormal,1.);
		
	} else{
		gl_FragColor = vec4(abs(vNormal),1.);
		gl_FragColor = vec4(l,l,l,1.)*vec4(1.,0.,0.,1.);
		
		gl_FragColor = reflectedColor*vec4(1.,0.,0.,1.);
	}

	// gl_FragColor = vec4(vTemp);
	// gl_FragColor = vec4(-vReflect.x, vReflect.yz ,1.);
	// gl_FragColor = reflectedColor;
	// gl_FragColor = vec4(l,l,l,1.);
	// gl_FragColor = vec4(progress,0.,0.,1.);
	// gl_FragColor = vec4(1.,1.,1.,1.);
}