import * as THREE from "three";
import CanvasHelper from "./canvas_helper";

class BaseTool {
  constructor(config, properties) {
    this.config = config;
    this.properties = properties;
  }
  properties;

  down(_texture, _part, _x, _y, _pointerButton) {}
  move(_part, _x, _y, _pointerButton) {}
  up(_x, _y) {}

  tempCanvas() {
    return new CanvasHelper();
  }

  canvasToTexture(canvas) {
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    return texture;
  }
}

export { BaseTool };