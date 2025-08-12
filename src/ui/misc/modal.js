import { css, html, LitElement } from "lit";

class Modal extends LitElement {
  static properties = {
    open: {type: Boolean, reflect: true}
  }

  static styles = css`
    :host {
      display: none;

      position: fixed;

      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);

      overflow: auto;
      overscroll-behavior: contain;

      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
    }

    :host([open]) {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }

    ::slotted(div) {
      background: var(--background-color, #2c2c2c);
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    slot {
      /* Centered content with reasonable bounds */
      max-width: 90vw;
      max-height: 90vh;
      display: block;
    }
  `

  constructor() {
    super();

    document.addEventListener("keydown", event => this._handleKeyDown(event));
    this.addEventListener("click", () => this.hide());
  }

  firstUpdated() {
    this._syncState();
  }

  render() {
    return html`
      <slot @click=${this._cancelEvent}></slot>
    `
  }

  show() {
    if (this.open) { return; }

    this._showEvent();
    this.open = true;
  }

  hide() {
    if (!this.open) { return; }
    
    this._hideEvent();
    this.open = false;
  }

  _cancelEvent(event) {
    event.stopPropagation();
  }

  _handleKeyDown(event) {
    if (event.key === "Escape") {
      this.hide();
    }
  }

  _syncState() {
    this.open ? this._showEvent() : this._hideEvent();
  }

  _showEvent() {
    this.dispatchEvent(new CustomEvent("show"));
  }

  _hideEvent() {
    this.dispatchEvent(new CustomEvent("hide"));
  }
}

customElements.define("ncrs-modal", Modal);

export default Modal;