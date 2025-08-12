import { css, html, LitElement } from "lit";
const ICON_PATH = "/images/icons/";

import imgIconAdd from "/assets/images/icons/misc/add.svg";
import imgIconBackfaceCulling from "/assets/images/icons/toggles/backface-culling.svg";
import imgIconBase from "/assets/images/icons/toggles/base.svg";
import imgIconBaseGrid from "/assets/images/icons/toggles/base-grid.svg";
import imgIconBlend from "/assets/images/icons/modifiers/blend.svg";
import imgIconBlowUpModel from "/assets/images/icons/toggles/blow-up-model.svg";
import imgIconBoxChecked from "/assets/images/icons/box-checked.svg";
import imgIconBoxHalfChecked from "/assets/images/icons/box-half-checked.svg";
import imgIconBoxInnerChecked from "/assets/images/icons/box-inner-checked.svg";
import imgIconBoxOuterChecked from "/assets/images/icons/box-outer-checked.svg";
import imgIconBoxUnchecked from "/assets/images/icons/box-unchecked.svg";
import imgIconBrush from "../../../assets/images/icons/brush.png";
import imgIconBucket from "../../../assets/images/icons/bucket.png";
import imgIconCamo from "/assets/images/icons/modifiers/camo.svg";
import imgIconCgol from "/assets/images/icons/cgol.svg";
import imgIconCircle from "/assets/images/icons/modifiers/circle.svg";
import imgIconClone from "/assets/images/icons/misc/clone.svg";
import imgIconReplaceColor from "/assets/images/icons/modifiers/replace-color.svg";
import imgIconCopy from "/assets/images/icons/misc/copy.svg";
import imgIconDarkMode from "/assets/images/icons/misc/dark-mode.svg";
import imgIconDownload from "/assets/images/icons/download.svg";
import imgIconDuskMode from "/assets/images/icons/misc/dusk-mode.svg";
import imgIconEraser from "/assets/images/icons/tools/eraser.svg";
import imgIconEyeClosed from "/assets/images/icons/toggles/eye-closed.svg";
import imgIconEyeOpen from "/assets/images/icons/toggles/eye-open.svg";
import imgIconEyedropper from "/assets/images/icons/tools/eyedropper.svg";
import imgIconForce1 from "/assets/images/icons/modifiers/force-1.svg";
import imgIconForce2 from "/assets/images/icons/modifiers/force-2.svg";
import imgIconForce3 from "/assets/images/icons/modifiers/force-3.svg";
import imgIconForce4 from "/assets/images/icons/modifiers/force-4.svg";
import imgIconForce5 from "/assets/images/icons/modifiers/force-5.svg";
import imgIconFullscreen from "../../../assets/images/icons/fullscreen.png";  
import imgIconJitter from "/assets/images/icons/jitter.svg";
import imgIconLightMode from "/assets/images/icons/misc/light-mode.svg";
import imgIconLighten from "/assets/images/icons/modifiers/lighten.svg";
import imgIconMerge from "/assets/images/icons/misc/merge.svg";
import imgIconMinimize from "/assets/images/icons/misc/minimize.svg";
import imgIconMirror from "/assets/images/icons/modifiers/mirror.svg";
import imgIconOverlay from "/assets/images/icons/toggles/overlay.svg";
import imgIconOverlayGrid from "/assets/images/icons/toggles/overlay-grid.svg";
import imgIconPaste from "/assets/images/icons/misc/paste.svg";
import imgIconRedo from "/assets/images/icons/misc/redo.svg";
import imgIconRemove from "/assets/images/icons/misc/remove.svg";
import imgIconSaturate from "/assets/images/icons/modifiers/saturate.svg";
import imgIconSculpt from "/assets/images/icons/tools/sculpt.svg";
import imgIconSearch from "/assets/images/icons/misc/search.svg";
import imgIconShade from "/assets/images/icons/toggles/shade.svg";
import imgIconShadeOnce from "/assets/images/icons/modifiers/shade-once.svg";
import imgIconShading from "/assets/images/icons/tools/shading.svg";
import imgIconSize1 from "/assets/images/icons/modifiers/size-1.svg";
import imgIconSize2 from "/assets/images/icons/modifiers/size-2.svg";
import imgIconSize3 from "/assets/images/icons/modifiers/size-3.svg";
import imgIconSquare from "/assets/images/icons/modifiers/square.svg";
import imgIconUndo from "/assets/images/icons/misc/undo.svg";


