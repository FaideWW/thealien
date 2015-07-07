/**
 * Created by faide on 4/25/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';
import {vMath} from './utils.js';
import {resolveSweptAABB, resolveDiscreteAABB} from './collisionresolution.js';

let uid = 0;

const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;

/**
 * TODO: heavy refactoring needed here.  make new swept functions more readable and less fragile
 */

export default class CollisionDetectionSystem extends GameSystem {
  constructor(sID = `collisiondetection${uid++}`) {
    'use strict';
    super(sID, ['position', 'collidable', 'movable']);
  }

  update(scene, dt) {
    'use strict';

    let collisionTable = [];
    const checkCollisionTable = (e1, e2) => {
      return collisionTable.some((pair) => {
        return (pair[0] === e1.id && pair[1] === e2.id ||
        pair[1] === e1.id && pair[0] === e2.id);
      });
    };

    const fcollidable = Registry.getFlag('collidable');
    const fposition = Registry.getFlag('position');

    scene.each((entity1) => {
      scene.each((entity2) => {
        if (entity1 === entity2) {
          return;
        }

        // check collision table
        if (!checkCollisionTable(entity1, entity2)) {
          collisionTable.push([entity1.id, entity2.id]);

          // do this
          const collidable1 = entity1.get(fcollidable);
          const collidable2 = entity2.get(fcollidable);
          const position1 = entity1.get(fposition);
          const position2 = entity2.get(fposition);

          collidable1.__collided = [];
          collidable2.__collided = [];

          if (collidable1.type === 'AABB' && collidable2.type === 'AABB') {
            if (CollisionDetectionSystem.__AABBBooleanTest(collidable1, collidable2, position1, position2)) {
              //collidable1.__collided.push(true);
              //collidable2.__collided.push(true);

              collisionTable.push(entity1.id, entity2.id);

            }
          }
        }

      },

      this.lock);

      CollisionDetectionSystem.mapCollide(scene.map, entity1, dt);

    }, this.lock);
  }

  static mapCollide(map, entity, dt) {
    'use strict';
    const mapCollidable = map.__collidable;
    const {tilewidth, tileheight} = map;
    const fcollidable = Registry.getFlag('collidable');
    const fposition = Registry.getFlag('position');
    const fmovable = Registry.getFlag('movable');

    const collidable = entity.get(fcollidable);
    const position = entity.get(fposition);
    const movable = entity.get(fmovable);

    const interpolation = dt / 1000;
    const interpolatedVelocity = vMath.mul(movable.velocity, interpolation);

    const sweptAABB = CollisionDetectionSystem.getSweptBroadphaseBox(entity, dt);

    for (let layer of map.collision) {
      const height = layer.length;
      for (let y = 0; y < height; y += 1) {
        const width = layer[y].length;
        for (let x = 0; x < width; x += 1) {
          const isCollidable = layer[y][x];

          if (isCollidable) {
            const tilePosition = vMath.vec2((x + 0.5) * tilewidth, (y + 0.5) * tileheight);

            // disable inner edges
            mapCollidable.activeFaces = isCollidable;

            // we can safely assume (for now) that map_collidable is always an AABB
            if (collidable.type === 'AABB') {

              if (CollisionDetectionSystem.__AABBBooleanTest(sweptAABB.collidable, mapCollidable, sweptAABB.position, tilePosition)) {

                // swept collision test only works if the boxes are not already intersecting.
                const manifold = CollisionDetectionSystem.__SweptAABBTest(
                    collidable, mapCollidable, position, tilePosition, interpolatedVelocity);

                if (manifold.t > 0 && manifold.t < 1) {

                  //resolve collisions immediately
                  resolveSweptAABB(entity, manifold, dt);

                  //collidable.__collided.push(manifold);
                } else {

                  // discrete fallback
                  let depthTest = CollisionDetectionSystem.__AABBPenetrationTest(collidable, mapCollidable, position, tilePosition);
                  if (depthTest.depth > 0) {

                    // resolve collisions immediately
                    resolveDiscreteAABB(entity, depthTest, dt);

                    //collidable.__collided.push(depthTest);
                  }
                }

              }
            }
          }
        }
      }
    }
  }

