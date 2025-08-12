import { css, html, LitElement, unsafeCSS } from "lit";
import Tool from "./tool";
import PartToggle from "./part_toggles";
import Modal from "../misc/modal";
import ColorPicker from "../misc/color_picker";

import imgSteveAlex from "/assets/images/steve_alex.png";

class Toolbar extends LitElement {
  static styles = css`
    :host {
      background-color: transparent;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #tools {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #tools ncrs-tool,
    #tools ncrs-button {
      --ncrs-button-bg: #333333;
      --ncrs-button-bg-hover: #444444;
      --ncrs-button-bg-active: #555555;
      --ncrs-button-color: white;
      --ncrs-button-border-radius: 24px;
      height: 48px;
      width: 48px;
      min-width: 48px;
    }

    #tools ncrs-tool.active,
    #tools ncrs-button.active {
      --ncrs-button-bg: #555555;
    }

    #tools ncrs-icon {
      width: 24px;
      height: 24px;
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
      ${this._renderTools()}
      ${this._renderToggles()}
      ${this.colorModal}
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

    return html`
      <div id="tools">
        ${editor.tools.map(tool => {
          const newTool = new Tool(this.ui, tool);
          if (tool.properties.id === "sculpt") {
            newTool.disabled = !editor.config.get("overlayVisible", false);
            editor.config.addEventListener("overlayVisible-change", event => {
              newTool.disabled = !event.detail;
            });
          }
          return newTool;
        })}
        <!-- Color Picker Button -->
        <ncrs-button 
          class="color-picker-btn" 
          @click=${() => this._showColorModal()}
          title="Open Color Picker"
        >
          <div style="width: 24px; height: 24px; border-radius: 4px; background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);"></div>
        </ncrs-button>
      </div>
    `;
  }

_showColorModal() {
  if (!this.colorModal) {
    this.colorModal = document.createElement('div');
    Object.assign(this.colorModal.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    });

    // Create picker instance from your file
    this.colorPicker = new ColorPicker(this.ui.editor);
    this.colorPicker.style.width = '320px';
    this.colorPicker.style.background = '#1A1A1A';
    this.colorPicker.style.borderRadius = '8px';
    this.colorPicker.style.padding = '10px';
    this.colorPicker.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';

    // Prevent dragging
    this.colorPicker.draggable = false;

    // Append picker to modal
    this.colorModal.appendChild(this.colorPicker);
    document.body.appendChild(this.colorModal);

    // Close when clicking outside picker
    this.colorModal.addEventListener('click', (e) => {
      if (e.target === this.colorModal) {
        this.colorModal.remove();
        this.colorModal = null;
      }
    });

    // Listen for color changes
    this.colorPicker.addEventListener('color-change', (e) => {
      const color = e.detail.color;
      this.ui.editor.toolConfig.set("color", color);
    });
  }

  // Set current color before showing
  const current = this.ui.editor.toolConfig.get("color");
  if (current && this.colorPicker?.setColor) {
    this.colorPicker.setColor(current);
  }
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