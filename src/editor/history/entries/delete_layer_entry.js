import { BaseEntry } from "../base_entry";

class DeleteLayerEntry extends BaseEntry {
  constructor(layers, layer) {
    super();
    
    this.layers = layers;
    this.layer = layer;
  }
  index;
  selected;

  onPerform() {
    this.index = this.layers.layerIndex(this.layer);
    this.selected = (this.layers.selectedLayerIndex == this.index);
    this.layers.removeLayer(this.layer);
    this.layers.selectLayer(this.layers.getSelectedLayerIndex());
  }

  onRevert() {
    if (this.index >= this.layers.layers.length) {
      this.layers.addLayer(this.layer)
    } else {
      this.layers.insertLayer(this.layer, this.index);
    }

    if (this.selected) {
      this.layers.selectLayer(this.index);
    }
  }
}

export default DeleteLayerEntry;