  static getSweptBroadphaseBox(entity, dt) {
    'use strict';
    const fcollidable = Registry.getFlag('collidable');
    const fposition = Registry.getFlag('position');
    const fmovable = Registry.getFlag('movable');

    const interpolation = dt / 1000;

    const collidable = entity.get(fcollidable);
    const position = entity.get(fposition);
    const velocity = vMath.mul(entity.get(fmovable).velocity, interpolation);

    const minx = Math.min(position.x, position.x + velocity.x);
    const miny = Math.min(position.y, position.y + velocity.y);
    const maxx = Math.max(position.x, position.x + velocity.x);
    const maxy = Math.max(position.y, position.y + velocity.y);

    const hw = collidable.hw + (Math.abs(velocity.x) / 2);
    const hh = collidable.hh + (Math.abs(velocity.y) / 2);

    return {
      collidable: {
        hw,
        hh
      },
      position: vMath.vec2(minx + (maxx - minx) / 2, miny + (maxy - miny) / 2)
    };
  }

  // TESTS

  static __SweptAABBTest(c1, c2, p1, p2, v1 = vMath.vec2(), v2 = vMath.vec2()) {
    'use strict';

    let manifold = {
      type: 'swept',
      xnormal: 0,
      ynormal: 0,
      t: 1
    };

    let xInvEntry;
    let yInvEntry;
    let xInvExit;
    let yInvExit;

    if (v1.x > 0) {
      xInvEntry = (p2.x - c2.hw) - (p1.x + c1.hw);
      xInvExit = (p2.x + c2.hw) - (p1.x - c1.hw);
    } else {
      xInvEntry = (p2.x + c2.hw) - (p1.x - c1.hw);
      xInvExit = (p2.x - c2.hw) - (p1.x + c1.hw);
    }

    if (v1.y > 0) {
      yInvEntry = (p2.y - c2.hh) - (p1.y + c1.hh);
      yInvExit = (p2.y + c2.hh) - (p1.y - c1.hh);
    } else {
      yInvEntry = (p2.y + c2.hh) - (p1.y - c1.hh);
      yInvExit = (p2.y - c2.hh) - (p1.y + c1.hh);
    }

    let xEntry;
    let yEntry;
    let xExit;
    let yExit;

    if (v1.x === 0) {
      xEntry = -Infinity;
      xExit = Infinity;
    } else {
      xEntry = xInvEntry / v1.x;
      xExit = xInvExit / v1.x;
    }

    if (v1.y === 0) {
      yEntry = -Infinity;
      yExit = Infinity;
    } else {
      yEntry = yInvEntry / v1.y;
      yExit = yInvExit / v1.y;
    }

    let entryTime = Math.max(xEntry, yEntry);
    let exitTime = Math.min(xExit, yExit);

    if (entryTime > exitTime || xEntry < 0 && yEntry < 0 || xEntry > 1 && yEntry > 1) {
      return manifold;
    } else {

      if (xEntry > yEntry) {
        if (xInvEntry < 0 && (c1.activeFaces[LEFT] === true && c2.activeFaces[RIGHT] === true)) {
          manifold.t = entryTime;
          manifold.xnormal = 1;
          manifold.ynormal = 0;
        } else if (c1.activeFaces[RIGHT] === true && c2.activeFaces[LEFT] === true) {
          manifold.t = entryTime;
          manifold.xnormal = -1;
          manifold.ynormal = 0;
        }
      } else {
        if (yInvEntry < 0 && (c1.activeFaces[TOP] === true && c2.activeFaces[BOTTOM] === true)) {
          manifold.t = entryTime;
          manifold.xnormal = 0;
          manifold.ynormal = 1;
        } else if (c1.activeFaces[BOTTOM] === true && c2.activeFaces[TOP] === true) {
          manifold.t = entryTime;
          manifold.xnormal = 0;
          manifold.ynormal = -1;
        }
      }
    }

    return manifold;
  }

