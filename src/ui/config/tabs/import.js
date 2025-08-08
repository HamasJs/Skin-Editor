import Tab from "../../misc/tab";
import { css, html } from "lit";
import ProjectLoader from "../../../editor/format/project_loader";
import QuickSearch from "./import/quick_search";
import MinecraftImport from "./import/minecraft";
import ReferenceImageManager from "./import/reference_image";

class ImportTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      #main {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #buttons {
        display: flex;
        flex-direction: column;
        flex-basis: 0;
        padding: 0.5rem;
        background-color: #1A1A1A;
      }

      ncrs-button {
        text-align: center;
        font-size: large;
        font-weight: bold;
      }

      ncrs-button::part(button) {
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
      }

      ncrs-button ncrs-icon {
        width: 24px;
        height: 24px;
      }

      hr {
        width: 100%;
        border-color: #494C4E;
        margin-bottom: 0.75rem;
        box-sizing: border-box;
      }

      input {
        font-size: medium;
        margin-bottom: 0.25rem;
        flex-grow: 1;
        box-sizing: border-box;
        color: white;
        background-color: #131315;
        border-style: solid;
        border-width: 0px;
        border-radius: 4px;
        box-shadow: 0 0 0 2px #313436;
        padding-left: 0.25rem;
      }

      #import-username {
        position: relative;
      }

      #import-username:after {
        --height: 10px;
        content: "";
        width: 0;
        height: 0;
        border-left: var(--height) solid transparent;
        border-right: var(--height) solid transparent;
        border-top: var(--height) solid #131315;
        position: absolute;
        z-index: 99;
        left: 50%;
        top: -5px;
        margin-left: calc(var(--height) * -1);
      }

      .hidden {
        display: none;
      }

      #browse {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 0.5rem;
      }

      #quicksearch {
        flex-grow: 1;
      }

      #quicksearch h2 {
        margin: 0px;
        margin-bottom: 0.25rem;
        font-size: medium;
        color: white;
      }
    `
  ]

  constructor(ui) {
    super({name: "Import", title: "Import [3]/[Alt+I]\nImport skins and project files."});
    this.ui = ui;
    this.editor = this.ui.editor;

    this.referenceImages = new ReferenceImageManager(this.editor);

    this.pngFileInput = this._createFileInput();
    this.ncrsFileInput = this._createFileInput();
    this.referenceFileInput = this._createFileInput();

    this.pngFileInput.addEventListener("change", this._pngFileRead.bind(this));
    this.pngFileInput.accept = "image/png";

    this.ncrsFileInput.accept = ".ncrs"
    this.ncrsFileInput.addEventListener("change", this._ncrsFileRead.bind(this));
    
    this.referenceFileInput.accept = "image/*";
    this.referenceFileInput.addEventListener("change", this._referenceFileRead.bind(this));

    this.quicksearch = new QuickSearch(this.ui);
    this.minecraftImport = new MinecraftImport(this.ui);
  }
  _hasEntered = false;

  render() {
    return html`
      <div id="main">
        <div id="buttons">
          ${this.pngFileInput}
          <hr>
          <ncrs-button @click=${this.pngOpen} title="Import a skin .png file as a new layer.">Import Skin from File (.png)</ncrs-button>
          <hr>
        </div>
      </div>
    `
  }

  tabEnter() {
    if (this._hasEntered) { return; }

    this.quicksearch.load();
    this._hasEntered = true;
  }

  pngOpen() {
    this.pngFileInput.value = null;
    this.pngFileInput.click();
  }

  ncrsOpen() {
    this.ncrsFileInput.value = null;
    this.ncrsFileInput.click();
  }

  referenceImageOpen() {
    this.referenceFileInput.value = null;
    this.referenceFileInput.click();
  }

  galleryOpen() {
    this.ui.galleryModal.show();
  }

  _pngFileRead(event) {
    const file = event.target.files[0];
    this.editor.addLayerFromFile(file);
  }

  _ncrsFileRead(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      let confirmText = "Load new Project?";
      confirmText += "\nThis will replace your current project, and you will lose your history.";
      confirmText += "\nMake sure you have saved the current project."

      const check = confirm(confirmText);
      if (!check) { return; }

      const text = reader.result;
      const json = JSON.parse(text);

      const projectLoader = new ProjectLoader(json);
      projectLoader.load(this.editor);
    }

    reader.readAsText(file);
  }

  _referenceFileRead(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        this.referenceImages.addImage(img);
      }

      img.src = reader.result;
    }

    reader.readAsDataURL(file);
  }

  _createFileInput() {
    const input = document.createElement("input");
    input.classList.add("hidden");
    input.type = "file";

    return input;
  }
}

customElements.define("ncrs-import-tab", ImportTab);

export default ImportTab;