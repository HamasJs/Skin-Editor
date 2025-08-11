import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../constants";
import { getUV } from "./texture_utils";

const OPERATIONS = [
  // Left Leg
  ["leg_right_base_right", 16, 52],
  ["leg_right_base_front", 20, 52],
  ["leg_right_base_left", 24, 52],
  ["leg_right_base_back", 28, 52],
  ["leg_right_base_top", 20, 48],
  ["leg_right_base_bottom", 24, 48],

  // Left Arm
  ["arm_right_base_right", 32, 52],
  ["arm_right_base_front", 36, 52],
  ["arm_right_base_left", 40, 52],
  ["arm_right_base_back", 44, 52],
  ["arm_right_base_top", 36, 48],
  ["arm_right_base_bottom", 40, 48],
]

function convertLegacySkin(imgSource) {
  const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(imgSource, 0, 0);

  OPERATIONS.forEach(op => {
    const uv = getUV("classic", op[0]);

    const tempCanvas = new OffscreenCanvas(uv.width, uv.height);
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.scale(-1, 1);
    tempCtx.drawImage(imgSource, ...Object.values(uv), -uv.width, 0, uv.width, uv.height);

    ctx.drawImage(tempCanvas, ...op.slice(1));
  });

  return canvas;
}

export default convertLegacySkin;