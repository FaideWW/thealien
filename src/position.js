/**
 * Created by faide on 4/22/2015.
 */

import {vec2} from './utils.js';
import {Component} from './component.js';

export default class Position extends Component {
    constructor(c_type, c_name, x_or_vec = 0, y = 0, z = 0) {
        "use strict";
        super(c_type, c_name);
        if (x_or_vec.y) {
            this.x = x_or_vec.x;
            this.y = x_or_vec.y;
            this.z = x_or_vec.z;
        } else {
            this.x = x_or_vec;
            this.y = y;
            this.z = z;
        }
    }
}