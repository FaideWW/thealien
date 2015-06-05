/**
 * Created by faide on 5/17/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';
import {RenderableTexturedRect} from './renderable.js';

let uid = 0;

/*
Animation piggy-backs off of the state manager; states share a one-to-one relation with animations, for simplicity
 */

class AnimationSystem extends GameSystem {
    constructor(c_id = `animation${uid++}`) {
        "use strict";
        super(c_id, ["animatable"])
    }

    update(scene, dt) {
        "use strict";

        const fanimatable = Registry.getFlag('animatable');

        scene.each(
            (e) => {
                const animatable = e.get(fanimatable);

                if (animatable.current_time + dt >= animatable.frametime) {
                    const num_frames = animatable.frames.length;
                    // trigger frame step
                    if (animatable.current_frame < num_frames - 1 || animatable.repeatable) {
                        animatable.current_frame = (animatable.current_frame + 1) % num_frames;

                        // overwrite current renderable
                        e.add(animatable.frames[animatable.current_frame]);
                    }
                }

                animatable.current_time = (animatable.current_time + dt) % animatable.frametime;
            }, this.lock
        )
    }
}

class Animatable extends Component {
    constructor(c_name, frames, framerate, repeatable = true) {
        "use strict";
        super(c_name, "animatable");

        this._frames = frames;
        this._frametime = 1000 / (framerate || 1);
        this._repeatable = repeatable;

        this.current_frame = 0;
        this.current_time = 0;

    }

    get frames() {
        "use strict";
        return this._frames;
    }

    get frametime() {
        "use strict";
        return this._frametime;
    }

    get repeatable() {
        "use strict";
        return this._repeatable;
    }
}

export {AnimationSystem, Animatable}