/**
 * Created by faide on 5/7/2015.
 */

import {Component} from './component.js';

export default class AABBCollidable extends Component {
    constructor(c_name, half_width = 0, half_height = 0, reaction = "slide") {
        "use strict";
        super(c_name, "collidable");

        this.type = 'AABB';

        this.hw = half_width;
        this.hh = half_height;

        this.reaction = reaction;

        // [TOP , RIGHT , BOTTOM , LEFT]
        this.active_faces = [true, true, true, true];

        this.__collided = [];
    }
}