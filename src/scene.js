/**
 * Created by faide on 4/21/2015.
 */

export default class Scene {
    constructor(entities = {}, map = {}) {
        "use strict";
        this.__entities = entities;
        this.__map      = map;
    }

    get entities() {
        "use strict";
        return this.__entities;
    }

    addEntity(e) {
        "use strict";
        this.__entities[e.name] = e;
    }

    removeEntity(e) {
        "use strict";
        delete this.__entities[e.name];
    }

    all(lock) {
        "use strict";
        return this.entities.filter((e) => e.matchesLock(lock));
    }

    each(cb, lock, thisArg) {
        "use strict";

    }
}