// Custom implementation of the GridHelper made for custom width and height/ divisions x and y
import * as THREE from "three";

const DEFAULT_GRID_COLOR = new THREE.Color("#575757");

class SkinGrid extends THREE.LineSegments {
  constructor(sw, sh, width, height, gridColor = DEFAULT_GRID_COLOR) {
    gridColor = new THREE.Color(gridColor);

    const halfSizeX = sw / 2;
    const halfSizeY = sh / 2;

    const vertices = [];
    const colors = [];

    let j = 0;

    const xstep = sw / width;
    for (let x = 0; x <= sw; x += xstep) {
      vertices.push(x - halfSizeX, 0, -halfSizeY);
      vertices.push(x - halfSizeX, 0, halfSizeY);

      const color = gridColor;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
    }

    const ystep = sh / height;
    for (let y = 0; y <= sh; y += ystep) {
      vertices.push(-halfSizeX, 0, y - halfSizeY);
      vertices.push(halfSizeX, 0, y - halfSizeY);

      const color = gridColor;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      toneMapped: false,
      transparent: true,
      opacity: 0.6,
    });

    super(geometry, material);

    this.type = "GridHelper";
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

class SkinGridBox {
  constructor(boxSize, boxDim, epsilon, color = DEFAULT_GRID_COLOR) {
    this.grids = [];
    this.visible = true;

    var gridHelper = new SkinGrid(boxSize.x, boxSize.y, boxDim.x, boxDim.y, color);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.position.z += boxSize.z / 2 + epsilon;
    this.grids.push(gridHelper);
    // back
    gridHelper = new SkinGrid(boxSize.x, boxSize.y, boxDim.x, boxDim.y, color);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.position.z -= boxSize.z / 2 + epsilon;
    this.grids.push(gridHelper);
    // left
    gridHelper = new SkinGrid(boxSize.z, boxSize.y, boxDim.z, boxDim.y, color);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.rotation.z = THREE.MathUtils.degToRad(90);
    gridHelper.position.x -= boxSize.x / 2 + epsilon;
    this.grids.push(gridHelper);
    // right
    gridHelper = new SkinGrid(boxSize.z, boxSize.y, boxDim.z, boxDim.y, color);
    gridHelper.rotation.x = THREE.MathUtils.degToRad(90);
    gridHelper.rotation.z = THREE.MathUtils.degToRad(90);
    gridHelper.position.x += boxSize.x / 2 + epsilon;
    this.grids.push(gridHelper);
    // bottom
    gridHelper = new SkinGrid(boxSize.x, boxSize.z, boxDim.x, boxDim.z, color);
    gridHelper.position.y -= boxSize.y / 2 + epsilon;
    this.grids.push(gridHelper);
    // top
    gridHelper = new SkinGrid(boxSize.x, boxSize.z, boxDim.x, boxDim.z, color);
    gridHelper.position.y += boxSize.y / 2 + epsilon;
    this.grids.push(gridHelper);
  }

  Visible = (status) => {
    this.visible = status;
    for (let i = 0; i < this.grids.length; ++i) {
      this.grids[i].visible = status;
    }
  };

  toggleVisible = () => {
    this.visible = !this.visible;
    this.Visible(this.visible);
  };

  dispose() {
    for (let i = 0; i < grids.length; ++i) {
      grids[i].dispose();
    }
  }
}

export { SkinGrid, SkinGridBox };
