/**
 * Created by faide on 4/25/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';
import {vMath} from './utils.js';
import {resolveSweptAABB, resolveDiscreteAABB} from './collisionresolution.js';

let uid = 0;

/**
 * TODO: heavy refactoring needed here.  make new swept functions more readable and less fragile
 */

export default class CollisionDetectionSystem extends GameSystem {
    constructor(s_id = `collisiondetection${uid++}`) {
        "use strict";
        super(s_id, ["position", "collidable", "movable"]);
    }

    update(scene, dt) {
        "use strict";

        let collision_table = [];
        let check_collision_table = (e1, e2) => {
            return collision_table.some((pair) => {
                return (pair[0] === e1.id && pair[1] === e2.id ||
                        pair[1] === e1.id && pair[0] === e2.id);

            });
        };

        let fcollidable = Registry.getFlag('collidable');
        let fposition    = Registry.getFlag('position');

        scene.each((entity1) => {
            scene.each((entity2) => {
                if (entity1 === entity2) {
                    return;
                }

                // check collision table
                if (!check_collision_table(entity1, entity2)) {
                    collision_table.push([entity1.id, entity2.id]);

                    // do this
                    let collidable1 = entity1.get(fcollidable);
                    let collidable2 = entity2.get(fcollidable);
                    let position1 = entity1.get(fposition);
                    let position2 = entity2.get(fposition);

                    collidable1.__collided = [];
                    collidable2.__collided = [];

                    if (collidable1.type === 'AABB' && collidable2.type === 'AABB') {
                        if (CollisionDetectionSystem.__AABBBooleanTest(collidable1, collidable2, position1, position2)) {
                            //collidable1.__collided.push(true);
                            //collidable2.__collided.push(true);

                            collision_table.push(entity1.id, entity2.id);

                            console.log(`collision: ${entity1.name} ${entity2.name}`);
                        }
                    }
                }

            }, this.lock);


            CollisionDetectionSystem.mapCollide(scene.map, entity1, dt);

        }, this.lock);
    }

