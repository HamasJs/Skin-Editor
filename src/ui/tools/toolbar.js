import { css, html, LitElement, unsafeCSS } from "lit";
import Tool from "./tool";
import PartToggle from "./part_toggles";
import Modal from "../misc/modal";
import ColorPicker from "../misc/color_picker";
import "./part_toggles"; // Import the part toggles component

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
  --ncrs-button-bg: transparent !important;
  --ncrs-button-bg-hover: transparent !important;
  --ncrs-button-bg-active: transparent !important;
  --ncrs-button-color: white;
  --ncrs-button-border-radius: 8px;
  height: 48px;
  width: 48px;
  min-width: 48px;
  transition: transform 0.2s ease;
  border: none;
  box-shadow: none;
  background: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

#tools ncrs-tool::part(button),
#tools ncrs-button::part(button) {
  background: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
}


    #tools ncrs-tool:hover,
    #tools ncrs-button:hover {
      transform: scale(1.1);
      background: none !important;
    }

    #tools ncrs-tool:active,
    #tools ncrs-button:active {
      transform: scale(0.95);
      background: none !important;
    }

    #tools ncrs-tool.active,
    #tools ncrs-button.active {
      background: none !important;
    }

    #tools ncrs-icon {
      width: 28px;
      height: 28px;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
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

    // #toggle-classic {
    //   --background-before: url(${unsafeCSS(imgSteveAlex)}) 20px 0px;
    //   --background-after: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
    // }

    // #toggle-slim {
    //   --background-before: url(${unsafeCSS(imgSteveAlex)}) 0px 0px;
    //   --background-after: url(${unsafeCSS(imgSteveAlex)}) 24px 0px;
    // }

    ncrs-part-toggle {
      margin-bottom: 1rem;
    }
  `;

  static properties = {
    _isDarkTheme: { state: true }
  };

  constructor(ui) {
    super();
    this.ui = ui;
    this.partToggles = new PartToggle(this.ui.editor);
    this._isDarkTheme = document.documentElement.classList.contains('editor-dark');
    this._handleThemeChange = this._handleThemeChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('theme-changed', this._handleThemeChange);
  }

  disconnectedCallback() {
    document.removeEventListener('theme-changed', this._handleThemeChange);
    super.disconnectedCallback();
  }

  _handleThemeChange(event) {
    this._isDarkTheme = event.detail?.isDark ?? 
      document.documentElement.classList.contains('editor-dark');
    this.requestUpdate();
    console.log(this._isDarkTheme);
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
    const isFullscreen = document.fullscreenElement !== null;

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
        <!-- Remove Layer Button -->
        <ncrs-button
          class="remove-layer-btn"
          @click=${() => this._removeLayer()}
          title="Remove Layer"
          style="--ncrs-button-bg: transparent; --ncrs-button-bg-hover: transparent; --ncrs-button-bg-active: transparent;"
        >
          <ncrs-icon icon=${this._isDarkTheme ? 'fullscreenDark' : 'fullscreenLight'} style="width: 28px; height: 28px;"></ncrs-icon>
        </ncrs-button>
        <!-- Color Picker Button -->
        <ncrs-button 
          class="color-picker-btn" 
          @click=${() => this._showColorModal()}
          title="Open Color Picker"
          style="--ncrs-button-bg: transparent; --ncrs-button-bg-hover: transparent; --ncrs-button-bg-active: transparent;"
        >
          <div style="width: 28px; height: 28px; border-radius: 4px; background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);"></div>
        </ncrs-button>
        
      </div>
    `;
  }

  _showColorModal() {
    if (!this.colorModal) {
      // Overlay
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
  
      // Modal content wrapper
      const modalContent = document.createElement('div');
      Object.assign(modalContent.style, {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '10px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
  
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '3px',
        right: '3px',
        background: 'transparent',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#333'
      });
      closeBtn.addEventListener('click', () => {
        this.colorModal.remove();
        this.colorModal = null;
      });
  
      // Create color picker
      this.colorPicker = new ColorPicker(this.ui.editor);
      this.colorPicker.style.width = '320px';
      this.colorPicker.style.height = '320px';
      this.colorPicker.style.background = 'transparent'; // white bg handled by modalContent
      this.colorPicker.style.borderRadius = '4px';
      this.colorPicker.style.padding = '10px';
      this.colorPicker.style.boxSizing = 'border-box';
  
      // Prevent dragging
      this.colorPicker.draggable = false;
  
      // Append elements
      modalContent.appendChild(closeBtn);
      modalContent.appendChild(this.colorPicker);
      this.colorModal.appendChild(modalContent);
      document.body.appendChild(this.colorModal);
  
      // Click outside closes modal
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
  

  
  
  

  async _removeLayer() {
    const editor = this.ui.editor;
    if (editor.layers.layers.length >= 1) {
      editor.removeLayer();
    } else {
      alert("Cannot remove the last layer.");
    }
  }

  async _toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen();
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
      // Force re-render to update the fullscreen button state
      this.requestUpdate();
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }

  _renderToggles() {
    const cfg = this.ui.editor.config;
    const isSlim = cfg.get("variant") == "slim";
    const baseVisible = cfg.get("baseVisible");
    const overlayVisible = cfg.get("overlayVisible");
    const baseGridVisible = cfg.get("baseGridVisible", false);
    const overlayGridVisible = cfg.get("overlayGridVisible", false);
    const cullBackFace = cfg.get("cullBackFace", true);
    const isOuterLayer = cfg.get('showOuterLayer', true);

    return html`
      <div>
        <!-- Part Toggles -->
        <ncrs-part-toggle .editor=${this.ui.editor}></ncrs-part-toggle>
        
        <!-- Base and Overlay Toggles -->
        <div class="ncrs-toggle-row">
          <ncrs-toggle title="Toggle base" ?toggled=${baseVisible} @toggle=${this._toggleBase}>
            <ncrs-icon slot="off" icon="base" color="grey"></ncrs-icon>
            <ncrs-icon slot="on" icon="base" color="black"></ncrs-icon>
          </ncrs-toggle>
          <ncrs-toggle title="Toggle overlay" ?toggled=${overlayVisible} @toggle=${this._toggleOverlay}>
            <ncrs-icon slot="off" icon="overlay" color="grey"></ncrs-icon>
            <ncrs-icon slot="on" icon="overlay" color="black"></ncrs-icon>
          </ncrs-toggle>
        </div>
      
        
      </div>
    `;
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

  _toggleLayerVisibility() {
    const current = this.ui.editor.config.get('showOuterLayer', true);
    const newValue = !current;
    this.ui.editor.config.set('showOuterLayer', newValue);
    
    // Call the appropriate editor method to update the view
    if (newValue) {
      this.ui.editor.showOuterLayer();
    } else {
      this.ui.editor.showInnerLayer();
    }
  }
}

customElements.define("ncrs-toolbar", Toolbar);

export default Toolbar;