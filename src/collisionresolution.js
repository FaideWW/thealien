/**
 * Created by faide on 5/31/2015.
 */

import GameSystem from './system.js';
import {Registry} from './component.js';

let uid = 0;

function resolveSweptAABB(entity, manifold, dt) {
    "use strict";
    const fcollidable = Registry.getFlag('collidable'),
        fposition   = Registry.getFlag('position'),
        fmovable    = Registry.getFlag('movable'),
        collidable = entity.get(fcollidable),
        position   = entity.get(fposition),
        movable    = entity.get(fmovable),
        manifold_v = vMath.vec2(manifold.xnormal, manifold.ynormal),

        interpolated_velocity = vMath.mul(movable.velocity, dt / 1000);

    // don't process collisions along normals in the same direction as the velocity, because that makes no sense
    if (vMath.dot(movable.velocity, manifold_v) > 0) {
        return;
    }

    position.x += interpolated_velocity.x * manifold.t;
    position.y += interpolated_velocity.y * manifold.t;

    // TODO: this is one of many different reactions to a collision.  write case for reflection too
    let remainder = 1 - manifold.t;
    //dot = vMath.dot(movable.velocity, vMath.vec2(manifold.xnormal, manifold.ynormal)) * remainder;

        //movable.velocity.x *= remainder;
        //movable.velocity.y *= remainder;

    movable.velocity = vMath.v_rej(movable.velocity, manifold_v);


    // TODO: this is guarding against a very specific interaction.  make it more general
    if (manifold.xnormal === 0 && manifold.ynormal === -1) {
        movable.__onground = true;
    }
}

function resolveDiscreteAABB(entity, manifold) {
    "use strict";
    const fposition = Registry.getFlag('position'),
        fmovable = Registry.getFlag('movable'),
        position = entity.get(fposition),
        manifold_v = vMath.vec2(manifold.xnormal, manifold.ynormal),
        movable = entity.get(fmovable);

    // don't process collisions along normals in the same direction as the velocity, because that makes no sense
    if (vMath.dot(movable.velocity, manifold_v) > 0) {
        return;
    }
    position.x += manifold.xnormal * manifold.depth;
    position.y += manifold.ynormal * manifold.depth;

    // reject along contact normal

    movable.velocity = vMath.v_rej(movable.velocity,manifold_v);


    // TODO: this is guarding against a very specific interaction.  make it more general
    if (manifold.xnormal === 0 && manifold.ynormal === -1) {
        movable.__onground = true;
    }

}

export {
resolveSweptAABB,
resolveDiscreteAABB
    }