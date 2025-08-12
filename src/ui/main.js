import "./misc/icon";
import "./misc/button";
import "./misc/toggle";
import "./misc/troggle";
import "./misc/quadroggle";
import "./misc/modal";
import "./misc/window";
import "./misc/skin_2d";

import { css, html, LitElement, render, unsafeCSS } from "lit";
import Editor from "../editor/main";
import Toolbar from "./tools/toolbar";
// import LayerList from "./layers/layer_list";
import Config from "./config/main";
import PersistenceManager from "../persistence";
import { getFocusedElement, isKeybindIgnored } from "../helpers";
import Modal from "./misc/modal";

import imgGridDark from "/assets/images/grid-editor-dark.png";
import imgGridGray from "/assets/images/grid-editor-gray.png";
import imgGridLight from "/assets/images/grid-editor-light.png";

import { GALLERY_URL, SKIN_LOOKUP_URL } from "../constants";
import { del } from "idb-keyval";
import passesColorAccuracyTest from "./misc/color_accuracy_test";

// Global methods for React Native WebView integration
const setupGlobalMethods = (uiInstance) => {
  // Load a skin from base64 string
  window.loadSkinFromBase64 = async (base64Data) => {
    try {
      // Remove data URL prefix if present
      const base64 = base64Data.split('base64,')[1] || base64Data;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      const file = new File([blob], 'skin.png', { type: 'image/png' });
      
      // Clear existing layers
      while (uiInstance.editor.layers.length > 0) {
        uiInstance.editor.removeLayer();
      }
      
      // Add new layer with the imported skin
      await uiInstance.editor.addLayerFromFile(file);
      return { success: true };
    } catch (error) {
      console.error('Error loading skin from base64:', error);
      return { success: false, error: error.message };
    }
  };

  // Export current skin as base64
  window.exportSkinToBase64 = async () => {
    try {
      const canvas = await uiInstance.editor.skinToCanvas();
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      return { success: true, data: base64 };
    } catch (error) {
      console.error('Error exporting skin to base64:', error);
      return { success: false, error: error.message };
    }
  };

  // Listen for skin export requests
  window.addEventListener('message', async (event) => {
    if (event.data === 'exportSkin') {
      try {
        const result = await window.exportSkinToBase64();
        if (result.success) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'skinExport',
            skinBase64: result.data
          }));
        }
      } catch (error) {
        console.error('Error handling export request:', error);
      }
    }
  });
};