const ICON_MAP = {
  "add": imgIconAdd,
  "backface-culling": imgIconBackfaceCulling,
  "base": imgIconBase,
  "base-grid": imgIconBaseGrid,
  "blend": imgIconBlend,
  "blow-up-model": imgIconBlowUpModel,
  "box-checked": imgIconBoxChecked,
  "box-half-checked": imgIconBoxHalfChecked,
  "box-inner-checked": imgIconBoxInnerChecked,
  "box-outer-checked": imgIconBoxOuterChecked,
  "box-unchecked": imgIconBoxUnchecked,
  "brush": imgIconBrush,
  "bucket": imgIconBucket,
  "camo": imgIconCamo,
  "cgol": imgIconCgol,
  "circle": imgIconCircle,
  "clone": imgIconClone,
  "replace-color": imgIconReplaceColor,
  "copy": imgIconCopy,
  "dark-mode": imgIconDarkMode,
  "download": imgIconDownload,
  "dusk-mode": imgIconDuskMode,
  "eraser": imgIconEraser,
  "eye-closed": imgIconEyeClosed,
  "eye-open": imgIconEyeOpen,
  "eyedropper": imgIconEyedropper,
  "force-1": imgIconForce1,
  "force-2": imgIconForce2,
  "force-3": imgIconForce3,
  "force-4": imgIconForce4,
  "force-5": imgIconForce5,
  "fullscreen": imgIconFullscreen,
  "jitter": imgIconJitter,
  "light-mode": imgIconLightMode,
  "lighten": imgIconLighten,
  "merge": imgIconMerge,
  "minimize": imgIconMinimize,
  "mirror": imgIconMirror,
  "overlay": imgIconOverlay,
  "overlay-grid": imgIconOverlayGrid,
  "paste": imgIconPaste,
  "redo": imgIconRedo,
  "remove": imgIconRemove,
  "saturate": imgIconSaturate,
  "sculpt": imgIconSculpt,
  "search": imgIconSearch,
  "shade": imgIconShade,
  "shade-once": imgIconShadeOnce,
  "shading": imgIconShading,
  "size-1": imgIconSize1,
  "size-2": imgIconSize2,
  "size-3": imgIconSize3,
  "square": imgIconSquare,
  "undo": imgIconUndo,
}

class Icon extends LitElement {
  constructor() {
    super();
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    div {
      width: 100%;
      height: 100%;
      
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;

      /* Old webkit browsers */
      -webkit-mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
    }
  `;

  static properties = {
    icon: {},
    color: {},
  }

  render() {
    const iconSrc = ICON_MAP[this.icon];
    if (!iconSrc) {
      console.warn(`Icon '${this.icon}' not found in ICON_MAP`);
      return document.createElement('div');
    }
    const isSvg = typeof iconSrc === 'string' ? iconSrc.endsWith('.svg') : false;
    
    if (isSvg) {
      // For SVGs, use the mask approach
      const div = document.createElement("div");
      div.style.maskImage = `url("${iconSrc}")`;
      div.style.webkitMaskImage = `url("${iconSrc}")`;
      div.style.backgroundColor = this.color || 'currentColor';
      return div;
    } else {
      // For PNGs, use an img element with transparent background
      const container = document.createElement("div");
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.backgroundColor = 'transparent';
      
      const img = document.createElement("img");
      img.src = iconSrc;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      img.style.pointerEvents = 'none';
      
      container.appendChild(img);
      return container;
    }
  }
}

customElements.define("ncrs-icon", Icon);

export default Icon;