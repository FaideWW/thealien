/**
 * Created by faide on 4/21/2015.
 */

export default class Scene {
    constructor(id          = `scene_${Date.now().toString()}`,
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

    get map() {
        "use strict";
        return this.__map;
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

    each(cb, lock_or_filter, thisArg) {
        "use strict";

        let filter = (typeof lock_or_filter === 'function') ? lock_or_filter : (e) => e.has(lock_or_filter),
            entities = this.filter(filter),
            e = entities.next();

        while (!e.done) {
            if (thisArg) {
                cb.call(thisArg, e.value);
            } else {
                cb(e.value);
            }
            e = entities.next();
        }
    }
}