/**
 * Created by faide on 15-06-04.
 */

import GameSystem from './system.js';
import {Registry} from './component.js';

let uid = 0;

export default class PlayerControllerSystem extends GameSystem {
    constructor(s_id = `playercontroller${uid++}`) {
        "use strict";
        super(s_id, ['state', 'movable', 'renderable'])
    }

    update(scene, dt) {
        "use strict";
        const fstate    = Registry.getFlag('state'),
            fmovable    = Registry.getFlag('movable');

        scene.each(
            (e) => {
                const state = e.get(fstate),
                    movable = e.get(fmovable),
                    cstate  = state.state_name;
                if (cstate === 'idle') {
                    movable.velocity.x = 0;
                } else if (cstate === 'walkleft') {
                    movable.velocity.x = -250;
                } else if (cstate === 'walkright') {
                    movable.velocity.x = 250;
                }
            },
            this.lock
        );
    }
}