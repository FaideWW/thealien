/**
 * Created by faide on 4/25/2015.
 */

export default class GameSystem {
    constructor(s_id = `system_${Date.now().toString()}`) {
        "use strict";

        this._name = s_id;
        this._id   = new Symbol(this._name);
        this._lock = 0;

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