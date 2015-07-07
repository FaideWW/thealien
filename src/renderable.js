/**
 * Created by faide on 5/7/2015.
 */

import {vMath,  color, mMath} from './utils.js';
import {Component} from './component.js';

class RenderableSolidRect extends Component {
  constructor(cName, halfWidth = 0, halfHeight = 0, fill = color(), origin = vMath.vec3()) {
    super(cName, 'renderable');

    this.type = 'solidrect';
    this.origin = origin;

    // build the vertex array (TRIANGLE_STRIP order)
    this.verts = new Float32Array([
      halfWidth - origin.x, halfHeight - origin.y, 0.0 - origin.z,
      -halfWidth - origin.x, halfHeight - origin.y, 0.0 - origin.z,
      halfWidth - origin.x, -halfHeight - origin.y, 0.0 - origin.z,
      -halfWidth - origin.x, -halfHeight - origin.y, 0.0 - origin.z
    ]);

    // each of the four vertices has an individual color
    //TODO: decouple this a bit from color object
    this._color = new Float32Array([...fill.arr, ...fill.arr, ...fill.arr, ...fill.arr]);
  }

  get color() {
    return this._color;
  }

  set color(c) {
    if (c.arr) {
      this._color = new Float32Array([...c.arr, ...c.arr, ...c.arr, ...c.arr]);
    } else {
      this._color = c;
    }
  }
}

class RenderableTexturedRect extends Component {
  constructor(cName, halfWidth = 0, halfHeihgt = 0, texRegion = null, opacity = 1,
              transform = mMath.i(), originX = 0, originY = 0, originZ = 0) {
    super(cName, 'renderable');

    this.type = 'texturedrect';
    this.origin = vMath.vec3(originX, originY, originZ);

    // tex_image should already be image data pre-loaded... check for tex_image.__loaded

    this.initialized = false;
    this.glTextureID = -1;
    this.transform = transform;

    this.sprite = texRegion;

    this.verts = new Float32Array([
      -halfWidth - this.origin.x, -halfHeihgt - this.origin.y, 0.0 - this.origin.z, // top left
      halfWidth - this.origin.x, -halfHeihgt - this.origin.y, 0.0 - this.origin.z, // top right
      -halfWidth - this.origin.x, halfHeihgt - this.origin.y, 0.0 - this.origin.z, // bottom left
      halfWidth - this.origin.x, halfHeihgt - this.origin.y, 0.0 - this.origin.z  // bottom right
    ]);

    this.opacity = opacity;

  }
}

class RenderableSolidPoly extends Component {
  constructor(cName, points = [], fill = color(), stroke = color()) {
    super(cName, 'renderable');

    this.points = points;

    this.fill = fill;
    this.stroke = stroke;
  }
}

export {
  RenderableSolidRect,
  RenderableSolidPoly,
  RenderableTexturedRect
};