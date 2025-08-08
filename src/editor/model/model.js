import * as THREE from "three";
import { HeadPart } from "./parts/head";
import { TorsoPart } from "./parts/torso";
import { LeftLegPart } from "./parts/leg_left";
import { RightLegPart } from "./parts/leg_right";
import { RightArmPart } from "./parts/arm_right";
import { LeftArmPart } from "./parts/arm_left";

class SkinModel {
  static variants = ["classic", "slim"]

  static isValidVariant(variant) {
    return this.variants.includes(variant);
  }

  constructor(texture, variant = "classic") {
    this._setupMesh(texture, variant);
    this.mesh = new THREE.Group();
    this.mesh.add(this.baseMesh);
    this.mesh.add(this.baseGrid);
    this.mesh.add(this.overlayMesh);
    this.mesh.add(this.overlayGrid);
  }
  
  parts = [];
  baseMesh;
  baseGrid;
  overlayMesh;
  overlayGrid;
  mesh;

  updateMaterials(callback) {
    this.parts.forEach(part => {
      const baseMaterial = part.baseMesh.material;
      const overlayMaterial = part.overlayMesh.material;

      callback(baseMaterial);
      callback(overlayMaterial);
    })
  }

  setMaterialSide(side = THREE.DoubleSide) {
    this.updateMaterials(material => {
      material.side = side;
    })
  }

  _setupMesh(texture, variant) {
    if (!SkinModel.variants.includes(variant)) {
      throw "Invalid variant"
    }

    const scope = this;
    this.baseMesh = new THREE.Group();
    this.baseGrid = new THREE.Group();

    this.overlayMesh = new THREE.Group();
    this.overlayGrid = new THREE.Group();

    function addBase(part) {
      scope.baseMesh.add(part.baseMesh);
      scope.baseGrid.add(...part.baseGrid.grids);
    }

    function addOverlay(part) {
      scope.overlayMesh.add(part.overlayMesh);
      scope.overlayGrid.add(...part.overlayGrid.grids);
    }

    const head = new HeadPart(texture, variant);
    const torso = new TorsoPart(texture, variant);
    const leftLeg = new LeftLegPart(texture, variant);
    const rightLeg = new RightLegPart(texture, variant);
    const leftArm = new LeftArmPart(texture, variant);
    const rightArm = new RightArmPart(texture, variant);

    const parts = [head, torso, leftLeg, rightLeg, leftArm, rightArm];

    parts.forEach(part => {
      scope.parts.push(part);
      addBase(part);
    });

    parts.forEach(part => {
      addOverlay(part);
    });
  }
}

export { SkinModel };
