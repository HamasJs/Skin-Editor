import { css, html, LitElement, unsafeCSS } from "lit";
import Tool from "./tool";
import PartToggle from "./part_toggles";
import Modal from "../misc/modal";
import ColorPicker from "../misc/color_picker";
import Color from "color";
import { clamp } from "../../helpers";
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
    this.recentColors = this._loadRecentColors();
    this._setupColorEvents();
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

  _loadRecentColors() {
    return this.ui.persistence.get("recentPalette", []);
  }

  _saveRecentColors() {
    this.ui.persistence.set("recentPalette", this.recentColors);
  }

  _addRecentColor(color) {
    const colorString = color.hex().toLowerCase();
    
    // Remove if already exists
    const existingIndex = this.recentColors.indexOf(colorString);
    if (existingIndex > -1) {
      this.recentColors.splice(existingIndex, 1);
    }
    
    // Add to beginning
    this.recentColors.unshift(colorString);
    
    // Limit to 10 colors
    if (this.recentColors.length > 10) {
      this.recentColors = this.recentColors.slice(0, 10);
    }
    
    this._saveRecentColors();
  }

  _setupColorEvents() {
    this.ui.editor.addEventListener("tool-up", () => {
      if (!this.ui.editor.currentTool.properties.providesColor) { return; }
      
      const color = this.ui.editor.toolConfig.get("color");
      this._addRecentColor(color);
    });
  }

  _createRecentColorsGrid() {
    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gap: '6px',
      marginTop: '10px',
      padding: '4px'
    });

    this.recentColors.forEach(colorString => {
      const colorButton = document.createElement('button');
      const color = new Color(colorString);
      
      Object.assign(colorButton.style, {
        width: '20px',
        height: '20px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: colorString,
        cursor: 'pointer',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 3px inset, rgba(0, 0, 0, 0.25) 0px -1px 0px inset',
        position: 'relative'
      });

      colorButton.title = `Use color ${colorString}`;

      // Check if this is the current color
      const currentColor = this.ui.editor.toolConfig.get("color");
      if (currentColor && color.rgb().string() === currentColor.rgb().string()) {
        const indicator = document.createElement('div');
        Object.assign(indicator.style, {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          border: color.isLight() ? '1px solid black' : '1px solid white'
        });
        colorButton.appendChild(indicator);
      }

      colorButton.addEventListener('click', () => {
        this.colorPicker.setColor(color);
        this.ui.editor.toolConfig.set("color", color);
      });

      grid.appendChild(colorButton);
    });

    return grid;
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
        padding: '20px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '90vw',
        maxHeight: '90vh'
      });
  
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '8px',
        right: '12px',
        background: 'transparent',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666',
        lineHeight: '1'
      });
      closeBtn.addEventListener('click', () => {
        this.colorModal.remove();
        this.colorModal = null;
      });
  
      // Create color picker
      this.colorPicker = new ColorPicker(this.ui.editor);
      this.colorPicker.style.width = '320px';
      this.colorPicker.style.height = '320px';
      this.colorPicker.style.background = 'transparent';
      this.colorPicker.style.borderRadius = '4px';
      this.colorPicker.style.padding = '10px';
      this.colorPicker.style.boxSizing = 'border-box';
      this.colorPicker.draggable = false;

      // Recent colors section
      const recentColorsSection = document.createElement('div');
      Object.assign(recentColorsSection.style, {
        width: '100%',
        marginTop: '15px'
      });

      // Recent colors title
      const recentTitle = document.createElement('h4');
      recentTitle.textContent = 'Recent Colors';
      Object.assign(recentTitle.style, {
        margin: '0 0 8px 0',
        color: '#333',
        fontSize: '14px',
        fontWeight: '600'
      });

      // Create recent colors grid
      const recentColorsGrid = this._createRecentColorsGrid();

      // Add empty state if no recent colors
      if (this.recentColors.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.textContent = 'No recent colors. Colors you use will appear here.';
        Object.assign(emptyState.style, {
          color: '#999',
          fontSize: '12px',
          margin: '0',
          textAlign: 'center',
          padding: '20px'
        });
        recentColorsSection.appendChild(recentTitle);
        recentColorsSection.appendChild(emptyState);
      } else {
        recentColorsSection.appendChild(recentTitle);
        recentColorsSection.appendChild(recentColorsGrid);
      }
  
      // Append elements
      modalContent.appendChild(closeBtn);
      modalContent.appendChild(this.colorPicker);
      modalContent.appendChild(recentColorsSection);
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
        
        // Update recent colors grid to show current selection
        const newGrid = this._createRecentColorsGrid();
        if (this.recentColors.length > 0) {
          recentColorsGrid.replaceWith(newGrid);
        }
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
    return html`
      <div>
        <ncrs-part-toggle .editor=${this.ui.editor}></ncrs-part-toggle>
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