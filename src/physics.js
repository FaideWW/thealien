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

        console.group();
        scene.each((e) => {
            console.log(e);
        }, this.lock);
        console.groupEnd();
    }
}

class Movable extends Component {
    constructor(c_id, c_name, ...args) {
        "use strict";
        super(c_id, c_name);

        let {velocity, acceleration} = args;

        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}

export {PhysicsSystem, Movable};