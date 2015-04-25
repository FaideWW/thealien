/**
 * Created by faide on 2015-04-01.
 */

    // TODO: allow two-way flag registration; either through the component OR through the system
let Registry = {
    __next_flag: 1,
    __flags: {},
    getFlag(type) {
        "use strict";
        if (!this.__flags[type]) {
            this.__flags[type] = this.__next_flag;
            this.__next_flag = (this.__next_flag << 1);
        }
        return this.__flags[type];
    },
    get flags() {
        "use strict";
        return this.__flags;
    }
};

class Component {
    constructor(c_id = `component_${Date.now().toString()}`,
                c_type = null) {
        "use strict";

        this._flag = Registry.getFlag(c_type);
        this._name = c_id;
        this._id = Symbol(this._name);
    }

    get flag() {
        "use strict";
        return this._flag;
    }

    get name() {
        "use strict";
        return this._name;
    }

    get id() {
        "use strict";
        return this._id;
    }
}

export {Component, Registry};