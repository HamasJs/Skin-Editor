import { html } from "lit";
import BaseToolConfig from "./base_tool_config";
import EraseTool from "../../../../../editor/tools/toolset/erase_tool";

class EraseToolConfig extends BaseToolConfig {
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
    this.tool = new EraseTool(config);
  }

  render() {
 
  }
}

customElements.define("ncrs-erase-tool-config", EraseToolConfig);

export default EraseToolConfig;
