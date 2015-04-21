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


        this.__resources_loaded = () => {};
        this.__user_defined_step = () => {};

        ResourceManager.loadResources(images)
            .then((img) => this.__resources_loaded.call(this, img))
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

    __updateSystems(timestamp) {
        // update systems

        this.render.update();

        this.__input.process();

    }

    __tick(timestamp) {
        this.__updateSystems(timestamp);
        this.__user_defined_step(timestamp);
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

}
