import * as THREE from 'three';
// window.THREE = THREE;
require('./lib/gltfloader');
import  './lib/draco';

import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';
import * as dat from 'dat.gui';


// import * as BAS from 'three-bas';

import {TimelineMax} from 'gsap';
var OrbitControls = require('three-orbit-controls')(THREE);


export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();
    // window.scene = this.scene;
    this.renderer = new THREE.WebGLRenderer(
      {
        antialias: true,
        // logarithmicDepthBuffer:true
      }
    );
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.shadowMap.renderSingleSided = false;
    // this.renderer.sortObjects = true;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerWidth);
    this.renderer.setClearColor( 0xcccccc, 1 );
    // this.raycaster = new THREE.Raycaster();

    this.container = document.getElementById('container');
    this.container.appendChild(this.renderer.domElement);
    // this.scene.fog = new THREE.Fog(0xfefefe, 3, 8);


    // loader init
    this.loader = new THREE.GLTFLoader().setPath( 'models/' );
    THREE.DRACOLoader.setDecoderPath( 'js/lib/draco/' );
    this.loader.setDRACOLoader( new THREE.DRACOLoader() );

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001, 10000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set( 0, 0, 4 );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.models = [];
    this.materials = [];


    
    this.setupResize();
    

    this.resize();
    
    // this.addLights();
    this.settings();

    


    // this.loadPlaceModel(
    //   'test.glb',
    //   100.8, 
    //   new THREE.Vector3(0,0,3),
    //   new THREE.Vector3(-0.35,-0.7,1),
    // 

    let g = new THREE.BoxBufferGeometry(2,2,2);
    let m = new THREE.MeshBasicMaterial( {color: 0x00ff00});
    this.scene.add(new THREE.Mesh(g,m));
    console.log(this.scene);
    this.animate();

    
  }



  settings() {
    // @todo cut geometry to change number of dots
    let that = this;
    this.settings = {
      progress: 0,
    };
    // this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'progress',0,1,0.01);
  }
  

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this)); 
  }

  resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.renderer.setSize( w, h );
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }



  render() {
    this.renderer.render(this.scene, this.camera);
  }




  loadPlaceModel(model, scale, rotation, position) {
    let that = this;
    
    this.loader.load( model, function( gltf ) {
      // let mat = that.createMaterial(max);
      // that.materials[index] = mat;
      console.log(gltf);
      gltf.scene.traverse( function( child ) {
        
        if ( child.isMesh ) {
          console.log(child.material.name);
          
          // if(child.name==='Voronoi_Fracture') alert('a');
          child.material = new THREE.MeshBasicMaterial( {color: 0xff0000,wireframe: true} );;
          // that.scene.add( child );
          // console.log(child.material.color);
        }

      } );
      gltf.scene.rotation.y = Math.PI/2;
      gltf.scene.scale.set(scale,scale,scale);
      // gltf.scene.renderOrder = -10;
      // that.scene.add( gltf.scene );
      // gltf.scene.visible = false;
      // console.log(gltf.scene.position, position);
      gltf.scene.position.copy(position);

      

    }, undefined, function( e ) {

      console.error( e );

    } );



  }







  addLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-3, 2, 2);
    // directionalLight.position.set(10, 10, 0);
    this.scene.add(directionalLight);
    let helper = new THREE.CameraHelper( directionalLight.shadow.camera );
    this.scene.add(helper);



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

    var helper1 = new THREE.CameraHelper( light.shadow.camera );
    this.scene.add( helper1 );
  }





  animate() {
    this.time += 0.05;



    
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

new Sketch('container');
