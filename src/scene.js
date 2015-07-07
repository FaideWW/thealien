/**
 * Created by faide on 4/21/2015.
 */

export default class Scene {
  constructor(id = `scene_${Date.now().toString()}`,
              entities = [], map = null) {
    'use strict';

    this._name = id;
    this._id = Symbol(this.name);

    this.__entities = entities;
    this.__map = map;

    this.__inputstate = null;
  }

  get id() {
    'use strict';
    return this._id;
  }

  get name() {
    'use strict';
    return this._name;
  }

  get map() {
    'use strict';
    return this.__map;
  }

  get input() {
    'use strict';
    return this.__inputstate;
  }

  *filter(predicate) {
    'use strict';

    for (let entity of this.entities) {
      if (predicate(entity)) {
        yield entity;
      }
    }
  }

  get entities() {
    'use strict';
    return this.__entities;
  }

  addEntity(e) {
    'use strict';
    this.__entities[e.id] = e;
  }

  removeEntity(eID) {
    'use strict';
    delete this.__entities[eID];
  }

  all(cb, lockOrFilter, thisArg) {
    'use strict';
    const filter = (typeof lockOrFilter === 'function') ? lockOrFilter : (e) => e.has(lockOrFilter);
    const entities = this.entities.filter(filter);
    if (thisArg) {
      cb.call(thisArg, entities);
    } else {
      cb(entities);
    }
  }

  each(cb, lockOrFilter, thisArg) {
    'use strict';

    const filter = (typeof lockOrFilter === 'function') ? lockOrFilter : (e) => e.has(lockOrFilter);
    const entities = this.filter(filter);
    let e = entities.next();

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
