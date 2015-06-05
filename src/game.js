/**
 * Created by faide on 15-03-30.
 */

import Entity from "./entity.js";
import WebGLRenderer from "./render.js";
import ResourceManager from "./resource.js";
import Interface from "./interface.js";
import {rAF, cRAF, vec2} from "./utils.js";

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
     * @param canvasSelector
     * @param shaders
     * @param resolution
     * @param resources
     * @param sprites
     * @param render
     * @param audio
     * @param event
     * @param phases
     * @param systems
     */
    constructor({canvasSelector, shaders, resolution, resources, sprites, render, audio, event, phases, systems}) {
        'use strict';
        let getCanvasEl = (selector = "") => document.querySelector(selector);

        // if Alien becomes platform-agnostic, this document.querySelector should be moved to its own module
        this.canvas = getCanvasEl(canvasSelector);

        this.__loaded = false;
        this.__resources_loaded = () => {};
        this.__user_defined_step = () => {};

        this.__user_persist = {};

        this.__scenes = {};
        this.activeScene = null;
        this.__last_time = 0;

        this.__input = new Interface(window, vec2(this.canvas.offsetLeft, this.canvas.offsetTop));



        if (!render) {
            this.render = render || new WebGLRenderer(undefined, {
                el: this.canvas,
                shaders: shaders,
                resolution: resolution
            });
            if (!this.render.success) {
                // fallback to canvas rendering
            }
        }

        this.__pipeline = Promise.resolve({});

        this.__phaseorder = phases || [];
        this.__phases = {};
        this.__phaseorder.forEach((phase) => this.__phases[phase] = systems[phase] || []);

        /*

        The following is no longer relevant; keeping it here for posterity

        if (!audio) {
            // create audio system
        }

        if (!event) {
            // create event system
        }
        */
    }

    get scenes() {
        'use strict';
        return this.__scenes;
    }

    get input() {
        'use strict';
        return this.__input;
    }

    // ==============================
    //  Declaration chaining methods
    // =============================

    resource(resources) {
        'use strict';
        this.__pipeline = this.__pipeline
            .then(() => { return ResourceManager.loadResources(resources); })
            .catch((error) => console.error(`Error loading resource: ${error}`));

        return this;
    }

    ready(callback) {
        'use strict';
        this.__pipeline = this.__pipeline
            .then(callback.bind(this))
            .then(() => {
                this.__loaded = true;
            })
            .catch((error) => { console.error(error) });

        // final link in the pipeline chain; initialize systems, and do other internal processing/error checking

        return this;
    }

    /**
     * general 'then' extension for injecting extra steps into the pipeline
     *
     * NOTE: does no error handling.  If you want to catch errors, use .catch()
     */
    then(callback) {
        "use strict";
        this.__pipeline = this.__pipeline
            .then(callback.bind(this));
        return this;
    }

    /**
     * Counterpart to then().  Handles uncaught errors thrown/rejections created by the pipeline chain
     */
    catch(callback) {
        "use strict";
        this.__pipeline = this.__pipeline
            .catch(callback.bind(this));

        return this;
    }

    // ========================
    //  Private loop functions
    // ========================

    // update systems
    __updateSystems(dt) {
        'use strict';

        this.__input.process();

        if (this.activeScene) {
            let scene = this.activeScene;

            this.__phaseorder.forEach((phase_id) => {
                let systems = this.__phases[phase_id];
                systems.forEach((system) => system.update(scene, dt));
            });

            //draw
            this.render.update(scene, dt);
        }


    }

    __tick(timestamp) {
        'use strict';

        if (this.__last_time === 0) {
            this.__last_time = timestamp;
        }
        let dt = timestamp - this.__last_time;

        if (this.__loaded) {
            this.__updateSystems(dt);
            this.__user_persist = this.__user_defined_step(dt, this.__user_persist);
        }

        this.__last_time = timestamp;
        this.__raf_id = rAF(this.__tick.bind(this));
    }

    step(callback) {
        'use strict';
        this.__user_defined_step = callback.bind(this);
        return this;
    }

    run() {
        'use strict';
        console.log('run');
        this.__tick(0);
        return this;
    }

    stop() {
        'use strict';
        cRAF(this.__raf_id);
        return this;
    }

    // ==================
    //  Scene Management
    // ==================

    addScene(scene) {
        'use strict';
        this.__scenes[scene.id] = scene;
    }

    removeScene(scene_or_id) {
        'use strict';
        if (this.__scenes[scene_or_id]) {
            delete this.__scenes[scene_or_id];
        } else if (this.__scenes[scene_or_id.id]) {
            delete this.__scenes[scene_or_id.id];
        }
    }

    loadScene(scene_or_id) {
        'use strict';
        if (this.__scenes[scene_or_id]) {
            this.activeScene = this.__scenes[scene_or_id];
        } else if (this.__scenes[scene_or_id.id]) {
            this.activeScene = this.__scenes[scene_or_id.id];
        }
    }


    // ==============================
    //  Systems and phase management
    // ==============================

    addPhase(phase_id, index) {
        'use strict';
        this.__phaseorder.splice(index, 0, phase_id);
        this.__phases[phase_id] = [];
    }

    addSystem(system, phase_id) {
        'use strict';
        if (!this.__phases[phase_id]) {

            // don't auto-add phases; these need to be explicit
            return;
        }

        this.__phases[phase_id].push(system);
    }
}
