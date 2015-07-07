/**
 * Created by faide on 2015-04-01.
 */

let Registry = {
  __nextFlag: 1,
  __flags: {},
  getFlag(type) {
    'use strict';
    if (!this.__flags[type]) {
      this.__flags[type] = this.__nextFlag;
      this.__nextFlag = (this.__nextFlag << 1);
    }

    return this.__flags[type];
  },

  get flags() {
    'use strict';
    return this.__flags;
  }
};

class Component {
  constructor(cID = `component_${Date.now().toString()}`,
              cType = null) {
    'use strict';

    this._flag = Registry.getFlag(cType);
    this._name = cID;
    this._id = Symbol(this._name);
  }

  get flag() {
    'use strict';
    return this._flag;
  }

  get name() {
    'use strict';
    return this._name;
  }

  get id() {
    'use strict';
    return this._id;
  }
}

export {Component, Registry};