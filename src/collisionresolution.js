/**
 * Created by faide on 5/31/2015.
 */

import GameSystem from './system.js';
import {Registry} from './component.js';

let uid = 0;

export default class CollisionResolutionSystem extends GameSystem {
    constructor(s_id = `collisionresolution${uid++}`) {
        "use strict";
        super(s_id, ["position", "collidable", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        let fcollidable = Registry.getFlag('collidable');
        let fposition   = Registry.getFlag('position');
        let fmovable    = Registry.getFlag('movable');

        scene.each((entity) => {

                //console.log(entity.get(fcollidable).__collided);

                let collidable = entity.get(fcollidable),
                    position   = entity.get(fposition),
                    movable    = entity.get(fmovable),

                    collidable_queue = collidable.__collided,

                    interpolation = dt / 1000,
                    interpolated_velocity = vMath.mul(movable.velocity, interpolation);

                while (collidable_queue.length) {
                    let manifold = collidable.__collided.shift();
                    if (manifold.type === 'swept') {
                        position.x += interpolated_velocity.x * manifold.t;
                        position.y += interpolated_velocity.y * manifold.t;

                        // TODO: this is one of many different reactions to a collision.  write case for reflection too

                        let remainder = 1 - manifold.t,
                            dot = vMath.dot(movable.velocity, vMath.vec2(manifold.xnormal, manifold.ynormal)) * remainder;

                        movable.velocity.x = dot * manifold.ynormal;
                        movable.velocity.y = dot * manifold.xnormal;

                        // TODO: this is guarding against a very specific interaction.  make it more general
                        if (manifold.xnormal === 0 && manifold.ynormal === -1) {
                            movable.__onground = true;
                        }
                    } else if (manifold.type === 'discrete') {
                        position.x += manifold.xnormal * manifold.depth;
                        position.y += manifold.ynormal * manifold.depth;
                    }
                }

            },
            (function (e) {
                return (e.has(this.lock) && e.get(this.__flags.collidable).__collided.length);
            }).bind(this)
        );
    }
}
