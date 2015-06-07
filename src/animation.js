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
                const animatable = e.get(fanimatable),
                    current_animation = animatable.current,
                    last_animation    = animatable.__last,
                    animation = animatable.animations[animatable.current];

                // if the animation has been swapped, reset the last one
                if (current_animation !== last_animation) {
                    animatable.animations[last_animation].current_frame = 0;
                    animatable.animations[last_animation].current_time  = 0;
                }

                if (animation.current_time + dt >= animation.frametime) {
                    const num_frames = animation.frames.length;
                    // trigger frame step
                    if (animation.current_frame < num_frames - 1 || animation.repeatable) {
                        animation.current_frame = (animation.current_frame + 1) % num_frames;

                        // overwrite current renderable
                        e.add(animation.frames[animation.current_frame]);
                    }
                }

                animatable.__last = current_animation;

                animation.current_time = (animation.current_time + dt) % animation.frametime;
            }, this.lock
        )
    }
}

class Animation {
    constructor(frames, framerate, repeatable = true) {
        "use strict";

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

class Animatable extends Component {
    constructor(c_name, animations, default_animation) {
        "use strict";
        super(c_name, "animatable");
        this._animations = animations;
        this.current = default_animation;
        this.__last = this.current;
    }

    get animations() {
        "use strict";
        return this._animations;
    }
}

export {AnimationSystem, Animation, Animatable}