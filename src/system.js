/**
 * Created by faide on 4/25/2015.
 */

import {Registry} from './component.js';

export default class GameSystem {
  constructor(sID = `system_${Date.now().toString()}`,
              componentNames = []) {
    'use strict';

    this._name = sID;
    this._id = Symbol(this._name);
    this._lock = 0;
    this.__flags = {};

    componentNames.forEach((component) => {
      let flag = Registry.getFlag(component);
      this._lock |= flag;
      this.__flags[component] = flag;
    });

    this.__state = {};
  }

  get id() {
    'use strict';
    return this._id;
  }

  get lock() {
    'use strict';
    return this._lock;
  }

  get state() {
    'use strict';
    return this.__state;
  }

  // abstract
  update(scene, dt) {
  }
}
