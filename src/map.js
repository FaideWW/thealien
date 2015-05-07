/**
 * Created by faide on 15-04-26.
 */

import {RenderableTexturedRect} from './renderable.js';
import {vMath} from './utils.js';

export default function Map(tile_image, tile_data = {}, tile_halfdims = vMath.vec2(), map_data = {}) {
        "use strict";

    let tiles = {};
    for (let tile_id in tile_data) {
        if (tile_data.hasOwnProperty(tile_id)) {
            let tile = tile_data[tile_id];

            tiles[tile_id] = new RenderableTexturedRect(tile_id, tile_halfdims.x, tile_halfdims.y, undefined, tile_image,
                tile_image.width, tile_image.height, tile.origin, vMath.add(tile.origin, tile.size));
        }
    }

    return {
        tiles
    };
}