/**
 * Created by faide on 4/21/2015.
 */

export default class Scene {
    constructor(id          = `scene${Date.now().toString()}`,
                entities = [], map = null) {
        "use strict";

        this._name = id;
        this._id = Symbol(this.name);

        this.__entities = entities;
        this.__map      = map;
    }

    get id() {
        "use strict";
        return this._id;
    }

    get name() {
        "use strict";
        return this._name;
    }

    *filter(predicate) {
        "use strict";

        for (let entity of this.entities) {
            if (predicate(entity)) {
                yield entity;
            }
        }
    }

    get entities() {
        "use strict";
        return this.__entities;
    }

    addEntity(e) {
        "use strict";
        this.__entities[e.id] = e;
    }

    removeEntity(e_id) {
        "use strict";
        delete this.__entities[e_id];
    }

    each(cb, lock, thisArg) {
        "use strict";

        let entities = this.filter((e) => e.matchesLock(lock));
        let e = entities.next();

        while (!e.done) {
            cb(e.value);
            e = entities.next();
        }
    }
}