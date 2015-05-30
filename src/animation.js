/**
 * Created by faide on 5/17/2015.
 */

import GameSystem from './system.js';
import {Component} from './component.js';
import {RenderableTexturedRect} from './renderable.js';

let uid = 0;

/*
Animation piggy-backs off of the state manager; states share a one-to-one relation with animations, for simplicity
 */

class AnimationSystem extends GameSystem {
    constructor(c_id = `animation${uid++}`) {
        "use strict";
        super(c_id, ["state", "renderable"])
    }

    update(scene, dt) {
        "use strict";
        scene.each(
            (e) => {

            },
            (e) => {
                return e.has(this.lock) && e.get(this.__flags.renderable).type === 'animation';
            }
        )
    }
}

class RenderableAnimated extends Component {
    constructor(c_name, sprites) {
        "use strict";
        super(c_name, "renderable");

        this.type = "animation";
        this._current = null;
    }

    get current() {
        "use strict";
        return this._current;
    }
}