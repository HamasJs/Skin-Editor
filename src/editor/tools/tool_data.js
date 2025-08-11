import * as THREE from "three";
import CanvasHelper from "./canvas_helper";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../constants";

class ToolData {
  constructor(params) {
    this.texture = this._setupCanvas(params.texture);
    this.parts = params.parts;
    this.button = params.button;
    this.variant = params.variant;
  }

  hasOverlay() {
    return this.parts.length > 1;
  }

  getCoords(layer = 0) {
    const part = this.parts.at(layer);

    const pixel = new THREE.Vector2(part.uv.x * IMAGE_WIDTH, part.uv.y * IMAGE_HEIGHT);
    pixel.x = Math.floor(pixel.x);
    pixel.y = IMAGE_HEIGHT - Math.ceil(pixel.y);

    return pixel;
  }

  _setupCanvas(texture) {
    const canvas = new CanvasHelper();
    canvas.drawImage(texture, 0, 0);

    return canvas;
  }
}

export default ToolData;
