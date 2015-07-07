/**
 * Created by faide on 5/10/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';

/**
 * *
 * component is Stateful
 *
 * set up like component registry; each state machine has its flag, and
 * x-movement state has state flag 0b000
 * y-movement state has state flag 0b001
 *
 * attack state has flag 0b010 etc.
 *
 * each flag has a corresponding state system that manages that particular state
 *
 * TODO: abstract this so it can be set up from main.alien
 */

let uid = 0;

const stateMask = function(stateFlag) {
  'use strict';
  return (e) => {
    return e.has(this.lock) && e.get(Registry.getFlag('state'))[stateFlag];
  }
};

class StateManager extends GameSystem {
  constructor(sID, stateMachineName, additionalComponents = []) {
    'use strict';
    super(sID, ['state'].concat(additionalComponents));
    this.__statemachine = stateMachineName;
  }

  get state() {
    'use strict';
    return this.__statemachine;
  }

  _enter(stateful, state) {
    'use strict';
    stateful[this.state] = state;
  }

  update(scene, dt) {
    'use strict';

    const fstate = Registry.getFlag('state');

    scene.each(
      (e) => {
        const state = e.get(fstate);
        const stateValue = state[this.state];

        // invoke the appropriate state value
        this[stateValue](state, scene, e);
      },

      stateMask.call(this, this.state)
    );
  }
}

class XMotionStateManager extends StateManager {
  constructor(sID = `state${uid++}`) {
    'use strict';
    super(sID, 'xmotion');
  }

  idle(stateful, scene) {
    'use strict';
    const keys = scene.input.key;
    if (keys.a) {
      this._enter(stateful, 'walkleft');
    } else if (keys.d) {
      this._enter(stateful, 'walkright');
    }
  }

  walkleft(stateful, scene) {
    const keys = scene.input.key;
    'use strict';
    if (!keys.a) {
      this._enter(stateful, 'idle');
    } else if (keys.d > 0 && keys.d > keys.a) {
      this._enter(stateful, 'walkright');
    }
  }

  walkright(stateful, scene) {
    'use strict';
    const keys = scene.input.key;
    if (!keys.d) {
      this._enter(stateful, 'idle');
    } else if (keys.a > 0 && keys.a > keys.d) {
      this._enter(stateful, 'walkleft');
    }
  }
}

class YMotionStateManager extends StateManager {
  constructor(sID = `state${uid++}`) {
    'use strict';
    super(sID, 'ymotion', ['movable']);
  }

  ground(stateful, scene) {
    'use strict';
    const keys = scene.input.key;
    if (keys.w) {
      this._enter(stateful, 'jump');
    }
  }

  jump(stateful, scene) {
    'use strict';
    const keys = scene.input.key;
    if (keys.w) {
      this._enter(stateful, 'jumphold');
    } else {
      this._enter(stateful, 'inair');
    }
  }

  jumphold(stateful, scene) {
    'use strict';

    const keys = scene.input.key;
    const currentTime = scene.timestamp;
    console.log(keys.w, currentTime);
    if (!keys.w || currentTime - keys.w > 150) {
      this._enter(stateful, 'inair');
    }
  }

  inair(stateful, scene, e) {
    'use strict';
    const fmovable = Registry.getFlag('movable');
    if (e.get(fmovable).__onground) {
      //console.log(e.get(fmovable).__onground);
      this._enter(stateful, 'ground');
    }
  }
}

class Stateful extends Component {
  constructor(cName, stateMachines) {
    'use strict';
    super(cName, 'state');

    // decompose states into this object
    for (let stateMachine in stateMachines) {
      if (stateMachines.hasOwnProperty(stateMachine)) {
        this[stateMachine] = stateMachines[stateMachine];
      }
    }
  }
}

export {
  Stateful,
  XMotionStateManager,
  YMotionStateManager
};