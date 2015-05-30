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

    __process(resource_map) {
        "use strict";

        let result = {
                json: {

                },
                image: {

                }
            },
            processors = {
                image: this.__createTexture,
                json : this.__parseJSON
            };
        resource_map.forEach((resource) => {
            let [name, data, type] = resource;
            result[type][name] = processors[type](data);
        });
        return result;
    },

    __createTexture(data) {
        "use strict";
        return new Texture(data, data.width, data.height);
    },

    __parseJSON(string) {
        "use strict";
        return JSON.parse(string);
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
            i.onload  = () => resolve([name, i, 'image']);
            i.onerror = () => reject(path);
            i.src = path;
        });
    },

    __loadJSONFile(file) {
        "use strict";
        let [name, path] = file;
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.onload = () => resolve([name, request.response, 'json']);
            request.onerror = () => reject(path);

            request.open("GET", path, true);
            request.send();
        })
    },

    __load(resource) {
        "use strict";
        let [name, {path, type}] = resource;
        if (type === 'image') {
            return this.__loadImage([name, path]);
        } else if (type === 'json') {
            return this.__loadJSONFile([name, path]);
        } else {
            // TODO: type inference from file extension
            return Promise.reject(`${[name, path]} resource must have a type`);
        }
    },

    loadResources(files) {
        "use strict";
        let file_map = this.__mapifyObject(files);

        return Promise
            .all(file_map.map(this.__load.bind(this)))
            .then(this.__process.bind(this))
            .catch((error) => {throw new Error(`Error loading resource: ${error}`)});

    }
}


//