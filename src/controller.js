/**
 * Created by faide on 15-06-04.
 */

import GameSystem from './system.js';

let uid = 0;

export default class PlayerControllerSystem extends GameSystem {
    constructor(s_id = `playercontroller${uid++}`) {
        "use strict";
        super(s_id, ['state', 'movable', 'renderable'])
    }
}