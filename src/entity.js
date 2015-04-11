/**
 * Created by faide on 2015-04-01.
 */

export default class {
    constructor(id          = Date.now().toString(),
                components  = []                     ) {
        "use strict";

        // create unique entity identifier using symbols
        this._name = id;
        this._id = Symbol(this.name);


        this._key = 0;
        this._components = [];

        components.forEach((c) => this.addComponent(c));
    }

    get name() {
        "use strict";
        return this._name;
    }

    get id() {
        "use strict";
        return this._id;
    }

    get key() {
        "use strict";
        return this._key;
    }

    addComponent(component) {
        "use strict";
        let {flag, c_id} = component;
        if (!this._components[flag]) {
            this._components[flag] = {};
        }
        this._components[flag][c_id] = component;
        this._key = (this._key | flag);
    }

    getComponent(flag, c_id) {
        "use strict";
        return this._components[flag][c_id];
    }

    getComponents(flag) {
        "use strict";
        return this._components[flag];
    }

    removeComponent(component) {
        "use strict";
        let {flag, c_id} = component;

        if (this._components[flag]) {
            if (c_id && this._components[flag][c_id]) {

            } else {

                this._components[flag].length = 0;
            }

            this._key = (this._key & ~flag);
        }
    }
}