/**
 * Created by faide on 4/25/2015.
 */

import {vMath} from './utils.js';
import GameSystem from './system.js';
import {Component} from './component.js';

let uid = 0;

class PhysicsSystem extends GameSystem{
    constructor(s_id = `physics${uid++}`) {
        "use strict";
        super(s_id, ["position", "movable"]);
    }

    update(scene, dt) {
        "use strict";

        let interpolation = dt / 1000;

        scene.each((e) => {
            let movable = e.get(this.__flags['movable']);
            let position = e.get(this.__flags['position']);

            // non-writable values
            let {x: vx, y: vy} = movable.velocity;
            let {x: ax, y: ay} = movable.acceleration;

            position.x += vx * interpolation;
            position.y += vy * interpolation;


            // check for gravity

            if (movable.mass && !movable.__onground) {
                const gravity = vMath.vec2(0, 100);
                movable.velocity.x += gravity.x * interpolation;
                movable.velocity.y += gravity.y * interpolation;
            }


        }, this.lock);


    }
}

class Movable extends Component {
    constructor(c_name, velocity = vMath.vec2(), acceleration = vMath.vec2(), mass = 0) {
        "use strict";
        super(c_name, "movable");

        this.velocity = velocity;
        this.acceleration = acceleration;
        this.mass = mass;

        this.__onground = false;
    }
}

export {PhysicsSystem, Movable};