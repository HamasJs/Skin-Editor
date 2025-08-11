import { BaseEntry } from "../base_entry";

class AddLayerEntry extends BaseEntry {
  constructor(layers, params = {}) {
    super();

    this.layers = layers;
    
    this.texture = params.texture;
    this.layer = params.layer;
  }

  onPerform() {
    this.layer = this.layer || this._createLayer();
    this.layers.addLayer(this.layer);
  }

  onRevert() {
    this.layers.removeLayer(this.layer);
  }

  _createLayer() {
    if (this.texture) {
      return this.layers.createFromTexture(this.texture);
    }

    return this.layers.createBlank();
  }
}

export default AddLayerEntry;