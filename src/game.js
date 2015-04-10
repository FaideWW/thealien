/**
 * Created by faide on 15-03-30.
 */
'use strict';

import Entity from "./entity.js";
import {WebGLRenderer} from "./render.js";

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
                render, audio, event} = options;

        // if Alien becomes platform-agnostic, this document.querySelector should be moved to its own module
        this.canvas          = getCanvasEl(selector);

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
}