    static mapCollide(map, entity, dt) {
        "use strict";
        const map_collidable         = map.__collidable,
             {tilewidth, tileheight} = map,
            fcollidable              = Registry.getFlag('collidable'),
            fposition                = Registry.getFlag('position'),
            fmovable                 = Registry.getFlag('movable');

        let collidable = entity.get(fcollidable),
            position   = entity.get(fposition),
            movable    = entity.get(fmovable);

        let interpolation = dt / 1000,
            interpolated_velocity = vMath.mul(movable.velocity, interpolation);

        const sweptAABB = CollisionDetectionSystem.getSweptBroadphaseBox(entity, dt);

        for (let layer of map.collision) {
            let height = layer.length;
            for (let y = 0; y < height; y += 1) {
                let width = layer[y].length;
                for (let x = 0; x < width; x += 1) {
                    let is_collidable = layer[y][x];

                    if (is_collidable) {
                        let tile_position = vMath.vec2((x + 0.5) * tilewidth, (y + 0.5) * tileheight);

                        // we can safely assume (for now) that map_collidable is always an AABB
                        if (collidable.type === 'AABB') {



                            if (CollisionDetectionSystem.__AABBBooleanTest(sweptAABB.collidable, map_collidable, sweptAABB.position, tile_position)) {

                                // swept collision test only works if the boxes are not already intersecting.
                                const manifold = CollisionDetectionSystem.__SweptAABBTest(
                                    collidable, map_collidable, position, tile_position, interpolated_velocity);

                                if (manifold.t > 0 && manifold.t < 1) {

                                    //resolve collisions immediately
                                    resolveSweptAABB(entity, manifold, dt);

                                    //collidable.__collided.push(manifold);
                                } else {

                                    // discrete fallback
                                    let depthTest = CollisionDetectionSystem.__AABBPenetrationTest(collidable, map_collidable, position, tile_position);
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
        "use strict";
        let fcollidable              = Registry.getFlag('collidable'),
            fposition                = Registry.getFlag('position'),
            fmovable                 = Registry.getFlag('movable'),

            interpolation = dt / 1000,

            collidable = entity.get(fcollidable),
            position   = entity.get(fposition),
            velocity   = vMath.mul(entity.get(fmovable).velocity, interpolation),

            minx = Math.min(position.x, position.x + velocity.x),
            miny = Math.min(position.y, position.y + velocity.y),
            maxx = Math.max(position.x, position.x + velocity.x),
            maxy = Math.max(position.y, position.y + velocity.y),

            hw = collidable.hw + (Math.abs(velocity.x) / 2),
            hh = collidable.hh + (Math.abs(velocity.y) / 2);

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
        "use strict";

        let manifold = {
            type: 'swept',
            xnormal: 0,
            ynormal: 0,
            t      : 1
        };

        let xInvEntry, yInvEntry,
            xInvExit,  yInvExit;

        if (v1.x > 0) {
            xInvEntry = (p2.x - c2.hw) - (p1.x + c1.hw);
            xInvExit  = (p2.x + c2.hw) - (p1.x - c1.hw);
        } else {
            xInvEntry = (p2.x + c2.hw) - (p1.x - c1.hw);
            xInvExit  = (p2.x - c2.hw) - (p1.x + c1.hw);
        }

        if (v1.y > 0) {
            yInvEntry = (p2.y - c2.hh) - (p1.y + c1.hh);
            yInvExit  = (p2.y + c2.hh) - (p1.y - c1.hh);
        } else {
            yInvEntry = (p2.y + c2.hh) - (p1.y - c1.hh);
            yInvExit  = (p2.y - c2.hh) - (p1.y + c1.hh);
        }

        let xEntry, yEntry,
            xExit,  yExit;

        if (v1.x === 0) {
            xEntry = -Infinity;
            xExit  = Infinity;
        } else {
            xEntry = xInvEntry / v1.x;
            xExit  = xInvExit  / v1.x;
        }
        if (v1.y === 0) {
            yEntry = -Infinity;
            yExit  = Infinity;
        } else {
            yEntry = yInvEntry / v1.y;
            yExit  = yInvExit  / v1.y;
        }

        let entryTime = Math.max(xEntry, yEntry);
        let exitTime  = Math.min(xExit,  yExit);

        if (entryTime > exitTime || xEntry < 0 && yEntry < 0 || xEntry > 1 && yEntry > 1) {
            return manifold;
        } else {

            manifold.t = entryTime;
            if (xEntry > yEntry) {
                if (xInvEntry < 0) {
                    manifold.xnormal = 1;
                    manifold.ynormal = 0;
                } else {
                    manifold.xnormal = -1;
                    manifold.ynormal = 0;
                }
            } else {
                if (yInvEntry < 0) {
                    manifold.xnormal = 0;
                    manifold.ynormal = 1;
                } else {
                    manifold.xnormal = 0;
                    manifold.ynormal = -1;
                }
            }
        }

        return manifold;
    }

    static __AABBPenetrationTest(c1, c2, p1, p2) {
        "use strict";
        // determined using Minkowski sum

        const minkowski_aabb_hw = c1.hw + c2.hw,
            minkowski_aabb_hh = c1.hh + c2.hh,
            offset = vMath.sub(p2, p1),
            manifold = {
                type: 'discrete',
                xnormal: 0,
                ynormal: 0,
                depth: 0
            };

        // TODO: there has to be a better way to do this calc
        let xdifference = Math.abs(Math.abs(minkowski_aabb_hw) - Math.abs(offset.x)),
            ydifference = Math.abs(Math.abs(minkowski_aabb_hh) - Math.abs(offset.y));

        if (offset.x > 0 && offset.x < minkowski_aabb_hw) {
            if (offset.y > 0 && offset.y < minkowski_aabb_hh) {
                // quadrant 1 collision
                if (xdifference < ydifference) {
                    // right face
                    manifold.xnormal = -1;
                    manifold.ynormal = 0;
                    manifold.depth = xdifference;
                } else {
                    // bottom
                    manifold.xnormal = 0;
                    manifold.ynormal = -1;
                    manifold.depth = ydifference;
                }
            } else if (offset.y < 0 && offset.y > -minkowski_aabb_hh) {
                // quadrant 4 collision
                if (xdifference < ydifference) {
                    // right face

                    manifold.xnormal = -1;
                    manifold.ynormal = 0;
                    manifold.depth = xdifference;
                } else {
                    // top face
                    manifold.xnormal = 0;
                    manifold.ynormal = 1;
                    manifold.depth = ydifference;
                }
            }
        } else if (offset.x < 0 && offset.x > -minkowski_aabb_hw) {
            if (offset.y > 0 && offset.y < minkowski_aabb_hh) {
                // quadrant 2 collision
                if (xdifference < ydifference) {
                    // left face
                    manifold.xnormal = 1;
                    manifold.ynormal = 0;
                    manifold.depth = xdifference;
                } else {
                    // bottom face
                    manifold.xnormal = 0;
                    manifold.ynormal = -1;
                    manifold.depth = ydifference;
                }
            } else if (offset.y < 0 && offset.y > -minkowski_aabb_hh) {
                // quadrant 3 collision
                if (xdifference < ydifference) {
                    // left face
                    manifold.xnormal = 1;
                    manifold.ynormal = 0;
                    manifold.depth = xdifference;
                } else {
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
        "use strict";
        let bounds1 = {
            minx: p1.x - c1.hw,
            miny: p1.y - c1.hh,
            maxx: p1.x + c1.hw,
            maxy: p1.y + c1.hh
        };
        let bounds2 = {
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