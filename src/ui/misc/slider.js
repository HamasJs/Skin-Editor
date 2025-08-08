import { LitElement, css, html } from "lit";
import { clamp } from "../../helpers";

class Slider extends LitElement {
  static properties = {
    progress: { reflect: true, type: Number },
    steps: { type: Number },
    min: { type: Number },
    max: { type: Number },
    unclamped: { type: Boolean },
  };

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      position: relative;
      cursor: pointer;
      box-sizing: border-box;
    }

    #slider {
      position: relative;
      width: 100%;
      flex-grow: 1;
    }

    :host(:focus) #slider {
      outline: white solid 1px;
    }

    #background {
      all: unset;
      display: block;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }

    #cursor {
      pointer-events: none;
      position: absolute;
      top: 0px;
      height: 100%;
      width: 4px;
      outline: 0.125rem solid white;
      border-radius: 0.25rem;
    }

    #input {
      width: 1.75rem;
      font-size: x-small;
      box-sizing: border-box;
      overflow-y: hidden;
      color: white;
      text-align: center;
      background-color: #131315;
      border-style: solid;
      border-width: 0px;
      border-radius: 4px;
      box-shadow: 0 0 0 2px #313436;
      margin-left: 3px;
      margin-right: 4px;
    }

    :host(:hover) > #cursor {
      outline: 0.125rem solid #f5f8cc;
    }
  `;

  constructor() {
    super();

    this.progress = this.progress || 1;
    this.steps = this.steps || 255;

    this.input = this._setupInput();

    const scope = this;

    const pointerMove = function (event) {
      scope.onMove(event);
    };

    const pointerUp = () => {
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
    };

    this._onPointerDown = () => {
      document.addEventListener("pointermove", pointerMove);
      document.addEventListener("pointerup", pointerUp);
    };

    this._setupResizeObserver();
  }
  _sliderDiv;

  attributeChangedCallback(name, _old, value) {
    super.attributeChangedCallback(name, _old, value);

    if (name === "progress") {
      this.dispatchEvent(new CustomEvent("slider-change", { detail: { progress: this.progress, value: this.getValue() } }));
    }
  }

  render() {
    this.input.value = this.getValue();

    return html`
      <div id="slider" part="slider">
        <button @pointerdown=${this.onClick} @keydown=${this.onKeyDown} @wheel=${this.onWheel} id="background"></button>
        <div id="cursor" part="cursor" style="left: ${this._getPos() - 2}px;"></div>
      </div>
      ${this.input}
    `;
  }

  getValue() {
    return Math.floor(this.progress * this.steps);
  }

  getMin() {
    return this.min || 0;
  }

  getMax() {
    return this.max || this.steps;
  }

  onClick(event) {
    if (event.button != 0) { return; }

    this.setProgress(event.layerX / this._clientWidth());
    this._onPointerDown();
  }

  onMove(event) {
    const rect = this.getBoundingClientRect();
    this.setProgress((event.clientX - rect.x) / this._clientWidth());
  }

  onWheel(event) {
    event.preventDefault();

    const stepSize = 1 / this.steps;
    const shiftMultiplier = 5;

    let step = stepSize;
    if (event.shiftKey) {
      step *= shiftMultiplier;
    }

    if (event.deltaY > 0) {
      step *= -1;
    }

    this.setProgress(this.progress + step);
  }

  onKeyDown(event) {
    if (event.key === "Tab") {
      return;
    }
    event.preventDefault();

    const key = event.key;
    const stepSize = 1 / this.steps;
    const shiftMultiplier = 5;

    let step = stepSize;
    if (event.shiftKey) {
      step *= shiftMultiplier;
    }

    let progress = this.progress;

    switch (key) {
      case "ArrowRight":
        progress += step;
        break;
      case "ArrowLeft":
        progress -= step;
        break;
      case "ArrowUp":
        progress += step;
        break;
      case "ArrowDown":
        progress -= step;
        break;
    }

    this.setProgress(progress);
  }

  setProgress(x) {
    if (this.unclamped) {
      this.progress = Math.max(x, 0);
    } else {
      this.progress = clamp(x, this.getMin() / this.steps, this.getMax() / this.steps);
    }
    this.dispatchEvent(new CustomEvent("slider-set", {detail: { progress: this.progress, value: this.getValue() }}));
  }

  _getPos() {
    return this._clientWidth() * clamp(this.progress, 0, 1);
  }

  _clientWidth() {
    this._sliderDiv = this._sliderDiv || this.shadowRoot.getElementById("slider");

    if (!this._sliderDiv) { return 0; }

    return this._sliderDiv.clientWidth;
  }

  _setupInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "input";
    input.part = "input";

    input.addEventListener("change", () => {
      const value = Number(input.value);

      if (isNaN(value)) {
        input.value = 0;
        this.setProgress(0);
        return;
      }

      input.value = clamp(value, 0, this.steps);
      this.setProgress(value / this.steps);
    });

    input.addEventListener("wheel", this.onWheel.bind(this));

    return input;
  }

  _setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.requestUpdate();
    })

    resizeObserver.observe(this);
  }
}

customElements.define("ncrs-slider", Slider);

export default Slider;