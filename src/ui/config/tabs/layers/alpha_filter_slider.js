import CssFilter from "../../../../editor/layers/filters/css_filter";
import BaseFilterSlider from "./base_filter_slider";

class AlphaFilterSlider extends BaseFilterSlider {
  constructor(layers) {
    super(layers, {
      name: "alpha",
      default: 1.0,
    });
  }

  getValue() {
    return this.getProgress() * 100;
  }

  toFilter() {
    return new CssFilter(`opacity(${this.getValue()}%)`, {name: this.name, value: this.getProgress()});
  }
}

export default AlphaFilterSlider;