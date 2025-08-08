import BaseVersion from "../base_version";
import NCRSLegacyVersion from "./ncrs_legacy";
import schema3Validate from "./schemas/schema_3";

class NCRSFormat3 extends BaseVersion {
  static exportEditor(editor) {
    return {
      format: 3,
      variant: editor.config.get("variant"),
      layers: editor.layers.serializeLayers(),
      blendPalette: editor.toolConfig.get("blend-palette"),
    };
  }

  constructor(data) {
    super(NCRSLegacyVersion, data, 3);
  }

  checkData(data) {
    if (this.versionCheck(data)) {
      return data;
    } else if (!!data.format) {
      return this.convert(data);
    } else {
      const transformedData = this.transformData(data);
      return transformedData;
    }
  }

  convert(data) {
    data.format = this.format;

    return data;
  }

  validateData(data) {
    const valid = schema3Validate(data);

    if (!valid) { console.log(schema3Validate.errors, data); }

    return valid;
  }

  loadEditor(editor) {
    editor.history.wipe();

    editor.config.set("variant", this.data.variant);
    editor.toolConfig.set("blend-palette", this.data.blendPalette);

    editor.layers.layers = [];
    this.data.layers.forEach(layer => {
      const deserializedLayer = editor.layers.deserializeLayer(layer);
      editor.layers.addLayer(deserializedLayer);
    });
  }
}

export default NCRSFormat3;