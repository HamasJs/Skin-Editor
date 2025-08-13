import { css, html, LitElement } from "lit";
import { ICON_MAP } from "../misc/icon";

class Tool extends LitElement {
  static styles = css`
    ncrs-button::part(button) {
      padding: 0.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    ncrs-icon {
      height: 1.75rem;
      width: auto;
      display: block;
    }
  `;

  static properties = {
    active: {reflect: true},
    disabled: {reflect: true},
    _isDarkTheme: {state: true}
  }

  constructor(ui, tool) {
    super()
    this.active = false;
    this.disabled = false;
    this.ui = ui;
    this.tool = tool;
    this._isDarkTheme = document.documentElement.classList.contains('editor-dark');
    this._handleThemeChange = this._handleThemeChange.bind(this);
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
  }

  render() {
    this.active = (this.ui.editor.currentTool == this.tool);

    const properties = this.tool.properties;
    const title = properties.name + "\n" + properties.description + (this.disabled ? "\n\n(Disabled)" : "");
    
    // Get the appropriate icon based on the current theme
    let iconName = properties.icon;
    
    // If icon is an object with dark/light variants, select the appropriate one
    if (typeof iconName === 'object') {
      iconName = this._isDarkTheme ? 
        (iconName.dark || '') : 
        (iconName.light || iconName.dark || '');
    }

    return html`
      <ncrs-button ?active=${this.active} ?disabled=${this.disabled} title="${title}" @click=${this.select}>
        <ncrs-icon icon="${iconName}" color="var(--text-color)"></ncrs-icon>
      </ncrs-button>
    `
  }

  select() {
    if (this.active) {
      this.ui.config.select("tool");
    }

    this.active = true;
    this.ui.editor.selectTool(this.tool);
  }
}

customElements.define("ncrs-tool", Tool);

export default Tool;