/**
 * Created by faide on 4/25/2015.
 */

import {vMath} from './utils.js';
import GameSystem from './system.js';
import {Component} from './component.js';

let uid = 0;

class PhysicsSystem extends GameSystem {
  constructor(sID = `physics${uid++}`) {
    'use strict';
    super(sID, ['position', 'movable']);
  }

  update(scene, dt) {
    'use strict';

    let interpolation = dt / 1000;

    scene.each((e) => {
      const movable = e.get(this.__flags.movable);
      const position = e.get(this.__flags.position);

      // non-writable values
      const {x: vx, y: vy} = movable.velocity;
      const {x: ax, y: ay} = movable.acceleration;

      position.x += vx * interpolation;
      position.y += vy * interpolation;

      // check for gravity

      if (movable.mass && !movable.__onground) {
        const gravity = vMath.vec2(0, 2600);
        movable.velocity.x += gravity.x * interpolation;
        movable.velocity.y += gravity.y * interpolation;
      } else {
        movable.__onground = false;
      }

    },

      this.lock);

  }
}

class Movable extends Component {
  constructor(cName, velocity = vMath.vec2(), acceleration = vMath.vec2(), mass = 0) {
    'use strict';
    super(cName, 'movable');

    this.velocity = velocity;
    this.acceleration = acceleration;
    this.mass = mass;
    this.facing = 1; // default to face right

    this.__onground = false;
  }
}

export {PhysicsSystem, Movable};