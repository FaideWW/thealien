/**
 * Created by faide on 4/25/2015.
 */

import GameSystem from './system.js';
import {Component} from './component.js';
import {vMath} from './utils.js';

class CollisionSystem extends GameSystem {
    constructor(s_id, components) {
        "use strict";
        super(s_id, components);
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

        scene.each((entity1) => {
            scene.each((entity2) => {
                if (entity1 === entity2) {
                    return;
                }

                // check collision table
                if (!check_collision_table(entity1, entity2)) {
                    collision_table.push([entity1.id, entity2.id]);

                    // do this
                    let collidable1 = entity1.getComponent(this.__flags['collidable']);
                    let collidable2 = entity2.getComponent(this.__flags['collidable']);
                    let position1 = entity1.getComponent(this.__flags['position']);
                    let position2 = entity2.getComponent(this.__flags['position']);

                    if (collidable1.type === 'AABB' && collidable2.type === 'AABB') {
                        if (this.__AABBTest(collidable1, collidable2, position1, position2)) {
                            collidable1.__collided = true;
                            collidable2.__collided = true;

                            console.log(`collision: ${entity1.name} ${entity2.name}`);
                        }
                    }
                }

            }, this.lock);
        }, this.lock);

    }


    // TESTS

    __AABBTest(c1, c2, p1, p2) {
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

class AABBCollidable extends Component {
    constructor(c_id, c_name, ...args) {
        "use strict";
        super(c_id, c_name);
        let [half_width = 0, half_height = 0] = args;

        this.type = 'AABB';

        this.hw = half_width;
        this.hh = half_height;

        this.__collided = false;
    }
}

export {CollisionSystem, AABBCollidable};