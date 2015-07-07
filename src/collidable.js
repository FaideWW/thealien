/**
 * Created by faide on 5/7/2015.
 */

import {Component} from './component.js';

export default class AABBCollidable extends Component {
    constructor(cName, halfWidth = 0, halfHeight = 0, reaction = 'slide') {
      'use strict';
      super(cName, 'collidable');

      this.type = 'AABB';

      this.hw = halfWidth;
      this.hh = halfHeight;

      this.reaction = reaction;

      // [TOP , RIGHT , BOTTOM , LEFT]
      this.activeFaces = [true, true, true, true];

      this.__collided = [];
    }
}