class UI extends LitElement {
static styles = css`
    :host {
      width: 100%;
      height: 100%;
      --editor-bg: url(${unsafeCSS(imgGridDark)});
      --ncrs-color-picker-height: 15rem;
    }

    #main {
      display: flex;
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Desktop layout - default */
    @media (min-width: 769px) {
      #main {
        flex-direction: row;
      }

      #editor {
        flex-grow: 1;
      }

      #layers {
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
      }

      #layers ncrs-layer-list {
        flex-grow: 1;
      }
    }

    /* Mobile and tablet layout */
    @media (max-width: 768px) {
      #main {
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      #editor {
        flex: 1;
        min-height: 60vh;
        order: 1;
        position: relative;
      }

      #config-toolbar-container {
        display: flex;
        flex-direction: row;
        order: 2;
        background-color: #191919;
        border-top: 1px solid #333;
        max-height: 40vh;
        overflow-y: auto;
        padding: 0.5rem;
      }
      
      #toolbar {
        display: flex;
        flex-direction: row;
        background-color: #131315;
        border-radius: 4px;
        padding: 0.25rem;
        margin-bottom: 0.5rem;
        gap: 0.25rem;
      }
      
      #tools {
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none; /* Hide scrollbar for Firefox */
      }
      
      #tools::-webkit-scrollbar {
        display: none; /* Hide scrollbar for Chrome/Safari */
      }

      #layers {
        display: none; /* Hide layers panel on mobile for now */
      }

      /* Make toolbar more compact on mobile */
      :host(.mobile-layout) {
        --ncrs-color-picker-height: 12rem;
      }

      /* Adjust warnings position for mobile */
      .warning {
        top: 4px;
        left: 4px;
        font-size: x-small;
      }

      .warning svg {
        width: 1rem;
        height: auto;
        padding-left: 0.2rem;
      }

      /* Adjust theme and fullscreen buttons for mobile - keep them positioned relative to editor */
      #themeSwitch {
        top: 4px;
        left: 4px;
      }

      #fullscreenSwitch,
      #fullscreenSwitchLightMode {
        top: 28px;
        left: 4px;
      }

      #rotationLockSwitch {
        top: 52px;
        left: 4px;
      }

      #themeSwitch ncrs-icon,
      #fullscreenSwitch ncrs-icon,
      #fullscreenSwitchLightMode ncrs-icon,
      #rotationLockSwitch ncrs-icon {
        width: 16px;
        height: 16px;
      }

      #undoButton {
        top: 4px;
        right: 4px;
      }
      
      #redoButton {
        top: 28px;
        right: 4px;
      }

      #undoButton img,
      #redoButton img {
        width: 16px;
        height: 16px;
      }
    }

    /* Very small screens (phones in portrait) */
    @media (max-width: 480px) {
      #editor {
        min-height: 50vh;
      }

      :host(.mobile-layout) {
        --ncrs-color-picker-height: 10rem;
      }

      .warning {
        font-size: xx-small;
      }
    }

    .warning {
      display: none;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;
      position: absolute;
      top: 8px;
      left: 36px;
      color: #aaaaaa;
      font-size: small;
    }

    .warning svg {
      width: 1.25rem;
      height: auto;
      padding-left: 0.35rem;
    }

    :host(.has-filters) #filters-warning {
      display: flex;
    }

    :host(.layer-invisible) #layer-warning {
      display: flex;
    }

    :host(.editor-dark) {
      --editor-bg: url(${unsafeCSS(imgGridDark)});
    }

    :host(.editor-gray) {
      --editor-bg: url(${unsafeCSS(imgGridGray)});
    }

    :host(.editor-light) {
      --editor-bg: url(${unsafeCSS(imgGridLight)});
    }

    :host(.editor-light) .warning {
      color: black;
    }

    :host(.minimized) {
      --ncrs-color-picker-height: 15rem;
    }

    :host(.fullscreen) {
      --ncrs-color-picker-height: 17rem;
    }

    #editor {
      background-color: #191919;
      background-image: var(--editor-bg);
      position: relative; /* CRITICAL: Make editor a positioning context */
    }

    #layers {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
    }

    #layers ncrs-layer-list {
      flex-grow: 1;
    }

    #editor ncrs-editor {
      width: 100%;
      height: 100%;
      min-width: 240px;
    }

    #history {
      display: flex;
      justify-content: center;
      padding: 0.5rem;
      gap: 0.5rem;
      background-color: rgb(19, 19, 21);
    }

    /* Mobile history buttons adjustments */
    @media (max-width: 768px) {
      #history {
        padding: 0.25rem;
        gap: 0.25rem;
        border-bottom: 1px solid #333;
      }

      #history button {
        padding: 0.25rem;
      }

      #history ncrs-icon {
        width: 20px;
        height: 20px;
      }
    }

    #history button {
      all: unset;
      cursor: pointer;
    }

    #history button:disabled {
      cursor: default;
    }

    #history button:focus-visible {
      outline: 1px solid white;
    }

    #history ncrs-icon {
      --icon-color: white;
      width: 24px;
      height: 24px;
    }

    #history button:disabled ncrs-icon {
      --icon-color: #aaaaaa;
    }

    /* FIXED: All editor overlay buttons positioned relative to #editor */
    #themeSwitch,
    #rotationLockSwitch,
    #undoButton,
    #redoButton,
    #fullscreenSwitch,
    #fullscreenSwitchLightMode {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: absolute; /* Positioned relative to #editor which has position: relative */
      z-index: 10;
      width: 32px;
      height: 32px;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    #themeSwitch:hover,
    #rotationLockSwitch:hover,
    #undoButton:hover,
    #redoButton:hover,
    #fullscreenSwitch:hover,
    #fullscreenSwitchLightMode:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    #themeSwitch:active,
    #rotationLockSwitch:active,
    #undoButton:active,
    #redoButton:active,
    #fullscreenSwitch:active,
    #fullscreenSwitchLightMode:active {
      background-color: rgba(0, 0, 0, 0.9);
    }
    
    #rotationLockSwitch img,
    #themeSwitch ncrs-icon,
    #undoButton img,
    #redoButton img,
    #fullscreenSwitch ncrs-icon,
    #fullscreenSwitchLightMode ncrs-icon {
      width: 20px;
      height: 20px;
      pointer-events: none;
    }

    /* Left side buttons positioning */
    #themeSwitch {
      top: 8px;
      left: 8px;
    }
    
    #fullscreenSwitch,
    #fullscreenSwitchLightMode {
      top: 48px;
      left: 8px;
    }
    
    #rotationLockSwitch {
      top: 88px;
      left: 8px;
    }
    
    /* Right side buttons positioning */
    #undoButton {
      top: 8px;
      right: 8px;
    }
    
    #redoButton {
      top: 48px;
      right: 8px;
    }
    
    #colorPickerButton {
      top: 88px;
      right: 8px;
    }
    
    #undoButton img,
    #redoButton img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      opacity: 0.9;
    }
    
    #undoButton:hover img,
    #redoButton:hover img {
      opacity: 1;
    }
    
    #undoButton:disabled img,
    #redoButton:disabled img {
      opacity: 0.3;
    }

    ncrs-toolbar {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
    }

    :host(.editor-dark) #themeSwitch ncrs-icon.dark,
    :host(.editor-gray) #themeSwitch ncrs-icon.gray,
    :host(.editor-light) #themeSwitch ncrs-icon.light {
      display: block;
    }

    :host(.editor-dark) #themeSwitch ncrs-icon:not(.dark),
    :host(.editor-gray) #themeSwitch ncrs-icon:not(.gray),
    :host(.editor-light) #themeSwitch ncrs-icon:not(.light) {
      display: none;
    }

    #fullscreenSwitch ncrs-icon,
    #rotationLockSwitch ncrs-icon {
      display: none;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    :host(:not([fullscreen])) #fullscreenSwitch ncrs-icon:not(.fullscreen) {
      display: block;
    }

    :host([fullscreen]) #fullscreenSwitch ncrs-icon.fullscreen {
      display: block;
    }

    #rotationLockSwitch img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    #rotationLockSwitch .unlock-icon {
      display: none;
    }

    :host([rotationlocked]) #rotationLockSwitch .lock-icon {
      display: none;
    }

    :host([rotationlocked]) #rotationLockSwitch .unlock-icon {
      display: block;
    }

    :host(.editor-light) #fullscreenSwitch {
      display: none;
    }

    #fullscreenSwitchLightMode ncrs-icon {
      display: none;
      width: 20px;
      height: 20px;
    }

    :host(.minimized) #fullscreenSwitchLightMode ncrs-icon.minimized {
      display: block;
    }

    :host(.fullscreen) #fullscreenSwitchLightMode ncrs-icon.fullscreen {
      display: block;
    }

    :host(.editor-gray) #fullscreenSwitchLightMode {
      display: none;
    }

    :host(.editor-dark) #fullscreenSwitchLightMode {
      display: none;
    }

    #color-check-modal {
      justify-content: center;
      position: absolute;
    }
    
    #color-check {
      color: white;
      background-color: #1A1A1A;
      padding: 1rem;
      border-radius: 0.25rem;
      max-width: 32rem;
    }

    /* Mobile modal adjustments */
    @media (max-width: 768px) {
      #color-check {
        max-width: 90vw;
        margin: 1rem;
        padding: 0.75rem;
      }

      #color-check h2 {
        font-size: 1.2rem;
      }

      #color-check p {
        font-size: 0.9rem;
      }
    }

    #color-check h2 {
      margin: 0px;
      text-align: center;
    }

    #color-check a {
      color: white;
    }

    #color-check div {
      display: flex;
      gap: 0.25rem;
      margin-top: 1rem;
    }

    #color-check ncrs-button {
      flex-grow: 1;
      flex-basis: 0;
    }

    #color-check ncrs-button::part(button) {
      padding: 0.25rem;
      text-align: center;
      font-size: large;
    }

    @media (max-width: 768px) {
      #color-check ncrs-button::part(button) {
        font-size: medium;
      }
    }
  `;

