import * as THREE from 'three';

import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';
import * as dat from 'dat.gui';
require('./lib/gltfloader');
import  './lib/draco';
import './lib/BufferUtils';


// import * as BAS from 'three-bas';

import {TimelineMax} from 'gsap';
var OrbitControls = require('three-orbit-controls')(THREE);

function getRandomAxis() {
  return new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
}
const sign = function(n) { return n === 0 ? 1 : n/Math.abs(n); };


// make that for buffer geometry .attributes.position
function getCentroid(geometry) {
  let ar = geometry.attributes.position.array;
  let len = ar.length;
  let x=0,y=0,z=0;
  for (let i = 0; i < len; i=i+3) {
    x += ar[i];
    y += ar[i+1];
    z += ar[i+2];
  }
  return {x:3*x/len,y:3*y/len,z:3*z/len};
}


export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = 0;
    this.mouseY = 0;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor( 0x000000, 1 );

    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001, 1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set( 0, 0,4 );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.loader = new THREE.GLTFLoader().setPath( 'models/' );
    THREE.DRACOLoader.setDecoderPath( 'js/lib/draco/' );
    this.loader.setDRACOLoader( new THREE.DRACOLoader() );


    
    this.setupResize();
    
    this.setupcubeTexture();
    this.resize();
    this.addLights();
    this.addObjects();
    this.animate();
    this.load();
    this.settings();
    this.mouse();

    // let g = new THREE.BoxBufferGeometry(2,2,2);
    // let m = new THREE.MeshBasicMaterial( {color: 0x00ff00});
    // this.scene.add(new THREE.Mesh(g,m));

  }

  settings() {
    // @todo cut geometry to change number of dots
    let that = this;
    this.settings = {
      progress: 0
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress',0,0.25,0.001);
  }


  load() {
    let that = this;
    let i = 0;
    let parent;
    let pos = new THREE.Vector3(0,0,0);
    let poses = [];
    this.voron = [];

    this.loader.load( 'heart-high.glb', function( gltf ) {
 
      // console.log(gltf.scene);



      gltf.scene.traverse( function( child ) {
        if(child.isMesh) {
          // child.material = new THREE.MeshBasicMaterial( {wireframe:true,depthTest: false,color: 0x00ff00} );
        }
        if ( child.name==='Voronoi_Fracture' ) {
          console.log(child,'VORONOI');
          // console.log(child.children.length,child.children[0].children.length,'len');

          if(child.children[0].children.length>2) {
            child.children.forEach(f => {
              f.children.forEach(m => {
                that.voron.push(m.clone());
              });
            });
          } else{
            child.children.forEach(m => {
              that.voron.push(m.clone());
            });
          }
          
        }
      } );
      
      // that.scene.add(that.voron,'vor');
      // console.log(that.voron,'voron');
      // that.voron.forEach(m => {
      //   that.scene.add(m.clone());
      //   console.log('test vvv');
      // });
      // console.log(that.scene);
      that.geoms = [];
      that.geoms1 = [];
      let j = 0;
      that.voron = that.voron.filter(v => {

        if(v.isMesh) return false;
        else {
          j++;
          console.log(j,v);
          let vtempo = that.processSurface(v, j);


          that.geoms.push(vtempo.surface);
          that.geoms1.push(vtempo.volume);
          return true;
        }
      });

      let s = THREE.BufferGeometryUtils.mergeBufferGeometries(that.geoms, false);
      let mesh = new THREE.Mesh(
        s,that.material
      );
      that.scene.add(mesh);

      let s1 = THREE.BufferGeometryUtils.mergeBufferGeometries(that.geoms1, false);
      let mesh1 = new THREE.Mesh(
        s1,that.material1
      );
      that.scene.add(mesh1);

      // mesh.rotation.y = mesh1.rotation.y = Math.PI/2;

      // let tl = new TimelineMax();
      // tl.fromTo(that.settings,5,
      //   {progress: 0},
      //   {yoyo:true,progress:1, repeat: 3}
      // ).repeatDelay(2).repeat(-1);



    }, undefined, function( e ) {

      console.error( e );

    } );


    

  }

  // begin surface
  // begin surface
  // begin surface
  // begin surface
  processSurface(v,j) {

    let c = v.position;
    let vtemp, vtemp1;
    // console.log(c);
    // c = new THREE.Vector3(0,0,0);
    // geometry changes
    vtemp = v.children[0].geometry.clone();
    // vtemp = vtemp.applyMatrix( new THREE.Matrix4().makeRotationY(Math.PI/2) );
    vtemp = vtemp.applyMatrix( new THREE.Matrix4().makeTranslation(c.x, c.y, c.z ));
    // let vtemp = v.children[0].geometry;
    vtemp1 = v.children[1].geometry;
    // vtemp1 = vtemp1.applyMatrix( new THREE.Matrix4().makeRotationY(Math.PI/2) );
    vtemp1 = vtemp1.clone().applyMatrix( new THREE.Matrix4().makeTranslation(c.x, c.y, c.z ));
    // debug
    // let mesh = new THREE.Mesh(vtemp1, new THREE.MeshBasicMaterial( {color:0xff0000,side: THREE.DoubleSide, wireframe: true}));
    // v.children[0].material = new THREE.MeshBasicMaterial( {wireframe:true,color:0xff0000,side: THREE.DoubleSide});
    // v.children[1].material = new THREE.MeshBasicMaterial( {wireframe:true,color:0x00ff00,side: THREE.DoubleSide});
    // console.log({v});
    // let test = v.clone();
    // let nn = v.children[1].clone();
    // nn.geometry = v.children[1].geometry.clone();
    // nn.material = new THREE.MeshBasicMaterial( {color:0x00ff00,side: THREE.DoubleSide, wireframe: true});
    // nn.position.copy(v.position);
    
    // nn.rotation.copy(v.rotation);
    // nn.rotateX(Math.PI);
    // nn.geometry.applyMatrix( new THREE.Matrix4().makeRotationX(Math.PI) );

    // console.log(v.rotation,'rot');
    // nn.position.copy(v.position);
    // nn.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(v.position.x, v.position.y, v.position.z ) );

    // nn.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(-v.position.x, -v.position.y, -v.position.z ) );
    // nn.geometry.applyMatrix( new THREE.Matrix4().makeRotationX(Math.PI) );
    // nn.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(v.position.x, v.position.y, v.position.z ) );

    // console.log({v},{nn},{test});
    // this.scene.add(test);
    // if(j===1) {
    // this.scene.add(test);
    // this.scene.add(nn);
    // this.scene.add( new THREE.AxesHelper( 20 ) );
    // }
    
    // 
    // console.log({nn});
    


    let len = v.children[0].geometry.attributes.position.array.length/3;
    let len1 = v.children[1].geometry.attributes.position.array.length/3;
    console.log(len,len1);
    // fragment id
    let offset = new Array(len).fill(j/100);
    vtemp.addAttribute( 'offset', new THREE.BufferAttribute( new Float32Array(offset), 1 ) );

    let offset1 = new Array(len1).fill(j/100);
    vtemp1.addAttribute( 'offset', new THREE.BufferAttribute( new Float32Array(offset1), 1 ) );

    // axis
    let axis = getRandomAxis();
    let axes = new Array(len*3).fill(0);
    let axes1 = new Array(len1*3).fill(0);
    for (let i = 0; i < len*3; i=i+3) {
      axes[i] = axis.x;
      axes[i+1] = axis.y;
      axes[i+2] = axis.z;
    }
    vtemp.addAttribute( 'axis', new THREE.BufferAttribute( new Float32Array(axes), 3 ) );
    // volume axes
    for (let i = 0; i < len1*3; i=i+3) {
      axes1[i] = axis.x;
      axes1[i+1] = axis.y;
      axes1[i+2] = axis.z;
    }
    vtemp1.addAttribute( 'axis', new THREE.BufferAttribute( new Float32Array(axes1), 3 ) );


    // centroid
    let centroidVector = getCentroid(vtemp);
    let centroid = new Array(len*3).fill(0);
    let centroid1 = new Array(len1*3).fill(0);
    for (let i = 0; i < len*3; i=i+3) {
      centroid[i] = centroidVector.x;
      centroid[i+1] = centroidVector.y;
      centroid[i+2] = centroidVector.z;
    }
    for (let i = 0; i < len1*3; i=i+3) {
      centroid1[i] = centroidVector.x;
      centroid1[i+1] = centroidVector.y;
      centroid1[i+2] = centroidVector.z;
    }
    vtemp.addAttribute( 'centroid', new THREE.BufferAttribute( new Float32Array(centroid), 3 ) );
    vtemp1.addAttribute( 'centroid', new THREE.BufferAttribute( new Float32Array(centroid1), 3 ) );
    

    return {surface: vtemp, volume: vtemp1};
  }
  // end surface
  // end surface
  

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this)); 
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }



  render() {
    this.renderer.render(this.scene, this.camera);
  }


  addLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-3, 2, 2);
    // directionalLight.position.set(10, 10, 0);
    this.scene.add(directionalLight);
    // let helper = new THREE.CameraHelper( directionalLight.shadow.camera );
    // this.scene.add(helper);



    // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
    // directionalLight2.position.set(-10, 20, 1);
    // directionalLight2.castShadow = true;
    // directionalLight2.shadow.camera.near = -2;
    // directionalLight2.shadow.camera.far = 10;
    // this.scene.add(directionalLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    // const light1 = new THREE.HemisphereLight(0x776E88, 0xffffff, .5);
    // this.scene.add(light1);


    // let light = new THREE.SpotLight(0xffffff);
    // light.position.set(700, 0, 0);
    // // light.angle = .8;
    // light.intensity = 100;
    // let helper1 = new THREE.CameraHelper( light.shadow.camera );
    // // this.scene.add(helper1);


    // var light3 = new THREE.PointLight( 0xffffff, 1, 1000 );
    // light3.position.set( -700, 0, 0 );
    // this.scene.add( light3 );
    // let helper3 = new THREE.CameraHelper( light3.shadow.camera );
    // this.scene.add(helper3);

    var light = new THREE.SpotLight( 0xffffff, 0.3 );
    light.angle = Math.PI/2 - 0.2;
    light.penumbra = 0;
    // light.castShadow = true; // default false
    // light.receiveShadow = true; // default false
    
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 4096; // default
    light.shadow.mapSize.height = 4096; // default
    light.shadow.camera.near = 0.3; // default
    
    light.shadow.camera.far = 5; //
    this.scene.add( light );

    // var helper1 = new THREE.CameraHelper( light.shadow.camera );
    // this.scene.add( helper1 );
  }

  setupcubeTexture() {
    let that = this;
    let path = 'img/newsky/';
    let format = '.jpg';
    let urls1 = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
    this.textureCube = new THREE.CubeTextureLoader().load( urls1 );

    // return new Promise(resolve => {
    //   that.textureCube1 = new THREE.CubeTextureLoader().load( urls1, resolve );
    // });
    // this.textureCube1.format = THREE.RGBFormat;
  }


  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial( {
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        progress: { type: 'f', value: 0 },
        inside: { type: 'f', value: 0 },
        matcap: { type: 't', value: new THREE.TextureLoader().load('img/matcap.jpg') },
        tCube: { value: that.textureCube },
        pixels: {type: 'v2', value: new THREE.Vector2(window.innerWidth,window.innerHeight)},
        uvRate1: {
          value: new THREE.Vector2(1,1)
        },
      },
      // wireframe: true,
      // transparent: true,
      // flatShading: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.material1 = this.material.clone();
    this.material1.uniforms.inside.value = 1;

    // this.geometry = new THREE.PlaneGeometry( 1, 1, 1,1 );
    


    // this.points = new THREE.Mesh(this.geometry,this.material);
    // this.scene.add(this.points);


  }


  mouse() {

    document.addEventListener('mousemove',(e) => {
      this.mouseX = 2*(e.clientX - this.width/2)/this.width;
      this.mouseY = 2*(e.clientY - this.height/2)/this.height;
      let dist = Math.sqrt(this.mouseX*this.mouseX + this.mouseY*this.mouseY);
      dist = this.mouseX;
      this.settings.progress = dist*dist;
    });
  }



  animate() {
    this.time += 0.05;
    this.material.uniforms.progress.value = this.settings.progress;
    this.material1.uniforms.progress.value = this.settings.progress;
    let t = this.settings.progress;
    this.scene.rotation.y = Math.PI/2 - t*(2 - t)*1*Math.PI * sign(this.mouseX);
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

new Sketch('container');
