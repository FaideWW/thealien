/**
 * Created by faide on 15-04-26.
 */

import {RenderableTexturedRect} from './renderable.js';
import AABBCollidable from './collidable.js';
import {vMath} from './utils.js';

function processTiles(tileSprites, tileHalfDims) {
  'use strict';

  const tiles = {};
  for (let tileID in tileSprites) {
    if (tileSprites.hasOwnProperty(tileID)) {
      if (tileID === 0) {
        console.error('Tile id 0 is reserved');
        continue;
      }

      const tile = tileSprites[tileID];

      tiles[tileID] = new RenderableTexturedRect(tileID, tileHalfDims.x, tileHalfDims.y, tile);
    }
  }

  return tiles;
}

function processMap(mapData) {
  'use strict';
  const collision = [];
  const render    = [];
  for (let layer of mapData) {
    const collisionLayer = [];
    const renderLayer    = [];

    for (let y = 0; y < layer.data.length; y += 1) {
      const row = layer.data[y];
      const collisionRow = [];
      const renderRow    = [];
      for (let x = 0; x < row.length; x += 1) {
        const tile = row[x];
        if (layer.collidable) {
          const map = layer.data;

          // determine active faces
          const activeFaces = [

              // top
              !(y > 0 && !!map[y - 1][x]),

              // right
              !(x < map[y].length - 1 && !!map[y][x + 1]),

              // bottom
              !(y < map.length - 1 && !!map[y + 1][x]),

              !(x > 0 && !!map[y][x - 1])
          ];

          collisionRow.push((tile) ? activeFaces : false);
        }

        renderRow.push(tile);
      }

      if (layer.collidable) {
        collisionLayer.push(collisionRow);
      }

      renderLayer.push(renderRow);
    }

    collision.push(collisionLayer);
    render.push(renderLayer);
  }

  return {collision, render};
}

/**
 * Generates two array buffers:
 *
 *  a vertex position buffer
 *  a texture coordinate buffer
 *
 * that can be read and drawn directly into webgl
 *
 *
 * @param layer
 * @param tiles
 * @param tilewidth
 * @param tileheight
 */
function generateLayerRenderArrays(layer, tiles, tilewidth, tileheight) {
  'use strict';
  const width = layer.length;
  const height  = layer[0].length;

  // 30 = (XYZUV) floats per vert * 3 verts per tri * 2 tris per quad
  const vertex = new Float32Array(width * height * 30);

  // 2 = 2 floats per tex coord * 1 tex coord per vert
  let vertexIndex = 0;

  for (let y = 0; y < layer.length; y += 1) {
    for (let x = 0; x < layer[y].length; x += 1) {
      let tile = layer[y][x];
      if (tile === 0) continue;

      // shorthand vars so we can fit it all on screen
      const r = tiles[tile];
      const x1 = x * tilewidth;
      const x2 = (x + 1) * tilewidth;
      const y1 = y * tileheight;
      const y2 = (y + 1) * tileheight;
      const v = vertex;
      const i = vertexIndex;

      if (r) {
        const s = r.sprite.coords;

        //          x                    y                    z                   u                      v
        v[i]      = x1;  v[i      + 1] = y1;  v[i      + 2] = 0;  v[i      + 3] = s[0];  v[i      + 4] = s[1];
        v[i +  5] = x2;  v[i + 5  + 1] = y1;  v[i + 5  + 2] = 0;  v[i + 5  + 3] = s[2];  v[i + 5  + 4] = s[3];
        v[i + 10] = x1;  v[i + 10 + 1] = y2;  v[i + 10 + 2] = 0;  v[i + 10 + 3] = s[4];  v[i + 10 + 4] = s[5];

        v[i + 15] = x1;  v[i + 15 + 1] = y2;  v[i + 15 + 2] = 0;  v[i + 15 + 3] = s[4];  v[i + 15 + 4] = s[5];
        v[i + 20] = x2;  v[i + 20 + 1] = y1;  v[i + 20 + 2] = 0;  v[i + 20 + 3] = s[2];  v[i + 20 + 4] = s[3];
        v[i + 25] = x2;  v[i + 25 + 1] = y2;  v[i + 25 + 2] = 0;  v[i + 25 + 3] = s[6];  v[i + 25 + 4] = s[7];
      }

      vertexIndex += 30;
    }

  }

  return {
    vertex
  };
}

export default class Map {
    constructor(tileSprites, tileHalfDims, mapData, texture) {
      'use strict';

      this.__collidable  = new AABBCollidable('maptile', tileHalfDims.x, tileHalfDims.y);

      const {collision, render} = processMap(mapData);

      this.collision = collision;
      this.render = render;

      this.tilewidth  = tileHalfDims.x * 2;
      this.tileheight = tileHalfDims.y * 2;

      this.tiles = processTiles(tileSprites, tileHalfDims);
      this.texture = {
        source: texture,
        glTextureID: -1,
        initialized: false
      };

      this.buffers = [];

      mapData.forEach((layer) => {
        let buffers = generateLayerRenderArrays(layer.data, this.tiles, this.tilewidth, this.tileheight);
        this.buffers.push(buffers);
      });
    }
}
