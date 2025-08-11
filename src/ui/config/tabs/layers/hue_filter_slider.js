import CssFilter from "../../../../editor/layers/filters/css_filter";
import BaseFilterSlider from "./base_filter_slider";

class HueFilterSlider extends BaseFilterSlider {
  constructor(layers) {
    super(layers, {
      name: "hue",
      default: 0.5,
    });

    this.slider.steps = 360;
    this.slider.max = 359;
  }

  getValue() {
    let value = this.getProgress() - 0.5;
    if (value < 0) {
      value += 1;
    }

    return value * 360;
  }

  toFilter() {
    return new CssFilter(`hue-rotate(${this.getValue()}deg)`, {name: this.name, value: this.getProgress()});
  }
}

export default HueFilterSlider;