import Color from "color";
import BrushBaseTool from "../brush_tool";

class SculptTool extends BrushBaseTool {
  constructor(config) {
    super(config, {
      id: "sculpt",
      icon: "sculpt",
      name: "Sculpt [Shift+S]",
      description: "Copy pixels from base layer to overlay.\nOnly works when overlay is visible.",
      providesColor: false, // Whether or not drawing with this tool adds to recent colors.
    });
  }

  down(toolData) {
    return this.process(toolData);
  }

  move(toolData) {
    return this.process(toolData);
  }

  process(toolData) {
    const texture = toolData.texture;
    const part = toolData.parts[0];
    const point = toolData.getCoords();

    this.cursor = point;

    function getColor(offsetX, offsetY) {
      return function (pos) {
        const currentColor = texture.getPixel(pos);
        if (currentColor.valpha !== 0) { return currentColor; }

        return texture.getPixel({x: pos.x + offsetX, y: pos.y + offsetY})
      };
    }

    function getColor2(pos) {
      const currentColor = texture.getPixel({x: point.x + pos.offsetX, y: point.y + pos.offsetY});

      if (currentColor.valpha === 0) { return texture.getPixel(pos); }

      return currentColor;
    }

    const alphaIsZero = texture.getPixel({ x: point.x, y: point.y }).valpha === 0;

    if (point.x >= 32 && point.x <= 64 && point.y >= 0 && point.y <= 15 && toolData.button==1 && alphaIsZero) {
      // Head
      this.draw(texture, part, point, getColor(-32, 0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 55 && point.y >= 32 && point.y <= 47 && toolData.button==1 && alphaIsZero) {
      // Right Arm, Right Leg and Torso
      this.draw(texture, part, point, getColor(0, -16), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 15 && point.y >= 48 && point.y <= 63 && toolData.button==1 && alphaIsZero) {
      // Left Leg
      this.draw(texture, part, point, getColor(16, 0), toolData.variant, false);
    }
    else if (point.x >= 48 && point.x <= 63 && point.y >= 48 && point.y <= 63 && toolData.button==1 && alphaIsZero) {
      // Left Arm
      this.draw(texture, part, point, getColor(-16, 0), toolData.variant, false);
    }

    else if (point.x >= 32 && point.x <= 64 && point.y >= 0 && point.y <= 15 && toolData.button==2 && !alphaIsZero) {
      // Head
      this.draw(texture, part, { x: point.x-32, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 55 && point.y >= 32 && point.y <= 47 && toolData.button==2 && !alphaIsZero) {
      // Right Arm, Right Leg and Torso
      this.draw(texture, part, { x: point.x, y: point.y-16 }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 0 && point.x <= 15 && point.y >= 48 && point.y <= 63 && toolData.button==2 && !alphaIsZero) {
      // Left Leg
      this.draw(texture, part, { x: point.x+16, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }
    else if (point.x >= 48 && point.x <= 63 && point.y >= 48 && point.y <= 63 && toolData.button==2 && !alphaIsZero) {
      // Left Arm
      this.draw(texture, part, { x: point.x-16, y: point.y }, getColor2, toolData.variant, false);
      this.draw(texture, part, point, new Color(0).alpha(0), toolData.variant, false);
    }

    return texture.toTexture();
  }

  up() {}
}

export default SculptTool;
