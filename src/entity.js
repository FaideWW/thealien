/**
 * Created by faide on 2015-04-01.
 */

import {Registry} from './component.js';

export default class Entity {
  constructor(id = `entity_${Date.now().toString()}`,
              components = []) {
    'use strict';

    // create unique entity identifier using symbols
    this._name = id;
    this._id = Symbol(this.name);

    this._key = 0;
    this._components = {};

    components.forEach((c) => this.add(c));
  }

  get name() {
    'use strict';
    return this._name;
  }

  get id() {
    'use strict';
    return this._id;
  }

  get key() {
    'use strict';
    return this._key;
  }

  add(component) {
    'use strict';
    let {flag} = component;
    this._components[flag] = component;
    this._key |= flag;
  }

  get(flag) {
    'use strict';
    return this._components[flag];
  }

  has(lock) {
    'use strict';
    return ((this.key & lock) === lock);
  }

  remove(component) {
    'use strict';
    let {flag, cID} = component;

    if (this._components[flag]) {
      delete this._components[flag];
      this._key &= ~flag;
    }
  }
}
