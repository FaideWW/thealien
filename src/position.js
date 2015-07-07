/**
 * Created by faide on 4/22/2015.
 */

import {vec2} from './utils.js';
import {Component} from './component.js';

export default class Position extends Component {
  constructor(cName, xOrVec = 0, y = 0, z = 0) {
    'use strict';
    super(cName, 'position');
    if (xOrVec.y) {
      this.x = xOrVec.x;
      this.y = xOrVec.y;
      this.z = xOrVec.z;
    } else {
      this.x = xOrVec;
      this.y = y;
      this.z = z;
    }
  }
}