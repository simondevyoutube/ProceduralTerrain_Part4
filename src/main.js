import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/dat.gui.module.js';
import {controls} from './controls.js';
import {game} from './game.js';
import {terrain} from './terrain.js';
import {textures} from './textures.js';


let _APP = null;



class ProceduralTerrain_Demo extends game.Game {
  constructor() {
    super();
  }

  _OnInitialize() {
    this._textures = new textures.TextureAtlas(this);
    this._textures.onLoad = () => {};
    this._CreateGUI();

    this._userCamera = new THREE.Object3D();
    this._userCamera.position.set(4100, 0, 0);
    this._graphics.Camera.position.set(7000, 7000, 7000);

    this._entities['_terrain'] = new terrain.TerrainChunkManager({
      camera: this._userCamera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
    });

    this._entities['_controls'] = new controls.OrbitControls({
      camera: this._graphics.Camera,
      scene: this._graphics.Scene,
      domElement: this._graphics._threejs.domElement,
      gui: this._gui,
      guiParams: this._guiParams,
    });

    this._focusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(25, 32, 32),
      new THREE.MeshBasicMaterial({
          color: 0xFFFFFF
      }));
    this._focusMesh.castShadow = true;
    this._focusMesh.receiveShadow = true;
    this._graphics.Scene.add(this._focusMesh);

    this._totalTime = 0;

    this._LoadBackground();
  }

  _CreateGUI() {
    this._guiParams = {
      general: {
      },
    };
    this._gui = new GUI();

    const generalRollup = this._gui.addFolder('General');
    this._gui.close();
  }

  _LoadBackground() {
    this._graphics.Scene.background = new THREE.Color(0x000000);
  }

  _OnStep(timeInSeconds) {
    this._totalTime += timeInSeconds;

    const x = Math.cos(this._totalTime * 0.025) * 4100;
    const y = Math.sin(this._totalTime * 0.025) * 4100;
    this._userCamera.position.set(x, 0, y);

    this._focusMesh.position.copy(this._userCamera.position);
  }
}


function _Main() {
  _APP = new ProceduralTerrain_Demo();
}

_Main();
