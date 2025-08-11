import { BaseEntry } from "../base_entry";
import * as THREE from "three";
import GroupedEntry from "./grouped_entry";
import UpdateLayerTextureEntry from "./update_layer_texture_entry";
import DeleteLayerEntry from "./delete_layer_entry";
import SelectLayerEntry from "./select_layer_entry";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../../../constants";

class MergeLayersEntry extends BaseEntry {
  constructor(layers, target, source) {
    super();

    this.entryGroup = this._setupEntryGroup(layers, target, source);
  }

  onPerform() {
    return this.entryGroup.perform();
  }

  onRevert() {
    return this.entryGroup.revert();
  }

  _setupEntryGroup(layers, target, source) {
    const canvas = new OffscreenCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(target.getBaseCanvas(), 0, 0);
    ctx.drawImage(source.render(), 0, 0);

    const texture = new THREE.Texture(canvas, IMAGE_WIDTH, IMAGE_HEIGHT);

    return new GroupedEntry(
      new UpdateLayerTextureEntry(layers, target, texture),
      new DeleteLayerEntry(layers, source),
      new SelectLayerEntry(layers, {layer: target}),
    );
  }
}

export default MergeLayersEntry;