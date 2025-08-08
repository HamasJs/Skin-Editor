import { html } from "lit";
import BaseToolConfig from "./base_tool_config";
import SculptTool from "../../../../../editor/tools/toolset/sculpt_tool";

class SculptToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    size: {},
    shape: {},
    mirror: {},
  }

  constructor(config) {
    super(config, {
      size: {
        type: "select", number: true,
        options: [{icon: "size-1", value: 1}, {icon: "size-2", value: 2}, {icon: "size-3", value: 3}]
      },
      shape: {
        type: "select",
        options: [{icon: "square", value: "square"}, {icon: "circle", value: "circle"}]
      },
      mirror: {type: "toggle", icon: "mirror", title: "Toggle mirror\nMirrors the stroke across the skin"},
    });
    this.tool = new SculptTool(config);
  }

  render() {
    return html`
      <div id="main">
        <h2>Sculpt Tool</h2>
        <div class="group">
          <div>
            <p class="title">Size</p>
            ${this._sizeControl()}
          </div>
          <div>
            <p class="title">Shape</p>
            ${this._shapeControl()}
          </div>
        </div>
        <div>
          <p class="title">Effects</p>
          <div class="group-sm">
            ${this._mirrorControl()}
          </div>
        </div>
        <p class="description">${this.tool.properties.description}</p>
      </div>
    `;
  }
}

customElements.define("ncrs-sculpt-tool-config", SculptToolConfig);

export default SculptToolConfig;
