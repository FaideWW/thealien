/**
 * Created by faide on 15-04-26.
 */

import {RenderableTexturedRect} from './renderable.js';
import AABBCollidable from './collidable.js';
import {vMath} from './utils.js';

function processTiles(tile_image, tile_data, tile_halfdims) {
    "use strict";

    let tiles = {};
    for (let tile_id in tile_data) {
        if (tile_data.hasOwnProperty(tile_id)) {
            if (tile_id === 0) {
                console.error('Tile id 0 is reserved');
                continue;
            }

            let tile = tile_data[tile_id];

            tiles[tile_id] = new RenderableTexturedRect(tile_id, tile_halfdims.x, tile_halfdims.y, undefined, tile_image,
                tile.origin, vMath.add(tile.origin, tile.size));
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
                collision_row.push((layer.collidable ? !!tile : false));
                render_row.push(tile);
            }

            collision_layer.push(collision_row);
            render_layer.push(render_row);
        }

        collision.push(collision_layer);
        render.push(render_layer);
    }

    return {collision, render};
}

export default class Map {
    constructor(tile_image, tile_data, tile_halfdims, map_data) {
        "use strict";

        this.__collidable  = new AABBCollidable("maptile", tile_halfdims.x, tile_halfdims.y);

        let {collision, render} = processMap(map_data);

        this.collision = collision;
        this.render = render;

        this.tilewidth  = tile_halfdims.x * 2;
        this.tileheight = tile_halfdims.y * 2;

        this.tiles = processTiles(tile_image, tile_data, tile_halfdims);
    }
}