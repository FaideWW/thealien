/**
 * Created by faide on 15-03-30.
 */
'use strict';

import Entity from "./entity.js";
import {WebGLRenderer} from "./render.js";
import ResourceManager from "./resource.js";
import Interface from "./interface.js";
import {rAF, cRAF} from "./utils.js";

/**
 * class Game
 *
 * An instance of the game engine.
 *
 */
export default class {

    /**
     * Binds an instance to the current/designated platform.
     * Also producesa few default supersystems if none are provided
     *
     * For now, only the html5 platform is supported (canvas, web audio, browser-based events)
     *
     *
     * @param {} options
     */
    constructor(options) {
        let getCanvasEl = (selector = "") => document.querySelector(selector);

        let {canvasSelector: selector, shaders, resolution,
                images,
                render, audio, event} = options;

        // if Alien becomes platform-agnostic, this document.querySelector should be moved to its own module
        this.canvas = getCanvasEl(selector);

        this.__loaded = false;
        this.__resources_loaded = () => {};
        this.__user_defined_step = () => {};

        this.__scenes = {};
        this.activeScene = null;
        this.__last_time = 0;

        ResourceManager.loadResources(images)
            .then((img) => {
                this.__resources_loaded.call(this, img);
                this.__loaded = true;
            })
            .catch((error) => console.error(error));

        this.__input = new Interface(window);

        if (!render) {
            this.render = render || new WebGLRenderer({
                el: this.canvas,
                shaders: shaders,
                resolution: resolution
            });
            if (!this.render.success) {
                // fallback to canvas rendering
            }
        }

        if (!audio) {
            // create audio system
        }

        if (!event) {
            // create event system
        }
    }

    get scenes() {
        return this.__scenes;
    }

    // update systems
    __updateSystems(dt) {

        this.__input.process();


        if (this.activeScene) {
            this.render.update(this.activeScene, dt);
        }


    }

    __tick(timestamp) {

        if (this.__last_time === 0) {
            this.__last_time = timestamp;
        }

        let dt = timestamp - this.__last_time;

        if (this.__loaded) {
            this.__updateSystems(dt);
            this.__user_defined_step(dt);
        }

        this.__last_time = timestamp;
        this.__raf_id = rAF(this.__tick.bind(this));
    }

    ready(callback) {
        // this is run when the ResourceManager has finished prefetching
        this.__resources_loaded = callback.bind(this);
        return this;
    }

    /*
     * TODO: refactor this to match the ready syntax above, so game.step(...) can be called from the main script
     *     note: this means the actual step code will need to be pulled out and called from somewhere else
     */
    step(callback) {
        this.__user_defined_step = callback.bind(this);
        return this;
    }

    run() {
        this.__tick(0);
        return this;
    }

    stop() {
        cRAF(this.__raf_id);
        return this;
    }


    // ----- scenes

    addScene(scene) {
        this.__scenes[scene.id] = scene;
    }

    removeScene(scene_or_id) {
        if (this.__scenes[scene_or_id]) {
            delete this.__scenes[scene_or_id];
        } else if (this.__scenes[scene_or_id.id]) {
            delete this.__scenes[scene_or_id.id];
        }
    }

    loadScene(scene_or_id) {
        if (this.__scenes[scene_or_id]) {
            this.activeScene = this.__scenes[scene_or_id];
        } else if (this.__scenes[scene_or_id.id]) {
            this.activeScene = this.__scenes[scene_or_id.id];
        }
    }
}
