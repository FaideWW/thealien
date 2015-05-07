/**
 * Created by faide on 4/25/2015.
 */

import {Registry} from "./component.js";

export default class GameSystem {
    constructor(s_id = `system_${Date.now().toString()}`,
                component_names = []) {
        "use strict";

        this._name = s_id;
        this._id   = Symbol(this._name);
        this._lock = 0;
        this.__flags = {};

        component_names.forEach((component) => {
            let flag = Registry.getFlag(component);
            this._lock |= flag;
            this.__flags[component] = flag;
        });

        this.__state = {};
    }

    get id() {
        "use strict";
        return this._id;
    }

    get lock() {
        "use strict";
        return this._lock;
    }

    get state() {
        "use strict";
        return this.__state;
    }
}