  static properties = {
    src: {type: String},
    _warning: {type: String, state: true},
    rotationLocked: {type: Boolean, state: true},
  }

  // All keybind definitions, ^ = ctrl, + = shift, ! = alt

  static keybinds = {
    "b": "pen",
    "e": "eraser",
    "g": "bucket",
    "s": "shade",
    "i": "eyedropper",
    "+s": "sculpt",
    "^z": "undo",
    "^y": "redo",
    "^+z": "redo",
    "^r": "reset",
    "0": "cameraReset",
    "1": "selectTools",
    "2": "selectLayer",
    "3": "selectImport",
    "4": "selectExport",
    "!t": "selectTools",
    "!l": "selectLayer",
    "!i": "selectImport",
    "!e": "selectExport",
    "+n": "addLayer",
    "delete": "removeLayer",
    "+d": "cloneLayer",
    "+m": "mergeLayer",
  }

  constructor() {
    super();

    this.persistence = new PersistenceManager("ncrs-ui");
    this.editor = new Editor;
    this.toolbar = new Toolbar(this);
    // this.layers = new LayerList(this);
    this.config = new Config(this);

    this.exportModal = this._setupModal("export-form");
    this.galleryModal = this._setupGalleryModal();

    // Setup global methods for React Native WebView integration
    setupGlobalMethods(this);

    this._setEditorTheme();
    this._setFullscreen();
    this._setupEvents();
    this._setupResponsive();

    this.rotationLocked = this.persistence.get("rotationLocked", false);
    if (this.editor?.controls?.orbit) {
      this.editor.controls.orbit.enableRotate = !this.rotationLocked;
    }
  }
  currentLayer;

