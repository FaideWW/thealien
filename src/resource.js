/**
 * Created by faide on 15-04-11.
 */
/*
design to pre-fetch media resources (textures, audio, etc).

ideally this is how it would work:

g = new Game({
    ...
    resources: resources
    })
    .loaded( (resources) => {

        // script game content here

    });
 */

import {Texture} from './texture.js';

export default {

    __mapifyObject(obj) {
        "use strict";
        let result = [];
        Object.keys(obj).forEach((key) => {
            result.push([key, obj[key]]);
        });
        return result;
    },

    __createTextures(map) {
        "use strict";
        let result = {};
        map.forEach((img) => {
            let [name, data] = img;
            result[name] = new Texture(data, data.width, data.height);
        });

        return result;
    },

    __loadImage(img) {
        "use strict";
        let [name, path] = img;
        return new Promise((resolve, reject) => {
            let i = new Image();
            i.src = path;
            i.onload  = () => resolve([name, i]);
            i.onerror = () => reject(path);
        });
    },

    loadResources(images) {
        "use strict";
        let image_map = this.__mapifyObject(images);

        return Promise.all(image_map.map(this.__loadImage))
        .then((i) => this.__createTextures(i))
        .catch((error) => {throw new Error(`Error loading image: ${error}`)});

    }
}