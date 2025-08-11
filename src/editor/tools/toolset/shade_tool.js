import BrushBaseTool from "../brush_tool";

// Scales the force
const SHADE_SCALAR = 5;

class ShadeTool extends BrushBaseTool {
  constructor(config) {
    super(config, {
      id: "shade",
      icon: "shading",
      name: "Shade [S]",
      description: "Makes pixels lighter/darker or adjusts their color based on the palette.",
      providesColor: false, // Whether or not drawing with this tool adds to recent colors.,
      disableMirror: true, // Whether to disable the mirror.
    });
  }

  _visited = new Set();
  _lastPixel = "";

  down(toolData) {
    this.shade(toolData);

    return toolData.texture.toTexture();
  }

  move(toolData) {
    this.shade(toolData);

    return toolData.texture.toTexture();
  }

  up() {
    this._visited.clear();
    this._lastPixel = "";
  }

  shade(toolData) {
    const texture = toolData.texture;
    const point = toolData.getCoords();
    this.cursor = point;
    
    const force = this.config.get("force", 1) * SHADE_SCALAR;
    const shadeOnce = this.config.get("shadeOnce", false);
    const shadeStyle = this.config.get("shadeStyle", "lighten");

    const pointStr = `${point.x}:${point.y}`;
    if (shadeOnce && this._visited.has(pointStr)) { return; }
    if (this._lastPixel === pointStr) { return; }

    function getColor(point) {
      let color = texture.getPixel(point);
      
      if (shadeStyle === "saturate") {
        const scalar = 0.01;
        color = toolData.button == 1 ? color.saturate(force * scalar) : color.desaturate(force * scalar);
      } else {
        color.color[0] = toolData.button == 1 ? color.color[0]-force : color.color[0]+force;
        color.color[1] = toolData.button == 1 ? color.color[1]-force : color.color[1]+force;
        color.color[2] = toolData.button == 1 ? color.color[2]-force : color.color[2]+force;
      }

      return color;
    }

    this.draw(texture, toolData.parts[0], point, getColor, toolData.variant);

    this._visited.add(pointStr);
    this._lastPixel = pointStr;
  }
}

export default ShadeTool;
