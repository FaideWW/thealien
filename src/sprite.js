/**
 * Created by faide on 5/30/2015.
 */

import {TextureRegion} from './texture.js';

export default function SpriteLoader (textures, sprite_map) {
    "use strict";

    let sprites = {};
    for (let s in sprite_map) {
        if (sprite_map.hasOwnProperty(s)) {
            let sprite = sprite_map[s];
            if (!textures[sprite.texture]) {
                console.error(`Texture missing: ${sprite.texture}`);
                return;
            }

            sprites[s] = {};

            for (let r in sprite.sheet) {
                if (sprite.sheet.hasOwnProperty(r)) {
                    let texture = textures[sprite.texture];

                    // region data will either be directly accessed, or from a series of properties
                    let frame = sprite.sheet[r];

                    if (frame.frame) {
                        frame = frame.frame;
                    }
                    sprites[s][r] = new TextureRegion(texture, frame.x, frame.y, frame.w, frame.h);
                }
            }
        }
    }

    return sprites;
}
