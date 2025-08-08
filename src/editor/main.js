import { LitElement, css, html } from "lit";
import * as THREE from "three";
import { Controls } from "./controls";
import { Layers } from "./layers/layers";
import { SkinModel } from "./model/model";
import { Renderer } from "./renderer";
import { HistoryManager } from "./history/history_manager";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../constants";
import AddLayerEntry from "./history/entries/add_layer_entry";
import ToolConfig from "./tools/tool_config";
import UpdateLayerTextureEntry from "./history/entries/update_layer_texture_entry";
import ToolData from "./tools/tool_data";
import PenTool from "./tools/toolset/pen_tool";
import BucketTool from "./tools/toolset/bucket_tool";
import EraseTool from "./tools/toolset/erase_tool";
// import SculptTool from "./tools/toolset/sculpt_tool";
// import ShadeTool from "./tools/toolset/shade_tool";
import SelectLayerEntry from "./history/entries/select_layer_entry";
import GroupedEntry from "./history/entries/grouped_entry";
import DeleteLayerEntry from "./history/entries/delete_layer_entry";
import ReorderLayersEntry from "./history/entries/reorder_layers_entry";
import MergeLayersEntry from "./history/entries/merge_layers_entry";
import CloneLayerEntry from "./history/entries/clone_layer_entry";
import PersistenceManager from "../persistence";
import Config from "./config";

import imgFacingIndicator from "/assets/images/facing-indicator.svg";
import ReplaceLayerMetadataEntry from "./history/entries/replace_layer_metadata_entry";
import UpdateLayerAttributionEntry from "./history/entries/update_layer_attribution_entry";
import PersistLayerChangesEntry from "./history/entries/persist_layers_entry";

const FORMAT = -1;

const CONFIG_VALUES = {
  variant: {default: "classic", persistence: true},
  partVisibility: {
    default: {
      head: true,
      arm_left: true,
      torso: true,
      arm_right: true,
      leg_left: true,
      leg_right: true,
    },
    persistence: true
  },
  baseVisible: {default: true, persistence: true},
  overlayVisible: {default: false, persistence: true},
  baseGridVisible: {default: true, persistence: true},
  overlayGridVisible: {default: true, persistence: true},
  cullBackFace: {default: true, persistence: true},
}

