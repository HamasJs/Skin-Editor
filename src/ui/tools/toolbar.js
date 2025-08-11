import { css, html, LitElement, unsafeCSS } from "lit";
import Tool from "./tool";
import PartToggle from "./part_toggles";

import imgSteveAlex from "/assets/images/steve_alex.png";

class Toolbar extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: auto;
      padding: 0.25rem;
      width: 3.75rem;
      background-color: #131315;
      box-sizing: border-box;
    }

    #toolbar {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.25rem;
    }

    #tools {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .ncrs-toggle-row {
      display: flex;
      flex-direction: row;
      gap: 0;
      align-items: center;
      justify-content: center;
      padding-bottom: 2px;
      padding-top: 1px;
    }

    ncrs-toggle {
      display: block;
      width: 25px;
    }

    ncrs-toggle ncrs-icon {
        width: 25px;
        height: 25px;
        display: block;
    }

    ncrs-toggle::part(button):focus-visible, ncrs-quadroggle::part(button):focus-visible {
      outline: 1px solid white;
    }

    .hidden {
      display: none;
    }

    #toggle-variant {
      display: block;
      margin-bottom: 0.75rem;
    }

    #toggle-variant > div {
      padding-left: 0.25rem;
      width: 48px;
      height: 36px;
      image-rendering: pixelated;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        display: block;
        width: 20px;
        height: 20px;
        background: var(--background-before);
        background-size: 40px;
        filter: brightness(80%);
      }

      &::after {
        content: "";
        position: absolute;
        display: block;
        width: 24px;
        height: 24px;
        background: var(--background-after);
        background-size: 48px;
        right: 10px;
        top: 10px;
        outline: 2px white solid;
      }
    }

    #toggle-classic {
      --background-before: url(${unsafeCSS(imgSteveAlex)}) 20px 0px;
      --background-after: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
    }

    #toggle-slim {
      --background-before: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
      --background-after: url(${unsafeCSS(imgSteveAlex)}) 24px 0px;
    }

    ncrs-part-toggle {
      margin-bottom: 1rem;
    }
  `;

  constructor(ui) {
    super();

    this.ui = ui;
    this.partToggles = new PartToggle(this.ui.editor);
  }

  render() {
    this._setupEvents();

    return html`
      <div id="toolbar">
        ${this._renderTools()}
        ${this._renderToggles()}
      </div>
    `;
  }

  select(tool) {
    this.shadowRoot.querySelectorAll("ncrs-tool").forEach(element => {
      element.active = (tool == element.tool);
    })
  }

  _setupEvents() {
    this.ui.editor.addEventListener("select-tool", event => {
      this.select(event.detail.tool);
    });
  }

  _renderTools() {
    const editor = this.ui.editor;
    const div = document.createElement("div");
    div.id = "tools";

    editor.tools.forEach(tool => {
      const newTool = new Tool(this.ui, tool);

      if (tool.properties.id === "sculpt") {
        newTool.disabled = !editor.config.get("overlayVisible", false);
        editor.config.addEventListener("overlayVisible-change", event => {
          newTool.disabled = !event.detail;
        })
      }

      div.appendChild(newTool);
    });

    return div;
  }

  _renderToggles() {
    const cfg = this.ui.editor.config;
  }

  _toggleSkinModel(event) {
    const model = event.detail ? "slim" : "classic";
    this.ui.editor.setVariant(model);
  }

  _toggleOverlay(event) {
    this.ui.editor.setOverlayVisible(event.detail);
  }

  _toggleBase(event) {
    this.ui.editor.setBaseVisible(event.detail);
  }

  _toggleOverlayGrid(event) {
    this.ui.editor.setOverlayGridVisible(event.detail);
  }

  _toggleBaseGrid(event) {
    this.ui.editor.setBaseGridVisible(event.detail);
  }

  _toggleBackfaceCulling(event) {
    this.ui.editor.config.set("cullBackFace", event.detail);
  }
}

customElements.define("ncrs-toolbar", Toolbar);

export default Toolbar;