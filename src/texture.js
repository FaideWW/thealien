/**
 * Created by faide on 5/17/2015.
 */


// TODO: universal tilesheet/tile class for applying/rendering textures

function SpriteLoader (textures, sprite_map) {
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
                    let {x, y, w, h} = sprite.sheet[r];
                    sprites[s][r] = new TextureRegion(texture, x, y, w, h);
                }
            }
        }
    }

    return sprites;
}

class Texture {
    constructor(imgdata, width, height) {
        "use strict";
        this._img = imgdata;
        this._width = width;
        this._height = height;
    }

    get img() {
        "use strict";
        return this._img;
    }

    get width() {
        "use strict";
        return this._width;
    }

    get height() {
        "use strict";
        return this._height;
    }
}

class TextureRegion {
    constructor(texture, x, y, width, height) {

        "use strict";
        this._tex = texture;
        this._x   = x;
        this._y   = y;
        this._w   = width;
        this._h   = height;

        this._tex_coords = new Float32Array([
             this.x               / this.texture.width,  this.y / this.texture.height,
            (this.x + this.width) / this.texture.width,  this.y / this.texture.height,
             this.x               / this.texture.width, (this.y + this.height) / this.texture.height,
            (this.x + this.width) / this.texture.width, (this.y + this.height) / this.texture.height
        ]);
    }

    get texture() {
        "use strict";
        return this._tex;
    }

    get x() {
        "use strict";
        return this._x;
    }

    get y() {
        "use strict";
        return this._y;
    }

    get width() {
        "use strict";
        return this._w;
    }

    get height() {
        "use strict";
        return this._h;
    }

    get coords() {
        "use strict";
        return this._tex_coords
    }
}

export {Texture, TextureRegion, SpriteLoader};