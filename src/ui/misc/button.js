import { css, html, LitElement, nothing } from "lit";

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
      border-width: 1px;
      border-color: rgb(35, 36, 40) rgb(35, 36, 40) rgb(30, 35, 38);
      background-image: linear-gradient(to top, #24272a, #313436);
      box-shadow: #3d4042 0px 0px 0px 1px inset, #191a1c 0px 1px 3px, #1f2226 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
      box-sizing: border-box;

      margin-bottom: 0.375rem;
      color: var(--text-color);
    }

    button:not(:disabled):hover {
      --text-color: var(--text-color-hover);
      box-shadow: #505254 0px 0px 0px 1px inset, #191a1c 0px 0px 3px, #272a2d 0px 4px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
    }

    button:active:not(:disabled) {
      --text-color: var(--text-color-pressed);
      background-image: linear-gradient(to top, rgb(49, 52, 54), rgb(36, 39, 42));
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
    }

    :host([active]) button {
      --text-color: var(--text-color-active);
      background-image: linear-gradient(to top, rgb(49, 52, 54), rgb(36, 39, 42));
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
    }

    button:focus-visible {
      outline: 1px white solid;
    }

    button:disabled {
      --text-color: var(--text-color-disabled);
      background-image: linear-gradient(to top, #222427, #2a2d2f);
      box-shadow: #1c1e1f  0px 0px 0px 1px inset, #191a1c 0px 1px 3px, rgba(0, 0, 0, 0.2) 0px 4px 3px;
      cursor: initial
    }
  `

  static properties = {
    active: {type: Boolean, reflect: true},
    disabled: {type: Boolean, reflect: true},
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