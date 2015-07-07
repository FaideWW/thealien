/**
 * Created by faide on 5/31/2015.
 */

import GameSystem from './system.js';
import {Registry} from './component.js';

let uid = 0;

function resolveSweptAABB(entity, manifold, dt) {
  'use strict';
  const fcollidable = Registry.getFlag('collidable');
  const fposition = Registry.getFlag('position');
  const fmovable = Registry.getFlag('movable');
  const collidable = entity.get(fcollidable);
  const position = entity.get(fposition);
  const movable = entity.get(fmovable);
  const manifoldV = vMath.vec2(manifold.xnormal, manifold.ynormal);
  const interpolatedVelocity = vMath.mul(movable.velocity, dt / 1000);

  // don't process collisions along normals in the same direction as the velocity, because that makes no sense
  if (vMath.dot(movable.velocity, manifoldV) > 0) {
    return;
  }

  position.x += interpolatedVelocity.x * manifold.t;
  position.y += interpolatedVelocity.y * manifold.t;

  // TODO: this is one of many different reactions to a collision.  write case for reflection too

  movable.velocity = vMath.vRej(movable.velocity, manifoldV);

  // TODO: this is guarding against a very specific interaction.  make it more general
  if (manifold.xnormal === 0 && manifold.ynormal === -1) {
    movable.__onground = true;
  }
}

function resolveDiscreteAABB(entity, manifold) {
  'use strict';
  const fposition = Registry.getFlag('position');
  const fmovable = Registry.getFlag('movable');
  const position = entity.get(fposition);
  const manifoldV = vMath.vec2(manifold.xnormal, manifold.ynormal);
  const movable = entity.get(fmovable);

  // don't process collisions along normals in the same direction as the velocity, because that makes no sense
  if (vMath.dot(movable.velocity, manifoldV) > 0) {
    return;
  }

  position.x += manifold.xnormal * manifold.depth;
  position.y += manifold.ynormal * manifold.depth;

  // reject along contact normal

  movable.velocity = vMath.vRej(movable.velocity, manifoldV);

  // TODO: this is guarding against a very specific interaction.  make it more general
  if (manifold.xnormal === 0 && manifold.ynormal === -1) {
    movable.__onground = true;
  }

}

export {
    resolveSweptAABB,
    resolveDiscreteAABB
}