  firstUpdated() {
    document.addEventListener("keydown", event => {
      const element = event.originalTarget || getFocusedElement();
      if (isKeybindIgnored(element)) { return; }

      switch(this.checkKeybinds(event)){
        case "pen":
          if (this.editor.currentTool == this.editor.tools[0]) {
            this.config.select("tool");
          }
          this.editor.selectTool(this.editor.tools[0]);
          break;
        case "eraser":
          if (this.editor.currentTool == this.editor.tools[1]) {
            this.config.select("tool");
          }
          this.editor.selectTool(this.editor.tools[1]);
          break;
        case "bucket":
          if (this.editor.currentTool == this.editor.tools[2]) {
            this.config.select("tool");
          }
          this.editor.selectTool(this.editor.tools[2]);
          break;
        case "shade":
          if (this.editor.currentTool == this.editor.tools[3]) {
            this.config.select("tool");
          }
          this.editor.selectTool(this.editor.tools[3]);
          break;
        case "sculpt":
          if (!this.editor.config.get("overlayVisible")) { break; }
          if (this.editor.currentTool == this.editor.tools[4]) {
            this.config.select("tool");
          }
          this.editor.selectTool(this.editor.tools[4]);
          break;
        case "eyedropper":
          this.editor.config.set("pick-color-toggle", true);
          this.editor.config.set("pick-color", !this.editor.config.get("pick-color", false));
          break;
        case "undo":
          this._undo();
          break;
        case "redo":
          this._redo();
          break;
        case "reset":
          const check = confirm("Do you want to reset all editor data? You will lose all progress on your current skin.");

          if (check) {
            PersistenceManager.resetAll();
            del("ncrs:reference-images");
            location.reload();
          }
          
          break;
        case "cameraReset":
          this.editor.resetCamera();
          break;
        case "selectTools":
          this.config.select("tool");
          break;
        case "selectLayer":
          this.config.select("layers");
          break;
        case "selectImport":
          this.config.select("import");
          break;
        case "selectExport":
          this.config.select("export");
          break;
        case "addLayer":
          this.editor.addLayer();
          break;
        case "removeLayer":
          this.editor.removeLayer();
          break;
        case "cloneLayer":
          this.editor.cloneLayer();
          break;
        case "mergeLayer":
          this.editor.mergeLayer();
          break;
      }
    });

    this._updateWarning();
  }

