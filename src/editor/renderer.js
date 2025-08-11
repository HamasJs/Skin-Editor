import * as THREE from "three";
import {
  EffectComposer,
  OutputPass,
  RenderPass,
} from "three/examples/jsm/Addons.js";

class Renderer {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this._setupRenderer();
    this._setupComposer();
  }

  renderer;
  composer;

  canvas() {
    return this.renderer.domElement;
  }

  render() {
    this.composer.render();
  }

  updateSize(width, height) {
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  setAnimationLoop(fn) {
    this.renderer.setAnimationLoop(fn);
  }

  _setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = "absolute";

    this.renderer = renderer;
  }

  _setupComposer() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    const outputPass = new OutputPass();

    composer.addPass(renderPass);
    composer.addPass(outputPass);

    this.composer = composer;
  }
}

export { Renderer };
