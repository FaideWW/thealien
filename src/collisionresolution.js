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

                    interpolation = dt / 1000,
                    interpolated_velocity = vMath.mul(movable.velocity, interpolation);

                entity.get(fcollidable).__collided.forEach((manifold) => {

                    position.x += interpolated_velocity.x * manifold.t;
                    position.y += interpolated_velocity.y * manifold.t;

                    // TODO: this is one of many different reactions to a collision.  write case for reflection too

                    let remainder = 1 - manifold.t,
                        dot = vMath.dot(movable.velocity, vMath.vec2(manifold.normalx, manifold.normaly)) * remainder;

                    movable.velocity.x = dot * manifold.normaly;
                    movable.velocity.y = dot * manifold.normalx;

                    // TODO: this is guarding against a very specific interaction.  make it more general
                    if (manifold.normalx === 0 && manifold.normaly === -1) {
                        movable.__onground = true;
                    }
                });

            },
            (function (e) {
                return (e.has(this.lock) && e.get(this.__flags.collidable).__collided.length);
            }).bind(this)
        );
    }
}
