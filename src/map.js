/**
 * Created by faide on 15-04-26.
 */

import {RenderableTexturedRect} from './renderable.js';
import AABBCollidable from './collidable.js';
import {vMath} from './utils.js';

function processTiles(tile_sprites, tile_halfdims) {
    "use strict";

    let tiles = {};
    for (let tile_id in tile_sprites) {
        if (tile_sprites.hasOwnProperty(tile_id)) {
            if (tile_id === 0) {
                console.error('Tile id 0 is reserved');
                continue;
            }

            let tile = tile_sprites[tile_id];

            tiles[tile_id] = new RenderableTexturedRect(tile_id, tile_halfdims.x, tile_halfdims.y, tile);
        }
    }

    return tiles;
}

function processMap(map_data) {
    "use strict";
    let collision = [];
    let render    = [];
    for (let layer of map_data) {
        let collision_layer = [];
        let render_layer    = [];

        for (let row of layer.data) {
            let collision_row = [];
            let render_row    = [];

            for (let tile of row) {
                if (layer.collidable) {
                    collision_row.push(!!tile);
                }
                render_row.push(tile);
            }

            if (layer.collidable) {
                collision_layer.push(collision_row);
            }
            render_layer.push(render_row);
        }

        collision.push(collision_layer);
        render.push(render_layer);
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
    "use strict";
    const width = layer.length,
        height  = layer[0].length;

    // 30 = (XYZUV) floats per vert * 3 verts per tri * 2 tris per quad
    const vertex = new Float32Array(width * height * 30);
    // 2 = 2 floats per tex coord * 1 tex coord per vert
    let vertexIndex = 0;

    for (let y = 0; y < layer.length; y += 1) {
        for (let x = 0; x < layer[y].length; x += 1) {
            let tile = layer[y][x];
            if (tile === 0) continue;

            // shorthand vars so we can fit it all on screen
            const r = tiles[tile],
                x1 = x * tilewidth,
                x2 = (x + 1) * tilewidth,
                y1 = y * tileheight,
                y2 = (y + 1) * tileheight,
                v = vertex,
                i = vertexIndex;

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
    constructor(tile_sprites, tile_halfdims, map_data, texture) {
        "use strict";

        this.__collidable  = new AABBCollidable("maptile", tile_halfdims.x, tile_halfdims.y);

        let {collision, render} = processMap(map_data);


        this.collision = collision;
        this.render = render;

        this.tilewidth  = tile_halfdims.x * 2;
        this.tileheight = tile_halfdims.y * 2;

        this.tiles = processTiles(tile_sprites, tile_halfdims);
        this.texture = {
            source: texture,
            gl_texture_id: -1,
            initialized: false
        };

        this.buffers = [];

        map_data.forEach((layer) => {
            let buffers = generateLayerRenderArrays(layer.data, this.tiles, this.tilewidth, this.tileheight);
            this.buffers.push(buffers);
        });
    }
}