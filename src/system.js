/**
 * Created by faide on 4/25/2015.
 */

import {Registry} from "./component.js";

export default class GameSystem {
    constructor(s_id = `system_${Date.now().toString()}`,
                components = []) {
        "use strict";

        this._name = s_id;
        this._id   = Symbol(this._name);
        this._lock = 0;
        this.__flags = components;

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

    init() {
        "use strict";
        this.__flags.forEach((component) => this._lock |= Registry.getFlag(component));
        console.log(`system lock: ${this._lock}`);
    }
}