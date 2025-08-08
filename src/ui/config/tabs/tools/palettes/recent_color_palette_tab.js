import Color from "color";
import { clamp } from "../../../../../helpers";
import Tab from "../../../../misc/tab";
import { css, html } from "lit";

const defaultColors = [];

class RecentColorPaletteTab extends Tab {
  static styles = [
    Tab.styles,
    css`
      :host {
        --palette-width: 12;
      }

      #main {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
        box-sizing: border-box;
        height: 100%;
      }

      p {
        margin: 0px;
        color: #aaaaaa;
        font-size: small;
        padding-bottom: 0.25rem;
      }

      #options {
        display: flex;
        justify-content: space-between;
        height: 22px;
      }

      #palette-select, #columns {
        background-color: #232428;
        border: none;
        border-radius: 0.25rem;
        color: white;
      }

      #palette-label {
        color: white;
        font-size: small;
        margin-right: 0.25rem;
      }

      #palette {
        flex-grow: 1;
        height: 78px;
        overflow: auto;
        padding-right: 2px;
        scrollbar-color: #3d4042 #1a1a1a;
        scrollbar-width: thin;
      }

      #colors {
        display: grid;
        grid-template-columns: repeat(var(--palette-width), 1fr);
        gap: 0.125rem;
      }

      #columns {
        width: 2.5rem;
      }

      .color {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        aspect-ratio: 1;
        border-radius: 0.125rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 3px inset, rgba(0, 0, 0, 0.25) 0px -1px 0px inset;
      }

      .color.selected::after {
        content: "";
        display: block;
        width: 50%;
        height: 50%;
        border-radius: 9999px;
        outline: 2px solid white;
      }

      .color.selected.light::after {
        outline-color: black;
      }

      .color:focus-visible {
        border: white solid 1px;
      }

      .color.light:focus-visible {
        border: black solid 1px;
      }
    `
  ]

  constructor(ui, colorPicker) {
    super({name: "Recent Colors"});

    this.ui = ui;
    this.editor = this.ui.editor;
    this.colorPicker = colorPicker;
    this.colors = this._loadColors();

    this.setDarkened(this.colors.length < 1);

    this._setupEvents();
  }

  render() {
    if (this.colors.length < 1) {
      return html`
        <div id="main">
          <p>
            No recent colors.
          </p>
          <p>
            Colors you use in your skin will show up here.
          </p>
        </div>
      `;
    }

    this.setDarkened(this.colors.length < 1);

    return html`
      <div id="main">
        <div id="palette">
          <div id="colors">
            ${this.colors.map(color => this._renderColor(color))}
          </div>
        </div>
        <div id="options">
          <input
            id="columns" value="12" type="number"
            title="Palette width"
            inputmode="numeric"
            @input=${this._onColumnsInput}
            @wheel=${this._onColumnsWheel}
          >
        </div>
      </div>
    `;
  }

  _renderColor(color) {
    const thisColor = new Color(color);
    const selectedColor = this.colorPicker.getColor();
    const isSelected = thisColor.rgb().string() == selectedColor.rgb().string();
    const isLight = thisColor.isLight();

    return html`
      <button 
        class="color ${isSelected ? 'selected' : ''} ${isLight ? 'light' : ''}"
        style="background-color: ${color}"
        title="Set color to ${color}"
        @click="${() => this.colorPicker.setColor(color)}"
      ></button>
    `;
  }

  addColor(color) {
    if (this.colors.includes(color)) { return; }

    const len = this.colors.unshift(color);

    if (len > 48) {
      this.colors.pop();
    }

    this.ui.persistence.set("recentPalette", this.colors);
    this.requestUpdate();
  }

  _loadColors() {
    return this.ui.persistence.get("recentPalette", defaultColors);
  }

  _createColor(color) {
    const button = document.createElement("button");
    button.classList = ["color"];
    button.title = `Set color to ${color}`

    button.style.backgroundColor = color;
    button.setAttribute("color", color);

    const thisColor = new Color(color);
    const selectedColor = this.colorPicker.getColor();

    if (thisColor.rgb().string() == selectedColor.rgb().string()) {
      button.classList.add("selected");
    }

    if (thisColor.isLight()) {
      button.classList.add("light");
    }

    button.addEventListener("click", () => {
      this.colorPicker.setColor(color);
    })

    return button;
  }

  _setupEvents() {
    this.editor.addEventListener("tool-up", () => {
      if (!this.editor.currentTool.properties.providesColor) { return; }

      const color = this.editor.toolConfig.get("color");

      this.addColor(color.hex().toLowerCase())
    })

    this.addEventListener("wheel", this._onPaletteWheel.bind(this));

    this.colorPicker.addEventListener("color-change", () => {
      this.requestUpdate();
    });
  }

  _onColumnsInput(event) {
    if (event.target.value == "") { return; }

    event.target.value = clamp(Number(event.target.value), 4, 16);
    this.style.setProperty("--palette-width", event.target.value);
  }

  _onColumnsWheel(event) {
    event.preventDefault();
    let dir = 1;
    if (event.deltaY > 0) { dir = -1 }
    event.target.value = clamp(Number(event.target.value) + dir, 4, 16);
    this.style.setProperty("--palette-width", event.target.value)
  }

  _onPaletteWheel(event) {
    if (!event.ctrlKey) { return; }
    event.preventDefault();

    let dir = 1;
    if (event.deltaY < 0) { dir = -1 }

    const columns = this.shadowRoot.getElementById("columns");
    columns.value = clamp(Number(columns.value) + dir, 4, 16);
    this.style.setProperty("--palette-width", columns.value);
  }
}

customElements.define("ncrs-recent-color-palette-tab", RecentColorPaletteTab);

export default RecentColorPaletteTab;