  checkKeybinds(event) {
    let key = '';
    if (event.ctrlKey) {
      key+='^';
    }
    if (event.altKey) {
      key+='!';
    }
    if (event.shiftKey) {
      key+='+';
    }
    key+=event.key.toLowerCase();
    if (key in this.constructor.keybinds) {
      return this.constructor.keybinds[key];
    }
  }

  render() {
    const isMobile = window.innerWidth <= 768;

    return html`
      <div id="main">
        ${!isMobile ? this.config : ''}
        <div id="editor">
          ${this.editor}
          ${this.toolbar}
          <button id="themeSwitch" @click=${this._toggleTheme} title="Toggle Theme">
            <ncrs-icon class="dark" icon="moon"></ncrs-icon>
            <ncrs-icon class="gray" icon="circle-half-stroke"></ncrs-icon>
            <ncrs-icon class="light" icon="sun"></ncrs-icon>
          </button>
          <button id="rotationLockSwitch" @click=${this.toggleRotationLock} title="Toggle Rotation Lock">
            <img class="lock-icon" src="/assets/images/lock.png" alt="Lock">
            <img class="unlock-icon" src="/assets/images/unlock.png" alt="Unlock">
          </button>
          <button id="undoButton" @click=${this._undo} title="Undo" ?disabled=${!this.editor?.history?.canUndo}>
            <img src="/assets/images/undo.png" alt="Undo">
          </button>
          <button id="redoButton" @click=${this._redo} title="Redo" ?disabled=${!this.editor?.history?.canRedo}>
            <img src="/assets/images/redo.png" alt="Redo">
          </button>
          ${this._filtersWarning()}
          ${this._bgToggle()}
        </div>
        ${isMobile ? html`
          <div id="config-toolbar-container">
            ${this.config}
          </div>
        ` : html`
          <div id="layers">
            ${this.layers}
          </div>
        `}
        ${this._setupColorCheckModal()}
      </div>
      <slot name="footer"></slot>
    `;
  }

  galleryURL() {
    if (!this.src) { return GALLERY_URL };

    const url = new URL(this.src);

    return `${url.origin}/gallery/skins`;
  }

  skinLookupURL() {
    if (!this.src) { return SKIN_LOOKUP_URL };

    const url = new URL(this.src);

    return `${url.origin}/api/skin`;
  }

  toggleEditorBackground() {
    if (this.classList.contains("editor-gray")) {
      this.classList.replace("editor-gray", "editor-light");
      this.persistence.set("theme", "light");
    } else if (this.classList.contains("editor-light")) {
      this.classList.replace("editor-light", "editor-dark");
      this.persistence.set("theme", "dark");
    } else {
      this.classList.remove("editor-dark", "editor-light");
      this.classList.add("editor-gray");
      this.persistence.set("theme", "gray");
    }
  }

  toggleFullscreen() {
    if (this.classList.contains("minimized")) {
      this.classList.replace("minimized", "fullscreen");
    } else if (this.classList.contains("fullscreen")) {
      this.classList.replace("fullscreen", "minimized");
    }
  }

