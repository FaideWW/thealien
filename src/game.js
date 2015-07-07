/**
 * Created by faide on 15-03-30.
 */

import Entity from './entity.js';
import WebGLRenderer from './render.js';
import ResourceManager from './resource.js';
import Interface from './interface.js';
import {rAF, cRAF, vec2} from './utils.js';

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
    let getCanvasEl = (selector = '') => document.querySelector(selector);

    // if Alien becomes platform-agnostic, this document.querySelector should be moved to its own module
    this.canvas = getCanvasEl(canvasSelector);

    this.__loaded = false;

    this.__userDefinedStep = () => this;

    this.__userPersist = {};

    this.__scenes = {};
    this.activeScene = null;
    this.__lastTime = 0;

    this.__input = new Interface(window, vec2(this.canvas.offsetLeft, this.canvas.offsetTop));

    if (!render) {
      this.render = render || new WebGLRenderer(undefined, {
            el: this.canvas,
            shaders: shaders,
            resolution: resolution
          });

      //if (!this.render.success) {
      //  // fallback to canvas rendering
      //}
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
        .then(() => {
          return ResourceManager.loadResources(resources);
        })

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

        .catch((error) => {
          console.error(error)
        });

    // final link in the pipeline chain; initialize systems, and do other internal processing/error checking

    return this;
  }

  /**
   * general 'then' extension for injecting extra steps into the pipeline
   *
   * NOTE: does no error handling.  If you want to catch errors, use .catch()
   */
  then(callback) {
    'use strict';
    this.__pipeline = this.__pipeline
        .then(callback.bind(this));
    return this;
  }

  /**
   * Counterpart to then().  Handles uncaught errors thrown/rejections created by the pipeline chain
   */
  onFail(callback) {
    'use strict';
    this.__pipeline = this.__pipeline
        .catch(callback.bind(this));

    return this;
  }

  // ========================
  //  Private loop functions
  // ========================

  // update systems
  __updateSystems(dt, timestamp) {
    'use strict';

    this.__input.process(timestamp);

    if (this.activeScene) {
      const scene = this.activeScene;

      scene.timestamp = timestamp;

      this.__phaseorder.forEach((phaseID) => {
        let systems = this.__phases[phaseID];
        systems.forEach((system) => system.update(scene, dt));
      });

      //draw
      this.render.update(scene, dt);
    }

  }

  __tick(timestamp) {
    'use strict';

    if (this.__lastTime === 0) {
      this.__lastTime = timestamp;
    }

    let dt = timestamp - this.__lastTime;

    if (this.__loaded) {
      this.__updateSystems(dt, timestamp);
      this.__userPersist = this.__userDefinedStep(dt, this.__userPersist);
    }

    this.__lastTime = timestamp;
    this.__rafID = rAF(this.__tick.bind(this));
  }

  step(callback) {
    'use strict';
    this.__userDefinedStep = callback.bind(this);
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
    cRAF(this.__rafID);
    return this;
  }

  // ==================
  //  Scene Management
  // ==================

  addScene(scene) {
    'use strict';
    this.__scenes[scene.id] = scene;
  }

  removeScene(sceneOrID) {
    'use strict';
    if (this.__scenes[sceneOrID]) {
      delete this.__scenes[sceneOrID];
    } else if (this.__scenes[sceneOrID.id]) {
      delete this.__scenes[sceneOrID.id];
    }
  }

  loadScene(sceneOrID) {
    'use strict';
    if (this.__scenes[sceneOrID]) {
      this.activeScene = this.__scenes[sceneOrID];
    } else if (this.__scenes[sceneOrID.id]) {
      this.activeScene = this.__scenes[sceneOrID.id];
    }

    this.activeScene.__inputstate = this.input;
  }

  // ==============================
  //  Systems and phase management
  // ==============================

  addPhase(phaseID, index) {
    'use strict';
    this.__phaseorder.splice(index, 0, phaseID);
    this.__phases[phaseID] = [];
  }

  addSystem(system, phaseID) {
    'use strict';
    if (!this.__phases[phaseID]) {

      // don't auto-add phases; these need to be explicit
      return;
    }

    this.__phases[phaseID].push(system);
  }
}