  static __AABBPenetrationTest(c1, c2, p1, p2) {
    'use strict';

    // determined using Minkowski sum

    const minkowskiHalfWidth = c1.hw + c2.hw;
    const minkowskiHalfHeight = c1.hh + c2.hh;
    const offset = vMath.sub(p2, p1);
    const manifold = {
          type: 'discrete',
          xnormal: 0,
          ynormal: 0,
          depth: 0
        };

    // TODO: there has to be a better way to do this calc
    const xdifference = Math.abs(Math.abs(minkowskiHalfWidth) - Math.abs(offset.x));
    const ydifference = Math.abs(Math.abs(minkowskiHalfHeight) - Math.abs(offset.y));

    //console.log(offset.x, offset.y);
    if (offset.x > 0 && offset.x < minkowskiHalfWidth) {
      if (offset.y > 0 && offset.y < minkowskiHalfHeight) {
        // quadrant 4 collision
        if (xdifference < ydifference && (c1.activeFaces[RIGHT] === true && c2.activeFaces[LEFT] === true)) {
          // right face
          manifold.xnormal = -1;
          manifold.ynormal = 0;
          manifold.depth = xdifference;
        } else if (c1.activeFaces[BOTTOM] === true && c2.activeFaces[TOP] === true) {
          // bottom
          manifold.xnormal = 0;
          manifold.ynormal = -1;
          manifold.depth = ydifference;
        }
      } else if (offset.y < 0 && offset.y > -minkowskiHalfHeight) {
        // quadrant 1 collision
        if (xdifference < ydifference && (c1.activeFaces[RIGHT] === true && c2.activeFaces[LEFT] === true)) {
          // right face
          manifold.xnormal = -1;
          manifold.ynormal = 0;
          manifold.depth = xdifference;
        } else if (c1.activeFaces[TOP] === true && c2.activeFaces[BOTTOM] === true) {
          // top face
          manifold.xnormal = 0;
          manifold.ynormal = 1;
          manifold.depth = ydifference;
        }
      }
    } else if (offset.x < 0 && offset.x > -minkowskiHalfWidth) {
      if (offset.y > 0 && offset.y < minkowskiHalfHeight) {
        // quadrant 3 collision
        if (xdifference < ydifference && (c1.activeFaces[LEFT] === true && c2.activeFaces[RIGHT] === true)) {
          // left face
          manifold.xnormal = 1;
          manifold.ynormal = 0;
          manifold.depth = xdifference;
        } else if (c1.activeFaces[BOTTOM] === true && c2.activeFaces[TOP] === true) {
          // bottom face
          manifold.xnormal = 0;
          manifold.ynormal = -1;
          manifold.depth = ydifference;
        }
      } else if (offset.y < 0 && offset.y > -minkowskiHalfHeight) {
        // quadrant 2 collision
        if (xdifference < ydifference && (c1.activeFaces[LEFT] === true && c2.activeFaces[RIGHT] === true)) {
          // left face
          manifold.xnormal = 1;
          manifold.ynormal = 0;
          manifold.depth = xdifference;
        } else if (c1.activeFaces[TOP] === true && c2.activeFaces[BOTTOM] === true) {
          // top face
          manifold.xnormal = 0;
          manifold.ynormal = 1;
          manifold.depth = ydifference;
        }
      }
    }

    return manifold;
  }

  static __AABBBooleanTest(c1, c2, p1, p2) {
    'use strict';
    const bounds1 = {
      minx: p1.x - c1.hw,
      miny: p1.y - c1.hh,
      maxx: p1.x + c1.hw,
      maxy: p1.y + c1.hh
    };
    const bounds2 = {
      minx: p2.x - c2.hw,
      miny: p2.y - c2.hh,
      maxx: p2.x + c2.hw,
      maxy: p2.y + c2.hh
    };

    return (
        bounds1.minx < bounds2.maxx && bounds1.maxx > bounds2.minx &&
        bounds1.miny < bounds2.maxy && bounds1.maxy > bounds2.miny
    );
  }
}
