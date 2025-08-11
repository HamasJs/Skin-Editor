import {default as VERSION} from "./versions/ncrs_format_3";

class ProjectLoader {
  static version = VERSION;

  static export(editor) {
    return this.version.exportEditor(editor);
  }

  constructor(data) {
    this.version = new VERSION(data);
  }

  load(editor) {
    this.version.loadEditor(editor);
  }

  getData() {
    return this.version.data;
  }

  serialize() {
    return this.version.serialize();
  }
}

export default ProjectLoader;