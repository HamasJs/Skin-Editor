import { html, nothing } from "lit";
import BaseToolConfig from "./base_tool_config";
import PenTool from "../../../../../editor/tools/toolset/pen_tool";

class PenToolConfig extends BaseToolConfig {
  static styles = [
    BaseToolConfig.styles
  ];

  static properties = {
    size: {},
    shape: {},
    mirror: {},
    camo: {},
    blend: {},
  }

  constructor(config) {
    super(config, {
      size: {
        type: "select", number: true,
        options: [{icon: "size-1", value: 1}, {icon: "size-2", value: 2}, {icon: "size-3", value: 3}]
      },
      shape: {
        type: "select",
        options: [{icon: "square", value: "square"}, {icon: "circle", value: "circle"}],
      },
      mirror: {type: "toggle", icon: "mirror", title: "Toggle mirror\nMirrors the stroke across the skin"},
      camo: {type: "toggle", icon: "camo", title: "Toggle camo\nRandomly lightens and darkens the current color"},
      blend: {type: "toggle", icon: "blend", title: "Toggle blend\nRandomly selects colors from the blend palette"},
    });
    this.tool = new PenTool(config);
  }

  render() {
    return ;
  }
}

customElements.define("ncrs-pen-tool-config", PenToolConfig);

export default PenToolConfig;
