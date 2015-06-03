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

// TODO: convert layer objects into: nested array of collidables, and a nested array of renderables
function processMap(map_data) {
    "use strict";
    let layers = [];
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

    // 12 = 2 floats per vert * 3 verts per tri * 2 tris per quad
    const vertexPositionBuffer = new Float32Array(width * height * 12);
    // 2 = 2 floats per tex coord * 1 tex coord per vert
    const textureArray = new Float32Array(width * height * 2);
    let arrayIndex = 0;

    for (let y = 0; y < layer.length; y += 1) {
        for (let x = 0; x < layer[y].length; x += 1) {
            let tile = layer[y][x];
            if (tile === 0) continue;

            let renderable = map.tiles[tile];

            if (renderable) {

            }

            arrayIndex += 12;
        }


    }

}

export default class Map {
    constructor(tile_sprites, tile_halfdims, map_data) {
        "use strict";

        this.__collidable  = new AABBCollidable("maptile", tile_halfdims.x, tile_halfdims.y);

        let {collision, render} = processMap(map_data);

        this.collision = collision;
        this.render = render;

        this.tilewidth  = tile_halfdims.x * 2;
        this.tileheight = tile_halfdims.y * 2;

        this.tiles = processTiles(tile_sprites, tile_halfdims);
    }
}