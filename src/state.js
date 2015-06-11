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

const stateMask = function (state_flag) {
    "use strict";
    return (e) => {
        return e.has(this.lock) && e.get(Registry.getFlag('state'))[state_flag];
    }
};

class StateManager extends GameSystem {
    constructor(s_id, state_machine_name, additional_components = []) {
        "use strict";
        super(s_id, ['state'].concat(additional_components));
        this.__statemachine = state_machine_name;
    }

    get state() {
        "use strict";
        return this.__statemachine;
    }

    _enter(stateful, state) {
        "use strict";
        stateful[this.state] = state;
    }

    update(scene, dt) {
        "use strict";

        const fstate = Registry.getFlag('state');

        scene.each(
            (e) => {
                const state = e.get(fstate),
                    state_value = state[this.state];

                // invoke the appropriate state value
                this[state_value](state, scene, e);
            },
            stateMask.call(this, this.state)
        );
    }
}

class XMotionStateManager extends StateManager {
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, "xmotion");
    }

    idle(stateful, scene) {
        "use strict";
        const keys = scene.input.key;
        if (keys.a) {
            this._enter(stateful, "walkleft");
        } else if (keys.d) {
            this._enter(stateful, "walkright");
        }
    }

    walkleft(stateful, scene) {
        const keys = scene.input.key;
        "use strict";
        if (!keys.a) {
            this._enter(stateful, "idle");
        } else if (keys.d > 0 && keys.d > keys.a) {
            this._enter(stateful, "walkright");
        }
    }

    walkright(stateful, scene) {
        "use strict";
        const keys = scene.input.key;
        if (!keys.d) {
            this._enter(stateful, "idle");
        } else if (keys.a > 0 && keys.a > keys.d) {
            this._enter(stateful, "walkleft");
        }
    }
}

class YMotionStateManager extends StateManager {
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, "ymotion", ["movable"]);
    }

    ground(stateful, scene) {
        "use strict";
        const keys = scene.input.key;
        if (keys.w) {
            this._enter(stateful, "jump");
        }
    }

    jump(stateful, scene) {
        "use strict";
        const keys = scene.input.key;
        if (keys.w) {
            this._enter(stateful, "jumphold");
        } else {
            this._enter(stateful, "inair");
        }
    }

    jumphold(stateful, scene) {
        "use strict";

        const keys = scene.input.key;
        const current_time = scene.timestamp;
        console.log(keys.w, current_time);
        if (!keys.w || current_time - keys.w > 150) {
            this._enter(stateful, "inair");
        }
    }

    inair(stateful, scene, e) {
        "use strict";
        const fmovable = Registry.getFlag("movable");
        if (e.get(fmovable).__onground) {
            //console.log(e.get(fmovable).__onground);
            this._enter(stateful, "ground");
        }
    }
}

class Stateful extends Component {
    constructor(c_name, state_machines) {
        "use strict";
        super(c_name, "state");
        // decompose states into this object
        for (let state_machine in state_machines) {
            if (state_machines.hasOwnProperty(state_machine)) {
                this[state_machine] = state_machines[state_machine];
            }
        }
    }
}

export {
    Stateful,
    XMotionStateManager,
    YMotionStateManager
    };