class Editor extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      cursor: grab;
    }
  `;

  constructor() {
    super();
    this.persistence = new PersistenceManager("ncrs-editor");
    this.persistence.setDefault("format", FORMAT);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.clientWidth / this.clientHeight);
    this.renderer = new Renderer(this.scene, this.camera);
    this.controls = new Controls(this);
    this.layers = new Layers(IMAGE_WIDTH, IMAGE_HEIGHT);
    this.history = new HistoryManager();
    this.config = new Config("ncrs-editor-config", CONFIG_VALUES);
    this.toolConfig = new ToolConfig();
    this.tools = this._setupTools();
    this.currentTool = this.tools[0];

    this._loadSkin();
    this._setupMesh(this.layers.texture);
    this._startRender();
    this._setupResizeObserver();
    this._setupEvents();
  }

  skinMesh;
  baseGroup;
  model;

  render() {
    this.camera.layers.enable(1);
    this.camera.layers.enable(2);

    return this.renderer.canvas();
  }

  firstUpdated() {
    this.updateVisibility();

    const toolId = this.persistence.get("selectedTool", undefined);
    const tool = this.tools.find(tool => tool.properties.id == toolId);

    this.selectTool(tool || this.tools[0]);
  }

  sceneRender() {
    this.renderer.render();
    this.style.cursor = this.controls.getCursorStyle();

    this.dispatchEvent(new CustomEvent("render"));
  }

  centerModel() {
    const orbit = this.controls.orbit;

    const bounds = new THREE.Box3();
    bounds.setFromObject(this.skinMesh);

    const size = new THREE.Vector3();
    bounds.getSize(size);

    this.skinMesh.position.y = size.y / 3;

    orbit.saveState();
    orbit.reset();
  }

  toolCheck(parts, pointerEvent) {
    const layer = this.layers.getSelectedLayer();
    if (!layer?.visible) {
      return false;
    }

    if (this.config.get("pick-color", false)) {
      const toolData = this._createSkinToolData(parts, pointerEvent.buttons);
      this._pickColor(toolData);
      if (this.currentTool == this.tools[1]) {
        this.selectTool(this.tools[0]);
      }
      return false;
    }

    return true;
  }

  toolDown(parts, pointerEvent) {
    const toolData = this._createLayerToolData(parts, pointerEvent.buttons);
    const texture = this.currentTool.down(toolData);

    const layer = this.layers.getSelectedLayer();
    layer.flush();
    layer.replaceTexture(texture);
    this.layers.renderTexture();

    this.dispatchEvent(new CustomEvent("tool-down"));
  }

  toolMove(parts, pointerEvent) {
    const toolData = this._createLayerToolData(parts, pointerEvent.buttons);
    const texture = this.currentTool.move(toolData);

    this.layers.getSelectedLayer().replaceTexture(texture);
    this.layers.renderTextureCached();

    this.dispatchEvent(new CustomEvent("tool-move"));
  }

  toolUp() {
    this.currentTool.up();
    const layer = this.layers.getSelectedLayer();

    this.history.add(new UpdateLayerTextureEntry(this.layers, layer, layer.texture));

    this.dispatchEvent(new CustomEvent("tool-up"));
  }

  zoom(zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  setPartVisible(name, visible) {
    const partVisibility = this.config.get("partVisibility", {});
    partVisibility[name] = visible;
    this.config.set("partVisibility", partVisibility, true);

    this.updatePartsVisibility();
  }

  updatePartsVisibility() {
    const partVisibility = this.config.get("partVisibility", {});

    this.model.parts.forEach((part) => {
      if (Object.keys(partVisibility).includes(part.name())) {
        part.setVisible(partVisibility[part.name()]);
      }
    });
  }

  setBaseVisible(visible) {
    this.config.set("baseVisible", visible);
    this.updateVisibility();
  }

  setOverlayVisible(visible) {
    this.config.set("overlayVisible", visible);
    this.updateVisibility();
  }

  setBaseGridVisible(visible) {
    this.config.set("baseGridVisible", visible);
    this.updateVisibility();
  }

  setOverlayGridVisible(visible) {
    this.config.set("overlayGridVisible", visible);
    this.updateVisibility();
  }

  updateVisibility() {
    const baseVisible = this.config.get("baseVisible");
    const overlayVisible = this.config.get("overlayVisible");
    const baseGridVisible = this.config.get("baseGridVisible");
    const overlayGridVisible = this.config.get("overlayGridVisible");

    if (baseVisible) {
      this.camera.layers.enable(1);
    } else {
      this.camera.layers.disable(1);
    }

    if (overlayVisible) {
      this.camera.layers.enable(2);
    } else {
      this.camera.layers.disable(2);
    }

    this.model.baseGrid.visible = baseGridVisible && baseVisible;
    this.model.overlayGrid.visible = overlayGridVisible && overlayVisible;
  }

  selectTool(tool) {
    if (!this.tools.includes(tool)) { return false; }

    this.currentTool = tool;
    this.persistence.set("selectedTool", tool.properties.id);
    this.dispatchEvent(new CustomEvent("select-tool", {detail: {tool: tool}}));
  }

  selectLayer(layer) {
    this.history.add(
      new SelectLayerEntry(this.layers, {layer})
    )
  }

  addLayer(optionalLayer = undefined, setMetadata = {}) {
    const layer = optionalLayer || this.layers.createBlank();

    this.history.add(
      new GroupedEntry(
        new AddLayerEntry(this.layers, {layer}),
        new ReplaceLayerMetadataEntry(layer, setMetadata),
        new SelectLayerEntry(this.layers, {layer})
      )
    );
  }

  addCanvasLayer(canvas, setMetadata = {}) {
    const layer = this.layers.createFromCanvas(canvas);
    this.addLayer(layer, setMetadata);
  }

  addLayerFromImage(image, setMetadata = undefined) {
    const currentLayer = this.layers.getSelectedLayer();
    const texture = new THREE.Texture(image);

    if (currentLayer.isBlank()) {
      if (setMetadata) {
        this.history.add(
          new GroupedEntry(
            new UpdateLayerTextureEntry(this.layers, currentLayer, texture),
            new ReplaceLayerMetadataEntry(currentLayer, setMetadata),
            new PersistLayerChangesEntry(this.persistence, this.layers),
          )
        );
      } else {
        this.history.add(
          new GroupedEntry(
            new UpdateLayerTextureEntry(this.layers, currentLayer, texture),
            new UpdateLayerAttributionEntry(currentLayer),
            new PersistLayerChangesEntry(this.persistence, this.layers),
          )
        );
      }

      return currentLayer;
    } else {
      const layer = this.layers.createFromTexture(texture);
      this.addLayer(layer, setMetadata);

      return layer;
    }
  }

  addLayerFromImageURL(url, setMetadata = undefined) {
    const img = new Image();

    img.onload = () => {
      this.addLayerFromImage(img, setMetadata);
    }

    img.src = url;
  }

  addLayerFromFile(file, setMetadata = undefined) {
    const reader = new FileReader();

    reader.onload = () => {
      this.addLayerFromImageURL(reader.result, setMetadata);
    }

    reader.readAsDataURL(file);
  }

  removeLayer() {
    const layers = this.layers;
    const layer = this.layers.getSelectedLayer();
    let entry;

    if (layers.layers.length == 1) {
      entry = new GroupedEntry(
        new DeleteLayerEntry(layers, layer),
        new AddLayerEntry(layers),
        new SelectLayerEntry(layers, {index: 0})
      );
    } else {
      entry = new GroupedEntry(
        new DeleteLayerEntry(layers, layer),
      );
    }

    this.history.add(entry);
  }

  cloneLayer() {
    this.history.add(
      new CloneLayerEntry(this.layers, this.layers.getSelectedLayer())
    );
  }

  mergeLayer() {
    const layers = this.layers;

    if (layers.selectedLayerIndex < 1) { return false; }
    const source = layers.getSelectedLayer();
    const target = layers.getLayerAtIndex(layers.selectedLayerIndex - 1);

    this.history.add(
      new MergeLayersEntry(this.layers, target, source)
    );
  }

  reorderLayers(fromIndex, toIndex) {
    if (fromIndex === toIndex) { return; }
    
    this.history.add(
      new ReorderLayersEntry(this.layers, fromIndex, toIndex)
    );
  }

  forEachLayer(callback) {
    this.layers.layers.forEach(callback);
  }

  renderLayers() {
    this.layers.renderTexture();
  }

  easterEgg(input) {
    if (input == "#MOXVALLIX") {
      this.baseGroup.rotateX(Math.PI);
      this.baseGroup.rotateY(Math.PI);
    }
  }

  setVariant(variant) {
    if (!SkinModel.isValidVariant(variant)) { return false; }

    const yPos = this.skinMesh.position.y;
    const r = this.baseGroup.rotation.clone();

    this.config.set("variant", variant);

    this.model = new SkinModel(this.layers.texture, this.config.get("variant"));
    this.skinMesh = this.model.mesh;

    this.scene.remove(this.baseGroup);
    this.baseGroup = this._setupBaseGroup(this.skinMesh);
    this.baseGroup.rotation.set(r.x, r.y, r.z);
    this.scene.add(this.baseGroup);

    this.skinMesh.position.y = yPos;

    this.updateVisibility();
    this.updatePartsVisibility();
  }

  skinToCanvas() {
    return this.layers.render();
  }

  skinToDataURL() {
    const canvas = document.createElement("canvas");
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.skinToCanvas(), 0, 0);

    return canvas.toDataURL();
  }

  resetCamera() {
    this.controls.orbit.reset();

    this.camera.position.set(0, 0, 3);
    this.baseGroup.rotation.set(0, 0, 0);
    this.zoom(0.45);
  }

  _pickColor(toolData) {
    const point = toolData.getCoords();
    let color = toolData.texture.getPixel({ x: point.x, y: point.y });

    if (color.alpha() <= 0 && toolData.hasOverlay()) {
      const point2 = toolData.getCoords(1);
      color = toolData.texture.getPixel({ x: point2.x, y: point2.y });
    }
    
    if (this.config.get("pick-color-toggle")) {
      setTimeout(() => {
        this.config.set("pick-color-toggle", false);
        this.config.set("pick-color", false);
      }, 100)
    }

    this.toolConfig.set("color", color);
  }

  _createLayerToolData(parts, button) {
    const layer = this.layers.getSelectedLayer();
    const texture = layer.texture.image;

    return new ToolData({ texture, parts, button, variant: this.config.get("variant") });
  }

  _createSkinToolData(parts, button) {
    const texture = this.layers.render();

    return new ToolData({ texture, parts, button, variant: this.config.get("variant") });
  }

  _setupResizeObserver() {
    const obs = new ResizeObserver((e) => {
      const target = e[0].target;
      this.renderer.updateSize(target.clientWidth, target.clientHeight);

      this.camera.aspect = target.clientWidth / target.clientHeight;
      this.camera.updateProjectionMatrix();
    });
    obs.observe(this);
  }

  _loadSkin() {
    const layerData = this.persistence.get("layers", []);
    if (layerData.length > 0) {
      this._loadSkinFromData(layerData);
    } else {
      this._loadDefaultSkin();
    }    
  }

  _loadSkinFromData(layerData) {
    layerData.forEach(data => {
      const layer = this.layers.deserializeLayer(data);
      this.layers.addLayer(layer);
    });
  }

  _loadDefaultSkin() {
    this.layers.addBlankLayer();
    this.layers.selectLayer(0);
  }

  _createIndicatorMesh() {
    const size = 0.25;
    const yPos = -2.175; // + Up / - Down
    const zPos = 0.6; // + Forward / - Backward

    const geometry = new THREE.PlaneGeometry(size, size);
    const texture = new THREE.TextureLoader().load(imgFacingIndicator, newTexture => {
      newTexture.magFilter = THREE.NearestFilter;
      newTexture.minFilter = THREE.NearestFilter;
    })

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yPos;
    mesh.position.z = zPos;
    mesh.rotateX(Math.PI / 2);

    return mesh;
  }

  _setupMesh(texture) {
    this.model = new SkinModel(texture, this.config.get("variant", "classic"));

    if (!this.config.get("cullBackFace", true)) {
      this.model.setMaterialSide(THREE.DoubleSide);
    }

    this.skinMesh = this.model.mesh;
    this.baseGroup = this._setupBaseGroup(this.skinMesh);
    this.scene.add(this.baseGroup);

    this.updatePartsVisibility();
  }

  _setupBaseGroup(mesh) {
    const group = new THREE.Group();
    group.add(mesh);
    group.add(this._createIndicatorMesh());

    return group;
  }

  _startRender() {
    this.resetCamera();
    this.centerModel();

    this.renderer.setAnimationLoop(() => {
      this.sceneRender();
    });
  }

  _setupTools() {
    return [
      new PenTool(this.toolConfig),
      new EraseTool(this.toolConfig),
      new BucketTool(this.toolConfig),
      // new ShadeTool(this.toolConfig),
      // new SculptTool(this.toolConfig),
    ]
  }

  _setupEvents() {
    const persistenceListeners = ["layers-update", "layers-render", "layers-select"];
    persistenceListeners.forEach(listener => {
      this.layers.addEventListener(listener, () => {
        new PersistLayerChangesEntry(this.persistence, this.layers).perform();
      })
    });

    this.config.addEventListener("cullBackFace-change", event => {
      this.model.setMaterialSide(event.detail ? THREE.FrontSide : THREE.DoubleSide);
    })
  }
}

customElements.define("ncrs-editor", Editor);

export default Editor;