  _filtersWarning() {
    const filterIcon = html`
      <svg data-slot="icon" aria-hidden="true" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
    const eyeIcon = html`
      <svg data-slot="icon" aria-hidden="true" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `

    return html`
      <div id="filters-warning" class="warning">
        ${filterIcon}
        Colors drawn on the current layer will appear altered by filters.
      </div>
      <div id="layer-warning" class="warning">
        ${eyeIcon}
        Current layer is hidden, and cannot be edited.
      </div>
    `;
  }

  _setEditorTheme() {
    if (
      !this.classList.contains("editor-dark") ||
      !this.classList.contains("editor-gray") ||
      !this.classList.contains("editor-light")
    ) {
      const theme = this.persistence.get("theme", "dark");
      this.classList.add(`editor-${theme}`);
    }
  }

  _setFullscreen() {
    const fullscreen = "minimized";
    this.classList.add(fullscreen);
  }

  _setupResponsive() {
    const updateLayout = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        this.classList.add('mobile-layout');
      } else {
        this.classList.remove('mobile-layout');
      }
      this.requestUpdate();
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
  }

  _bgToggle() {
    return html`
      <button id="themeSwitch" @click=${this.toggleEditorBackground}>
        <ncrs-icon title="Switch to dusk mode." icon="dusk-mode" color="#ffffff44" class="dark"></ncrs-icon>
        <ncrs-icon title="Switch to light mode." icon="light-mode" color="#ffffff44" class="gray"></ncrs-icon>
        <ncrs-icon title="Switch to dark mode." icon="dark-mode" color="#00000066" class="light"></ncrs-icon>
      </button>
    `
  }

  






  _updateWarning() {
    const layer = this.editor.layers.getSelectedLayer();
    if (!layer) { return; }

    this.classList.remove("has-filters", "layer-invisible");
    
    if (!layer.visible) {
      return this.classList.add("layer-invisible");
    } else if (layer.hasFilters()) {
      return this.classList.add("has-filters");
    }
  }

  _undo() {
    if (this.editor?.history?.canUndo()) {
      this.editor.history.undo();
      this.requestUpdate();
    }
  }

  _redo() {
    if (this.editor?.history?.canRedo()) {
      this.editor.history.redo();
      this.requestUpdate();
      return this.classList.add("has-filters");
    }
  }

  _setupModal(name) {
    const modal = new Modal();
    modal.part = name;
    
    const slot = document.createElement("slot");
    slot.name = name;

    modal.appendChild(slot);

    return modal
  }

  async toggleRotationLock() {
    this.rotationLocked = !this.rotationLocked;
    if (this.editor?.controls?.orbit) {
      this.editor.controls.orbit.enableRotate = !this.rotationLocked;
    }
    await this.persistence.set("rotationLocked", this.rotationLocked);
  }

  _setupGalleryModal() {
    const modal = new Modal();
    // const gallery = new Gallery(this);
    // gallery.url = "http://127.0.0.1:3000/gallery/skins"

    // modal.appendChild(gallery);

    return modal;
  }

  _setupColorCheckModal() {
    return html`
      <ncrs-modal id="color-check-modal">
        <div id="color-check">
          <h2>Color Inaccuracies Detected</h2>
          <p>We have detected that your browser may have issues with color accuracy.</p>
          <p>You may notice subtle visual noise and incorrect colors appear in your skins.</p>
          <p>This issue is usually caused by anti-fingerprinting privacy settings in your browser.</p>
          <a href="https://wiki.needcoolershoes.com/troubleshooting/inaccurate_colors/" target="_blank">Learn how to fix</a>
          <div>
            <ncrs-button @click=${this._closeColorModal}>Close</ncrs-button>
            <ncrs-button @click=${this._ignoreColorModal}>Do Not Show Again</ncrs-button>
          </div>
        </div>
      </ncrs-modal>
    `;
  }

  _closeColorModal() {
    this.shadowRoot.getElementById("color-check-modal").hide();
  }

  _ignoreColorModal() {
    this.persistence.set("ignoreColorCheck", true);
    this.shadowRoot.getElementById("color-check-modal").hide();
  }

  _runColorCheck() {
    if (this.persistence.get("ignoreColorCheck", false)) { return; }
    if (passesColorAccuracyTest()) { return; }

    this.shadowRoot.getElementById("color-check-modal").show();
  }

  _openColorPicker() {
    // This will open the color picker modal
    const colorPickerModal = this.shadowRoot.querySelector('ncrs-color-picker-modal');
    if (colorPickerModal) {
      colorPickerModal.show();
    }
  }

  _setupEvents() {
    const layers = this.editor.layers;
    layers.addEventListener("layers-render", () => {
      this._updateWarning();
    });

    layers.addEventListener("update-filters", () => {
      this._updateWarning();
    });

    layers.addEventListener("layers-select", () => {
      this._updateWarning();
    });

    this.editor.history.addEventListener("update", () => {
      this.requestUpdate();
    })

    this.addEventListener("dragover", event => event.preventDefault());
    this.addEventListener("drop", event => {
      event.preventDefault();
      [...event.dataTransfer.items].forEach(item => {
        if (item.type != "image/png") { return; }

        this.editor.addLayerFromFile(item.getAsFile());
      })
    });

    window.addEventListener("load", () => {
      this._runColorCheck();
    })
  }
}

customElements.define("ncrs-ui", UI);

export default UI;