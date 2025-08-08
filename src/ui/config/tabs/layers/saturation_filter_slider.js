import CssFilter from "../../../../editor/layers/filters/css_filter";
import BaseFilterSlider from "./base_filter_slider";

class SaturationFilterSlider extends BaseFilterSlider {
  constructor(layers) {
    super(layers, {
      name: "saturation",
      default: 0.5,
    });

    this.slider.unclamped = true;
  }

  getValue() {
    return this.getProgress() * 200;
  }

  toFilter() {
    return new CssFilter(`saturate(${this.getValue()}%)`, {name: this.name, value: this.getProgress()});
  }
}

export default SaturationFilterSlider;