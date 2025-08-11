import ProjectLoader from "../../../editor/format/project_loader";
import { download } from "../../../helpers";
import Tab from "../../misc/tab";
import { css, html } from "lit";

class ExportTab extends Tab {
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

      #buttons ncrs-button {
        text-align: center;
        font-size: large;
        font-weight: bold;
      }

      #buttons ncrs-button::part(button) {
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
      }

      #form {
        flex-grow: 1;
      }

      hr {
        width: 100%;
        border-color: #494C4E;
        margin-bottom: 0.75rem;
        box-sizing: border-box;
      }
    `
  ]

  constructor(ui) {
    super({name: "Export", title: "Export [4]\nExport skins, project files, and share to gallery."});

    this.ui = ui;
    this.editor = this.ui.editor;
  }

  render() {
    return html`
      <div id="main">
        <div id="buttons">
          <ncrs-button @click=${this.downloadPNG} title="Export current skin as a PNG image file.">Export Image (.png)</ncrs-button>
          <ncrs-button @click=${this.downloadNCRS} title="Export current skin project, including layers.">Export Project (.ncrs)</ncrs-button>
          <hr>
          <ncrs-button @click=${this.showExportForm}>Share to Gallery</ncrs-button>
        </div>
        <div id="form"></div>
      </div>
    `
  }

  downloadPNG() {
    const layers = this.editor.layers;
    const texture = layers.render();

    texture.convertToBlob().then(blob => {
      download(`${this._filename()}.png`, URL.createObjectURL(blob));
    });
  }

  downloadNCRS() {
    const data = ProjectLoader.export(this.editor);
    const blob = new Blob([JSON.stringify(data)], {type: "text/plain"});

    download(`${this._filename()}.ncrs`, URL.createObjectURL(blob));
  }

  showExportForm() {
    this.ui.exportModal.show();
  }

  _filename() {
    const date = new Date();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `ncrs_skin_${year}${month}${day}_${hours}${minutes}`;
  }
}

customElements.define("ncrs-export-tab", ExportTab);

export default ExportTab;