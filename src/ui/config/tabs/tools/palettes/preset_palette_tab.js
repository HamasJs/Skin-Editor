import { clamp } from "three/src/math/MathUtils.js";
import Tab from "../../../../misc/tab";
import { css, html } from "lit";
import Color from "color";

const defaultPalettes = [
  {
    name: "Allure",
    palette: ["#2c152c","#472246","#772655","#b42552","#e8453c","#f68f5d","#ffdeb6","#931651","#c54324","#da6d11","#efa326","#f6c532","#ffe27a","#fffadf","#01323e","#0a5151","#157362","#34a868","#66e16f","#aafb93","#edffe5","#042b47","#0a455d","#0d6577","#11818d","#17a8ad","#44cfc0","#92f5df","#393080","#5047ce","#5b77f9","#3dabec","#45daf8","#97eeff","#defbff","#431b69","#6c22ac","#9832ca","#c63ed2","#f84ada","#ff99de","#ffdaf4","#980699","#c61a97","#e843a3","#f471af","#fa9bc8","#ffcfde","#fff4f8","#481c1a","#6b2d27","#913f34","#ba6143","#d58665","#e8af99","#f5dad0","#221213","#351d20","#4c2b2b","#593931","#63463b","#705344","#846857","#2f3048","#494a65","#61657e","#80859d","#a5abc2","#c7cbd9","#e8eaef","#3c264c","#473464","#5a4d85","#6c69a3","#8189bb","#a9b7d6","#cee6f1","#19121d","#241c27","#2e2733","#3c3441","#4a4250","#655c67","#817880"],
    scale: 14
  },
  {
    name: "Skin Tones",
    palette: ["#c27f7c","#d79d93","#e6b1a4","#efc8b8","#f7dece","#c27764","#cf9475","#e0b08a","#f0c697","#f3d2a2","#7e4855","#9a5b5d","#a97266","#bd8e76","#d5ab88","#5d3740","#754540","#8b5949","#a06e53","#af7e57","#2e1e30","#412431","#582f34","#6f403a","#7a4d3e"],      
    "scale": 10
  },
  {
    name: "Pastels",
    palette: ["#d26a3d","#df8433","#ea9d31","#f2b23a","#f8cb43","#ffe27a","#fff5c7","#c1567b","#dc6272","#f17b7b","#f89f96","#fcb7af","#ffd6cc","#ffebe6","#c156b4","#dc62b3","#f17bba","#f896c1","#fcafd0","#ffccdd","#ffe6ee","#5c56c1","#8362dc","#aa7bf1","#c696f8","#d6affc","#ebccff","#f5e6ff","#5d8ed4","#669ede","#6cade5","#74c0ee","#91d3f2","#adeafa","#ddf8fe","#226468","#267776","#298d86","#31a591","#3ec4a2","#62dcb3","#95efd2"],
    scale: 14
  },
  {
    name: "Nature",
    palette: ["#242e23","#313f2e","#445539","#546a3e","#6b8347","#88a150","#aac156","#1b261d","#293a29","#375033","#486940","#5d874f","#70a059","#83b861","#271213","#3d1d1e","#5a2b2a","#723b32","#8a523e","#9d6a53","#b18875","#45201a","#5b2720","#77352b","#934335","#b45e41","#ca7b5c","#d99a84","#ad7048","#b3804d","#c6a064","#d8bc79","#e0ca8a","#ecdfa5","#f5edcd"],
    scale: 14
  },
  {
    name: "Gameboy",
    palette: ["#bdc156","#90a651","#738747","#56683e","#3e4b37","#2d352e","#222327","#19191d"],
    scale: 8
  },
  {
    name: "Ruby",
    palette:["#160a1c","#2c152c","#472246","#772655","#b42552","#e8453c","#f27343","#fba948","#ffcb6d","#ffee94","#fdffcf"],
    scale: 11
  },
  {
    name: "Place",
    palette: ["#E8453C","#DA6D11","#F6C532","#66E16F","#3DABEC","#5047CE","#9832CA","#C61A97","#F84ADA","#E6B1A4","#E0B08A","#BD8E76","#9A5B5D","#754540","#412431","#000000","#494A65","#A5ABC2","#FFFFFF"],
    scale: 10
  },
  {
    name: "Paint",
    palette: ["#000000", "#7F7F7F", "#880015", "#ED1C24", "#FF7F27", "#FFF200", "#21B14C", "#00A2E8", "#3E48CC", "#A349A4",
      "#FFFFFF", "#C3C3C3", "#B97A57", "#FFAEC9", "#FFC90E", "#EFE4B0", "#B5E61D", "#99D9EA", "#7092BE", "#C8BFE7"
    ],
    scale: 10,
  }
]

class PresetPaletteTab extends Tab {
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

  constructor(colorPicker) {
    super({name: "Palette"});

    this.colorPicker = colorPicker;
    this.palettes = this._loadPalettes();

    const currentPalette = this.palettes[0];

    this.colors = currentPalette.palette;
    this.scale = currentPalette.scale;

    this.select = this._createSelect();
    this.select.id = "palette-select";

    this.scaleInput = this._createScaleInput();

    this._setupEvents();
  }

  render() {
    const colorsDiv = document.createElement("div");
    colorsDiv.id = "colors";

    this.colors.forEach(color => {
      colorsDiv.appendChild(this._createColor(color))
    });

    this.style.setProperty("--palette-width", this.scale);

  }

  _loadPalettes() {
    return defaultPalettes;
  }

  _createSelect() {
    const select = document.createElement("select");

    let idx = 0;
    this.palettes.forEach(palette => {
      const option = document.createElement("option");
      option.value = idx;
      option.textContent = palette.name;

      select.appendChild(option);

      idx++;
    });

    select.addEventListener("input", () => {
      const palette = this.palettes[select.value];

      this.scale = palette.scale;
      this.scaleInput.value = this.scale;
      this.colors = palette.palette;

      this.requestUpdate();
    });

    return select;
  }

  _createScaleInput() {
    const scaleInput = document.createElement("input");

    scaleInput.id = "columns";
    scaleInput.title = "Palette width";
    scaleInput.type = "number";
    scaleInput.inputmode = "numeric";
    scaleInput.addEventListener("input", event => this._onColumnsInput(event));
    scaleInput.addEventListener("wheel", event => this._onColumnsWheel(event));
    scaleInput.value = this.scale;

    return scaleInput;
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
    this.addEventListener("wheel", this._onPaletteWheel.bind(this));
    this.colorPicker.addEventListener("color-change", () => {
      this.requestUpdate();
    });
  }

  _onColumnsInput(event) {
    if (event.target.value == "") { return; }

    event.target.value = clamp(Number(event.target.value), 4, 16);
    this.scale = event.target.value;
    this.style.setProperty("--palette-width", event.target.value);
  }

  _onColumnsWheel(event) {
    event.preventDefault();
    let dir = 1;
    if (event.deltaY > 0) { dir = -1 }
    event.target.value = clamp(Number(event.target.value) + dir, 4, 16);
    this.scale = event.target.value;
    this.style.setProperty("--palette-width", event.target.value)
  }

  _onPaletteWheel(event) {
    if (!event.ctrlKey) { return; }
    event.preventDefault();

    let dir = 1;
    if (event.deltaY < 0) { dir = -1 }

    const columns = this.shadowRoot.getElementById("columns");
    columns.value = clamp(Number(columns.value) + dir, 4, 16);
    this.scale = columns.value;
    this.style.setProperty("--palette-width", columns.value);
  }
}

customElements.define("ncrs-preset-palette-tab", PresetPaletteTab);

export default PresetPaletteTab;