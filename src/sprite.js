/**
 * Created by faide on 5/30/2015.
 */

import {TextureRegion} from './texture.js';

export default function SpriteLoader(textures, spriteMap) {
  'use strict';

  let sprites = {};
  for (let s in spriteMap) {
    if (spriteMap.hasOwnProperty(s)) {
      let sprite = spriteMap[s];
      if (!sprite.texture) {
        console.error(`Texture missing: ${sprite.texture}`);
        return;
      }

      sprites[s] = {};

      for (let r in sprite.sheet) {
        if (sprite.sheet.hasOwnProperty(r)) {
          let texture = sprite.texture;

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
