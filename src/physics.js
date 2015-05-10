/**
 * Created by faide on 4/25/2015.
 */

import {vMath} from './utils.js';
import GameSystem from './system.js';
import {Component} from './component.js';

class PhysicsSystem extends GameSystem{
    constructor(s_id, components) {
        "use strict";
        super(s_id, components);
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


        }, this.lock);


    }
}

class Movable extends Component {
    constructor(c_id, c_name, ...args) {
        "use strict";
        super(c_id, c_name);

        let [velocity = vMath.vec2(), acceleration = vMath.vec2()] = args;

        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}

export {PhysicsSystem, Movable};