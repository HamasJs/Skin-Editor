import { BaseEntry } from "../base_entry";

class GroupedEntry extends BaseEntry {
  constructor(...entries) {
    super();

    this.entries = entries;
  }

  onPerform() {
    this.entries.forEach(entry => {
      entry.perform();
    });
  }

  onRevert() {
    this.entries.forEach(entry => {
      entry.revert();
    });
  }
}

export default GroupedEntry;