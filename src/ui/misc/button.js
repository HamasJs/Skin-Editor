import { css, html, LitElement } from "lit";

class Button extends LitElement {
  static styles = css`
    :host {
      --text-color: white;
      --text-color-hover: #ccc;
      --text-color-pressed: #aaa;
      --text-color-active: #55b2ff;
      --text-color-disabled: #565758;
      display: block;
    }

    button {
      all: unset;
      display: block;
      width: 100%;
      height: auto;
      cursor: pointer;
      user-select: none;
      border-radius: 0.25rem;
      border: 1px solid transparent; /* transparent border */
      background-color: transparent; /* no background */
      box-shadow: none; /* remove shadow */
      box-sizing: border-box;
      margin-bottom: 0.375rem;
      color: var(--text-color);
    }

    button:not(:disabled):hover {
      --text-color: var(--text-color-hover);
      background-color: rgba(255, 255, 255, 0.05); /* light overlay on hover */
    }

    button:active:not(:disabled) {
      --text-color: var(--text-color-pressed);
      background-color: rgba(255, 255, 255, 0.1); /* slightly darker overlay on click */
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
    }

    :host([active]) button {
      --text-color: var(--text-color-active);
      background-color: rgba(255, 255, 255, 0.1);
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
    }

    button:focus-visible {
      outline: 1px white solid;
    }

    button:disabled {
      --text-color: var(--text-color-disabled);
      background-color: transparent;
      box-shadow: none;
      cursor: initial;
    }
  `

  static properties = {
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  }

  render() {
    return html`
      <button part="button" ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `
  }
}

customElements.define("ncrs-button", Button);

export default Button;
