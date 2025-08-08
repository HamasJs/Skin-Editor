import Color from "color";
import { BaseTool } from "../base_tool";

const TRANSPARENT_COLOR = new Color("#000000").alpha(0);

class BucketTool extends BaseTool {
  constructor(config) {
    super(config, {
      id: "bucket",
      icon: "bucket",
      name: "Paint Bucket [G]",
      description: "Simple tool for filling large closed areas with a specific color.\nUse the left mouse button to fill, and the right mouse button to erase.",
      providesColor: true, // Whether or not drawing with this tool adds to recent colors.
    });
  }

  cursor = { x: 0, y: 0 };
  replaceColor = false;
  lastPart;
  lastFace;

  down(toolData) {
    const texture = toolData.texture;
    const point = toolData.getCoords();
    const color = toolData.button == 1 ? this.config.getColor.bind(this.config) : () => TRANSPARENT_COLOR;
    const old_color = toolData.texture.getPixel({ x: point.x, y: point.y });

    this.replaceColor = this.config.get("replaceColor");

    this.cursor = point;
    if (!this.replaceColor) {
      if (this.isInArea(point,0,8,31,15)||this.isInArea(point,8,0,23,7)) {
        this.draw_head_inner(texture, point, color, old_color);
      }
      if (this.isInArea(point,32,8,63,15)||this.isInArea(point,40,0,55,7)) {
        this.draw_head_outer(texture, point, color, old_color);
      }
      if (this.isInArea(point,20,16,35,19)||this.isInArea(point,16,20,39,31)) {
        this.draw_torso_inner(texture, point, color, old_color);
      }
      if (this.isInArea(point,20,32,35,35)||this.isInArea(point,16,36,39,47)) {
        this.draw_torso_outer(texture, point, color, old_color);
      }

      if (toolData.variant=='classic'&&(this.isInArea(point,44,16,51,19)||this.isInArea(point,40,20,55,31))) {
        this.draw_right_arm_inner_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,44,32,51,35)||this.isInArea(point,40,36,55,47))) {
        this.draw_right_arm_outer_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,36,48,43,51)||this.isInArea(point,32,52,47,63))) {
        this.draw_left_arm_inner_classic(texture, point, color, old_color);
      }
      if (toolData.variant=='classic'&&(this.isInArea(point,52,48,59,51)||this.isInArea(point,48,52,63,63))) {
        this.draw_left_arm_outer_classic(texture, point, color, old_color);
      }

      if (toolData.variant=='slim'&&(this.isInArea(point,44,16,49,19)||this.isInArea(point,40,20,53,31))) {
        this.draw_right_arm_inner_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,44,32,49,35)||this.isInArea(point,40,36,53,47))) {
        this.draw_right_arm_outer_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,36,48,41,51)||this.isInArea(point,32,52,45,63))) {
        this.draw_left_arm_inner_slim(texture, point, color, old_color);
      }
      if (toolData.variant=='slim'&&(this.isInArea(point,52,48,57,51)||this.isInArea(point,48,52,61,63))) {
        this.draw_left_arm_outer_slim(texture, point, color, old_color);
      }

      if ((this.isInArea(point,4,16,11,19)||this.isInArea(point,0,20,15,31))) {
        this.draw_right_leg_inner(texture, point, color, old_color);
      }
      if ((this.isInArea(point,4,32,11,35)||this.isInArea(point,0,36,15,47))) {
        this.draw_right_leg_outer(texture, point, color, old_color);
      }
      if ((this.isInArea(point,20,48,27,61)||this.isInArea(point,16,52,31,63))) {
        this.draw_left_leg_inner(texture, point, color, old_color);
      }
      if ((this.isInArea(point,4,48,11,61)||this.isInArea(point,0,52,15,63))) {
        this.draw_left_leg_outer(texture, point, color, old_color);
      }
    } else {
        this.draw_replace_color(texture, color, old_color);
    }

    return texture.toTexture();
  }

  move(toolData) {
    const texture = toolData.texture;
    return texture.toTexture();
  }

  up() {}

  // draw(texture, point, color, old_color) {
  //   const queue = [point];
  //   const visited = new Set();
  //   const width = texture.width;
  //   const height = texture.height;

  //   for (let i = 0; i<24; i++) {
  //     let queue_length = queue.length;
  //     for (let j = 0; j < queue_length; j++) {
  //       const { x, y } = queue[j];
  //       if (x < 0 || y < 0 || x >= width || y >= height) continue;
  //       if (visited.has(`${x},${y}`)) continue;
  //       visited.add(`${x},${y}`);
  //       if (x+1<=64&&this.colorsMatch(texture.getPixel({ x: x + 1, y }), old_color)&&!queue.includes({ x: x + 1, y })) {
  //         queue.push({ x: x + 1, y });
  //       }
  //       if (x-1>=0&&this.colorsMatch(texture.getPixel({ x: x - 1, y }), old_color)&&!queue.includes({ x: x - 1, y })) {
  //         queue.push({ x: x - 1, y });
  //       }
  //       if (y+1<=64&&this.colorsMatch(texture.getPixel({ x, y: y + 1 }), old_color)&&!queue.includes({ x, y: y + 1 })) {
  //         queue.push({ x, y: y + 1 });
  //       }
  //       if (y-1>=0&&this.colorsMatch(texture.getPixel({ x, y: y - 1 }), old_color)&&!queue.includes({ x, y: y - 1 })) {
  //         queue.push({ x, y: y - 1 });
  //       }
  //     }
  //   }
  //   for (let i = 0; i < queue.length; i++) {
  //     texture.putPixel({ x:queue[i].x, y:queue[i].y }, color);
  //   }
  // }

  draw_replace_color(texture, color, old_color){
    const width = 64;
    const height = 64;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.colorsMatch(texture.getPixel({ x, y }), old_color) && (((x+8)%32>=16&&y>=0&&y<=7) || (y>=8&&y<=15) || (x>=4&&x<=11&&y>=16) || (x>=20&&x<=35&&y>=16&&y<=35) || (x>=44&&x<=51&&y>=16&&y<=35) || (x>=0&&x<=55&&y>=20&&y<=31) || (x>=0&&x<=55&&y>=36&&y<=47) || ((x+4)%16>=8&&y>=48) || y>=52 )) {
          texture.putPixel({ x, y }, color());
        }
      }
    }
  }

  draw_head_inner(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<384; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==15&&y>=0&&y<=7)||(x==23&&y>=0&&y<=7)||(x==31&&y>=8&&y<=15)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==8&&y>=0&&y<=7)||(x==16&&y>=0&&y<=7)||(x==0&&y>=8&&y<=15)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==7&&x>=16&&x<=23)||(y==15&&x>=0&&x<=31)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==0&&x>=8&&x<=23)||(y==8&&x>=0&&x<=7)||(y==8&&x>=16&&x<=31)), { x, y: y - 1 },texture,old_color,queue);

        // Left-Right UV
        this.UV(x==0&&y>=8&&y<=15, { x: 31, y },texture,old_color,queue);
        this.UV(x==31&&y>=8&&y<=15, { x: 0, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=0&&x<=7&&y==8, { x: 8, y: x },texture,old_color,queue);
        this.UV(y>=0&&y<=7&&x==8, { x: y, y: 8 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=16&&x<=23&&y==8, { x: 15, y: 23-x },texture,old_color,queue);
        this.UV(y>=0&&y<=8&&x==15, { x: 23-y, y: 8 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==8&&x>=24&&x<=31, { x: 39-x, y: 0 },texture,old_color,queue);
        this.UV(y==0&&x>=8&&x<=15, { x: 39-x, y: 8 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==15&&x>=0&&x<=7, { x: 16, y: x },texture,old_color,queue);
        this.UV(x==16&&y>=0&&y<=7, { x: y, y: 15 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==15&&x>=8&&x<=15, { x: x+8, y: 7 },texture,old_color,queue);
        this.UV(y==7&&x>=16&&x<=23, { x: x-8, y: 15 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==15&&x>=16&&x<=23, { x: 23, y: 23-x },texture,old_color,queue);
        this.UV(x==23&&y>=0&&y<=7, { x: 23-y, y: 15 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==15&&x>=24&&x<=31, { x: 47-x, y: 0 },texture,old_color,queue);
        this.UV(y==0&&x>=16&&x<=23, { x: 47-x, y: 15 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_head_outer(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<384; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==47&&y>=0&&y<=7)||(x==55&&y>=0&&y<=7)||(x==63&&y>=8&&y<=15)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==40&&y>=0&&y<=7)||(x==48&&y>=0&&y<=7)||(x==32&&y>=8&&y<=15)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==7&&x>=48&&x<=55)||(y==15&&x>=32&&x<=63)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==0&&x>=40&&x<=55)||(y==8&&x>=32&&x<=39)||(y==8&&x>=48&&x<=63)), { x, y: y - 1 },texture,old_color,queue);

        // Left-Right UV
        this.UV(x==32&&y>=8&&y<=15, { x: 63, y },texture,old_color,queue);
        this.UV(x==63&&y>=8&&y<=15, { x: 32, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=32&&x<=39&&y==8, { x: 40, y: x-32 },texture,old_color,queue);
        this.UV(y>=0&&y<=7&&x==40, { x: y+32, y: 8 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=48&&x<=55&&y==8, { x: 47, y: 55-x },texture,old_color,queue);
        this.UV(y>=0&&y<=8&&x==47, { x: 55-y, y: 8 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==8&&x>=56&&x<=63, { x: 103-x, y: 0 },texture,old_color,queue);
        this.UV(y==0&&x>=40&&x<=47, { x: 103-x, y: 8 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==15&&x>=32&&x<=39, { x: 48, y: x-32 },texture,old_color,queue);
        this.UV(x==48&&y>=0&&y<=7, { x: y+32, y: 15 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==15&&x>=40&&x<=47, { x: x+8, y: 7 },texture,old_color,queue);
        this.UV(y==7&&x>=48&&x<=55, { x: x-8, y: 15 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==15&&x>=48&&x<=55, { x: 55, y: 55-x },texture,old_color,queue);
        this.UV(x==55&&y>=0&&y<=7, { x: 55-y, y: 15 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==15&&x>=56&&x<=63, { x: 111-x, y: 0 },texture,old_color,queue);
        this.UV(y==0&&x>=48&&x<=55, { x: 111-x, y: 15 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_torso_inner(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<313; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==27&&y>=16&&y<=19)||(x==35&&y>=16&&y<=19)||(x==39&&y>=20&&y<=31)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==16&&y>=20&&y<=31)||(x==20&&y>=16&&y<=19)||(x==28&&y>=16&&y<=19)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==19&&x>=28&&x<=35)||(y==31&&x>=16&&x<=39)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==20&&x>=16&&x<=19)||(y==16&&x>=20&&x<=35)||(y==20&&x>=28&&x<=39)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==16&&y>=20&&y<=31, { x: 39, y },texture,old_color,queue);
        this.UV(x==39&&y>=20&&y<=31, { x: 16, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=16&&x<=19&&y==20, { x: 20, y: x },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==20, { x: y, y: 20 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=28&&x<=31&&y==20, { x: 27, y: 47-x },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==27, { x: 47-y, y: 20 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==20&&x>=32&&x<=39, { x: 59-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=20&&x<=27, { x: 59-x, y: 20 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==31&&x>=16&&x<=19, { x: 28, y: x },texture,old_color,queue);
        this.UV(x==28&&y>=16&&y<=19, { x: y, y: 31 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==31&&x>=20&&x<=27, { x: x+8, y: 19 },texture,old_color,queue);
        this.UV(y==19&&x>=28&&x<=35, { x: x-8, y: 31 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==31&&x>=28&&x<=31, { x: 35, y: 47-x },texture,old_color,queue);
        this.UV(x==35&&y>=16&&y<=19, { x: 47-y, y: 31 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==31&&x>=32&&x<=39, { x: 67-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=28&&x<=35, { x: 67-x, y: 31 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_torso_outer(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<313; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==27&&y>=32&&y<=35)||(x==35&&y>=32&&y<=35)||(x==39&&y>=36&&y<=47)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==16&&y>=36&&y<=47)||(x==20&&y>=32&&y<=35)||(x==28&&y>=32&&y<=35)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==35&&x>=28&&x<=35)||(y==47&&x>=16&&x<=39)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==36&&x>=16&&x<=19)||(y==32&&x>=20&&x<=35)||(y==36&&x>=28&&x<=39)), { x, y: y - 1 },texture,old_color,queue);

        // Left-Right UV
        this.UV(x==16&&y>=36&&y<=47, { x: 39, y },texture,old_color,queue);
        this.UV(x==39&&y>=36&&y<=47, { x: 16, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=16&&x<=19&&y==36, { x: 20, y: x+16 },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==20, { x: y-16, y: 36 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=28&&x<=31&&y==36, { x: 27, y: 63-x },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==27, { x: 63-y, y: 36 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==36&&x>=32&&x<=39, { x: 59-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=20&&x<=27, { x: 59-x, y: 36 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==47&&x>=16&&x<=19, { x: 28, y: x+16 },texture,old_color,queue);
        this.UV(x==28&&y>=32&&y<=35, { x: y-16, y: 47 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==47&&x>=20&&x<=27, { x: x+8, y: 35 },texture,old_color,queue);
        this.UV(y==35&&x>=28&&x<=35, { x: x-8, y: 47 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==47&&x>=28&&x<=31, { x: 35, y: 63-x },texture,old_color,queue);
        this.UV(x==35&&y>=32&&y<=35, { x: 63-y, y: 47 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==47&&x>=32&&x<=39, { x: 67-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=28&&x<=35, { x: 67-x, y: 47 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_arm_inner_classic(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==47&&y>=16&&y<=19)||(x==51&&y>=16&&y<=19)||(x==55&&y>=20&&y<=31)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==40&&y>=20&&y<=31)||(x==44&&y>=16&&y<=19)||(x==48&&y>=16&&y<=19)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==19&&x>=48&&x<=51)||(y==31&&x>=40&&x<=55)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==20&&x>=40&&x<=43)||(y==16&&x>=44&&x<=51)||(y==20&&x>=48&&x<=55)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==40&&y>=20&&y<=31, { x: 55, y },texture,old_color,queue);
        this.UV(x==55&&y>=20&&y<=31, { x: 40, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=40&&x<=43&&y==20, { x: 44, y: x-24 },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==44, { x: y+24, y: 20 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=48&&x<=51&&y==20, { x: 47, y: 67-x },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==47, { x: 67-y, y: 20 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==20&&x>=52&&x<=55, { x: 99-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=44&&x<=47, { x: 99-x, y: 20 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==31&&x>=40&&x<=43, { x: 48, y: x-24 },texture,old_color,queue);
        this.UV(x==48&&y>=16&&y<=19, { x: y+24, y: 31 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==31&&x>=44&&x<=47, { x: x+4, y: 19 },texture,old_color,queue);
        this.UV(y==19&&x>=48&&x<=51, { x: x-4, y: 31 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==31&&x>=48&&x<=51, { x: 51, y: 67-x },texture,old_color,queue);
        this.UV(x==51&&y>=16&&y<=19, { x: 67-y, y: 31 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==31&&x>=52&&x<=55, { x: 103-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=48&&x<=51, { x: 103-x, y: 31 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_arm_outer_classic(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==47&&y>=32&&y<=35)||(x==51&&y>=32&&y<=35)||(x==55&&y>=36&&y<=47)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==40&&y>=36&&y<=47)||(x==44&&y>=32&&y<=35)||(x==48&&y>=32&&y<=35)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==35&&x>=48&&x<=51)||(y==47&&x>=40&&x<=55)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==36&&x>=40&&x<=43)||(y==32&&x>=44&&x<=51)||(y==36&&x>=48&&x<=55)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==40&&y>=36&&y<=47, { x: 55, y },texture,old_color,queue);
        this.UV(x==55&&y>=36&&y<=47, { x: 40, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=40&&x<=43&&y==36, { x: 44, y: x-8 },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==44, { x: y+8, y: 36 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=48&&x<=51&&y==36, { x: 47, y: 83-x },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==47, { x: 83-y, y: 36 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==36&&x>=52&&x<=55, { x: 99-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=44&&x<=47, { x: 99-x, y: 36 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==47&&x>=40&&x<=43, { x: 48, y: x-8 },texture,old_color,queue);
        this.UV(x==48&&y>=32&&y<=35, { x: y+8, y: 47 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==47&&x>=44&&x<=47, { x: x+4, y: 35 },texture,old_color,queue);
        this.UV(y==35&&x>=48&&x<=51, { x: x-4, y: 47 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==47&&x>=48&&x<=51, { x: 51, y: 83-x },texture,old_color,queue);
        this.UV(x==51&&y>=32&&y<=35, { x: 83-y, y: 47 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==47&&x>=52&&x<=55, { x: 103-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=48&&x<=51, { x: 103-x, y: 47 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_arm_inner_classic(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==39&&y>=48&&y<=51)||(x==43&&y>=48&&y<=51)||(x==47&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==32&&y>=52&&y<=63)||(x==36&&y>=48&&y<=51)||(x==40&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=40&&x<=43)||(y==63&&x>=32&&x<=47)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=32&&x<=35)||(y==48&&x>=36&&x<=43)||(y==52&&x>=40&&x<=47)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==32&&y>=52&&y<=63, { x: 47, y },texture,old_color,queue);
        this.UV(x==47&&y>=52&&y<=63, { x: 32, y },texture,old_color,queue);
        // // 1st Top UV
        this.UV(x>=32&&x<=35&&y==52, { x: 36, y: x+16 },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==36, { x: y-16, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=40&&x<=43&&y==52, { x: 39, y: 91-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==39, { x: 91-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=44&&x<=47, { x: 83-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=36&&x<=39, { x: 83-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=32&&x<=35, { x: 40, y: x+16 },texture,old_color,queue);
        this.UV(x==40&&y>=48&&y<=51, { x: y-16, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=36&&x<=39, { x: x+4, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=40&&x<=43, { x: x-4, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=40&&x<=43, { x: 43, y: 91-x },texture,old_color,queue);
        this.UV(x==43&&y>=48&&y<=51, { x: 91-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=44&&x<=47, { x: 87-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=40&&x<=43, { x: 87-x, y: 63 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_arm_outer_classic(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==55&&y>=48&&y<=51)||(x==59&&y>=48&&y<=51)||(x==63&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==48&&y>=52&&y<=63)||(x==52&&y>=48&&y<=51)||(x==56&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=56&&x<=59)||(y==63&&x>=48&&x<=63)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=48&&x<=51)||(y==48&&x>=52&&x<=59)||(y==52&&x>=56&&x<=63)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==48&&y>=52&&y<=63, { x: 63, y },texture,old_color,queue);
        this.UV(x==63&&y>=52&&y<=63, { x: 48, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=48&&x<=51&&y==52, { x: 52, y: x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==52, { x: y, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=56&&x<=59&&y==52, { x: 55, y: 107-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==55, { x: 107-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=60&&x<=63, { x: 115-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=52&&x<=55, { x: 115-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=48&&x<=51, { x: 56, y: x },texture,old_color,queue);
        this.UV(x==56&&y>=48&&y<=51, { x: y, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=52&&x<=55, { x: x+4, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=56&&x<=59, { x: x-4, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=56&&x<=59, { x: 59, y: 107-x },texture,old_color,queue);
        this.UV(x==59&&y>=48&&y<=51, { x: 107-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=60&&x<=63, { x: 119-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=56&&x<=59, { x: 119-x, y: 63 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_arm_inner_slim(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<192; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==46&&y>=16&&y<=19)||(x==49&&y>=16&&y<=19)||(x==53&&y>=20&&y<=31)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==40&&y>=20&&y<=31)||(x==44&&y>=16&&y<=19)||(x==47&&y>=16&&y<=19)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==19&&x>=47&&x<=49)||(y==31&&x>=40&&x<=53)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==20&&x>=40&&x<=43)||(y==16&&x>=44&&x<=49)||(y==20&&x>=47&&x<=53)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==40&&y>=20&&y<=31, { x: 53, y },texture,old_color,queue);
        this.UV(x==53&&y>=20&&y<=31, { x: 40, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=40&&x<=43&&y==20, { x: 44, y: x-24 },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==44, { x: y+24, y: 20 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=47&&x<=49&&y==20, { x: 46, y: 66-x },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==46, { x: 66-y, y: 20 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==20&&x>=51&&x<=53, { x: 97-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=44&&x<=46, { x: 97-x, y: 20 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==31&&x>=40&&x<=43, { x: 47, y: x-24 },texture,old_color,queue);
        this.UV(x==47&&y>=16&&y<=19, { x: y+24, y: 31 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==31&&x>=44&&x<=46, { x: x+3, y: 19 },texture,old_color,queue);
        this.UV(y==19&&x>=47&&x<=49, { x: x-3, y: 31 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==31&&x>=47&&x<=50, { x: 49, y: 66-x },texture,old_color,queue);
        this.UV(x==49&&y>=16&&y<=19, { x: 66-y, y: 31 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==31&&x>=51&&x<=53, { x: 100-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=47&&x<=49, { x: 100-x, y: 31 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_arm_outer_slim(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<192; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==46&&y>=32&&y<=35)||(x==49&&y>=32&&y<=35)||(x==53&&y>=36&&y<=47)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==40&&y>=36&&y<=47)||(x==44&&y>=32&&y<=35)||(x==47&&y>=32&&y<=35)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==35&&x>=47&&x<=49)||(y==47&&x>=40&&x<=53)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==36&&x>=40&&x<=43)||(y==32&&x>=44&&x<=49)||(y==36&&x>=47&&x<=53)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==40&&y>=36&&y<=47, { x: 53, y },texture,old_color,queue);
        this.UV(x==53&&y>=36&&y<=47, { x: 40, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=40&&x<=43&&y==36, { x: 44, y: x-8 },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==44, { x: y+8, y: 36 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=47&&x<=49&&y==36, { x: 46, y: 82-x },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==46, { x: 82-y, y: 36 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==36&&x>=51&&x<=53, { x: 97-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=44&&x<=46, { x: 97-x, y: 36 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==47&&x>=40&&x<=43, { x: 47, y: x-8 },texture,old_color,queue);
        this.UV(x==47&&y>=32&&y<=35, { x: y+8, y: 47 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==47&&x>=44&&x<=46, { x: x+3, y: 35 },texture,old_color,queue);
        this.UV(y==35&&x>=47&&x<=49, { x: x-3, y: 47 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==47&&x>=47&&x<=50, { x: 49, y: 82-x },texture,old_color,queue);
        this.UV(x==49&&y>=32&&y<=35, { x: 82-y, y: 47 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==47&&x>=51&&x<=53, { x: 100-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=47&&x<=49, { x: 100-x, y: 47 },texture,old_color,queue);        

      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_arm_inner_slim(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<192; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==38&&y>=48&&y<=51)||(x==41&&y>=48&&y<=51)||(x==45&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==32&&y>=52&&y<=63)||(x==36&&y>=48&&y<=51)||(x==39&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=39&&x<=41)||(y==63&&x>=32&&x<=45)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=32&&x<=35)||(y==48&&x>=36&&x<=41)||(y==52&&x>=39&&x<=45)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==32&&y>=52&&y<=63, { x: 45, y },texture,old_color,queue);
        this.UV(x==45&&y>=52&&y<=63, { x: 32, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=32&&x<=35&&y==52, { x: 36, y: x+16 },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==36, { x: y-16, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=39&&x<=42&&y==52, { x: 38, y: 90-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==38, { x: 90-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=43&&x<=45, { x: 81-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=36&&x<=37, { x: 81-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=32&&x<=35, { x: 39, y: x+16 },texture,old_color,queue);
        this.UV(x==39&&y>=48&&y<=51, { x: y-16, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=36&&x<=38, { x: x+3, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=39&&x<=41, { x: x-3, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=39&&x<=42, { x: 41, y: 90-x },texture,old_color,queue);
        this.UV(x==41&&y>=48&&y<=51, { x: 90-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=43&&x<=45, { x: 84-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=39&&x<=41, { x: 84-x, y: 63 },texture,old_color,queue);

      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_arm_outer_slim(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<192; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==54&&y>=48&&y<=51)||(x==57&&y>=48&&y<=51)||(x==61&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==48&&y>=52&&y<=63)||(x==52&&y>=48&&y<=51)||(x==55&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=55&&x<=57)||(y==63&&x>=48&&x<=61)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=48&&x<=51)||(y==48&&x>=52&&x<=57)||(y==52&&x>=55&&x<=61)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==48&&y>=52&&y<=63, { x: 61, y },texture,old_color,queue);
        this.UV(x==61&&y>=52&&y<=63, { x: 48, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=48&&x<=51&&y==52, { x: 52, y: x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==52, { x: y, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=55&&x<=58&&y==52, { x: 54, y: 106-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==54, { x: 106-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=59&&x<=61, { x: 113-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=52&&x<=54, { x: 113-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=48&&x<=51, { x: 55, y: x },texture,old_color,queue);
        this.UV(x==55&&y>=48&&y<=51, { x: y, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=52&&x<=54, { x: x+3, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=55&&x<=57, { x: x-3, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=55&&x<=58, { x: 57, y: 106-x },texture,old_color,queue);
        this.UV(x==57&&y>=48&&y<=51, { x: 106-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=59&&x<=61, { x: 116-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=55&&x<=57, { x: 116-x, y: 63 },texture,old_color,queue);

      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_leg_inner(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==7&&y>=16&&y<=19)||(x==11&&y>=16&&y<=19)||(x==15&&y>=20&&y<=31)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==0&&y>=20&&y<=31)||(x==4&&y>=16&&y<=19)||(x==8&&y>=16&&y<=19)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==19&&x>=8&&x<=11)||(y==31&&x>=0&&x<=15)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==20&&x>=0&&x<=3)||(y==16&&x>=4&&x<=11)||(y==20&&x>=8&&x<=15)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==0&&y>=20&&y<=31, { x: 15, y },texture,old_color,queue);
        this.UV(x==15&&y>=20&&y<=31, { x: 0, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=0&&x<=3&&y==20, { x: 4, y: x+16 },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==4, { x: y-16, y: 20 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=8&&x<=11&&y==20, { x: 7, y: 27-x },texture,old_color,queue);
        this.UV(y>=16&&y<=19&&x==7, { x: 27-y, y: 20 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==20&&x>=12&&x<=15, { x: 19-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=4&&x<=7, { x: 19-x, y: 20 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==31&&x>=0&&x<=3, { x: 8, y: x+16 },texture,old_color,queue);
        this.UV(x==8&&y>=16&&y<=19, { x: y-16, y: 31 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==31&&x>=4&&x<=7, { x: x+4, y: 19 },texture,old_color,queue);
        this.UV(y==19&&x>=8&&x<=11, { x: x-4, y: 31 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==31&&x>=8&&x<=11, { x: 11, y: 27-x },texture,old_color,queue);
        this.UV(x==11&&y>=16&&y<=19, { x: 27-y, y: 31 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==31&&x>=12&&x<=15, { x: 23-x, y: 16 },texture,old_color,queue);
        this.UV(y==16&&x>=8&&x<=11, { x: 23-x, y: 31 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_right_leg_outer(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==7&&y>=32&&y<=35)||(x==11&&y>=32&&y<=35)||(x==15&&y>=36&&y<=47)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==0&&y>=36&&y<=47)||(x==4&&y>=32&&y<=35)||(x==8&&y>=32&&y<=35)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==35&&x>=8&&x<=11)||(y==47&&x>=0&&x<=15)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==36&&x>=0&&x<=3)||(y==32&&x>=4&&x<=11)||(y==36&&x>=8&&x<=15)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==0&&y>=36&&y<=47, { x: 15, y },texture,old_color,queue);
        this.UV(x==15&&y>=36&&y<=47, { x: 0, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=0&&x<=3&&y==36, { x: 4, y: x+32 },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==4, { x: y-32, y: 36 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=8&&x<=11&&y==36, { x: 7, y: 43-x },texture,old_color,queue);
        this.UV(y>=32&&y<=35&&x==7, { x: 43-y, y: 36 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==36&&x>=12&&x<=15, { x: 19-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=4&&x<=7, { x: 19-x, y: 36 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==47&&x>=0&&x<=3, { x: 8, y: x+32 },texture,old_color,queue);
        this.UV(x==8&&y>=32&&y<=35, { x: y-32, y: 47 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==47&&x>=4&&x<=7, { x: x+4, y: 35 },texture,old_color,queue);
        this.UV(y==35&&x>=8&&x<=11, { x: x-4, y: 47 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==47&&x>=8&&x<=11, { x: 11, y: 43-x },texture,old_color,queue);
        this.UV(x==11&&y>=32&&y<=35, { x: 43-y, y: 47 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==47&&x>=12&&x<=15, { x: 23-x, y: 32 },texture,old_color,queue);
        this.UV(y==32&&x>=8&&x<=11, { x: 23-x, y: 47 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_leg_inner(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==23&&y>=48&&y<=51)||(x==27&&y>=48&&y<=51)||(x==31&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==16&&y>=52&&y<=63)||(x==20&&y>=48&&y<=51)||(x==24&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=24&&x<=27)||(y==63&&x>=16&&x<=31)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=16&&x<=19)||(y==48&&x>=20&&x<=27)||(y==52&&x>=24&&x<=31)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==16&&y>=52&&y<=63, { x: 31, y },texture,old_color,queue);
        this.UV(x==31&&y>=52&&y<=63, { x: 16, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=16&&x<=19&&y==52, { x: 20, y: x+32 },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==20, { x: y-32, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=24&&x<=27&&y==52, { x: 23, y: 75-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==23, { x: 75-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=28&&x<=31, { x: 51-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=20&&x<=23, { x: 51-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=16&&x<=19, { x: 24, y: x+32 },texture,old_color,queue);
        this.UV(x==24&&y>=48&&y<=51, { x: y-32, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=20&&x<=23, { x: x+4, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=24&&x<=27, { x: x-4, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=24&&x<=27, { x: 27, y: 75-x },texture,old_color,queue);
        this.UV(x==27&&y>=48&&y<=51, { x: 75-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=28&&x<=31, { x: 55-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=24&&x<=27, { x: 55-x, y: 63 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }

  draw_left_leg_outer(texture, point, color, old_color) {
    const queue = [point];
    const visited = new Set();
    const width = texture.width;
    const height = texture.height;

    for (let i = 0; i<224; i++) {
      let queue_length = queue.length;
      for (let j = 0; j < queue_length; j++) {
        const { x, y } = queue[j];
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);
        this.UV(x+1<=64&&!((x==7&&y>=48&&y<=51)||(x==11&&y>=48&&y<=51)||(x==15&&y>=52&&y<=63)), { x: x + 1, y },texture,old_color,queue);
        this.UV(x-1>=0&&!((x==0&&y>=52&&y<=63)||(x==4&&y>=48&&y<=51)||(x==8&&y>=48&&y<=51)), { x: x - 1, y },texture,old_color,queue);
        this.UV(y+1<=64&&!((y==51&&x>=8&&x<=11)||(y==63&&x>=0&&x<=15)), { x, y: y + 1 },texture,old_color,queue);
        this.UV(y-1>=0&&!((y==52&&x>=0&&x<=3)||(y==48&&x>=4&&x<=11)||(y==52&&x>=8&&x<=15)), { x, y: y - 1 },texture,old_color,queue);
        // Left-Right UV
        this.UV(x==0&&y>=52&&y<=63, { x: 15, y },texture,old_color,queue);
        this.UV(x==15&&y>=52&&y<=63, { x: 0, y },texture,old_color,queue);
        // 1st Top UV
        this.UV(x>=0&&x<=3&&y==52, { x: 4, y: x+48 },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==4, { x: y-48, y: 52 },texture,old_color,queue);
        // 2nd Top UV
        this.UV(x>=8&&x<=11&&y==52, { x: 7, y: 59-x },texture,old_color,queue);
        this.UV(y>=48&&y<=51&&x==7, { x: 59-y, y: 52 },texture,old_color,queue);
        // 3rd Top UV
        this.UV(y==52&&x>=12&&x<=15, { x: 19-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=4&&x<=7, { x: 19-x, y: 52 },texture,old_color,queue);
        // 1st Bottom UV
        this.UV(y==63&&x>=0&&x<=3, { x: 8, y: x+48 },texture,old_color,queue);
        this.UV(x==8&&y>=48&&y<=51, { x: y-48, y: 63 },texture,old_color,queue);
        // 2nd Bottom UV
        this.UV(y==63&&x>=4&&x<=7, { x: x+4, y: 51 },texture,old_color,queue);
        this.UV(y==51&&x>=8&&x<=11, { x: x-4, y: 63 },texture,old_color,queue);
        // 3rd Bottom UV
        this.UV(y==63&&x>=8&&x<=11, { x: 11, y: 59-x },texture,old_color,queue);
        this.UV(x==11&&y>=48&&y<=51, { x: 59-y, y: 63 },texture,old_color,queue);
        // 4th Bottom UV
        this.UV(y==63&&x>=12&&x<=15, { x: 23-x, y: 48 },texture,old_color,queue);
        this.UV(y==48&&x>=8&&x<=11, { x: 23-x, y: 63 },texture,old_color,queue);
      }
    }
    for (let i = 0; i < queue.length; i++) {
      texture.putPixel({ x:queue[i].x, y:queue[i].y }, color());
    }
  }




  
  colorsMatch(c1, c2) {
    const tolerance = 0.01*255;
    const alpha_tolerance = 0.05;
    return (
      c1 && c2 &&
      c1.red()-tolerance <= c2.red() && c1.red()+tolerance >= c2.red() &&
      c1.green()-tolerance <= c2.green() && c1.green()+tolerance >= c2.green() &&
      c1.blue()-tolerance <= c2.blue() && c1.blue()+tolerance >= c2.blue() &&
      c1.alpha()-alpha_tolerance <= c2.alpha() && c1.alpha()+alpha_tolerance >= c2.alpha() 
    );
  }

  isInArea(point,x,y,end_x,end_y){
    return (point.x>=x&&point.x<=end_x&&point.y>=y&&point.y<=end_y);
  }

  UV(area,move_to,texture,old_color,queue){
    if (area&&this.colorsMatch(texture.getPixel(move_to), old_color)&&!queue.includes(move_to)) {
      queue.push(move_to);
    }
  }

}

export default BucketTool;
