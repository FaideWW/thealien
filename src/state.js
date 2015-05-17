/**
 * Created by faide on 5/10/2015.
 */

import GameSystem from './system.js';
import {Component} from './component.js';

/**
 *
 *  Entities can have multiple states
 *      states are components
 *  Each state has an associated system that defines transitions
 *
 */

let uid = 0;

let stateFilter = function (state_name) {
    "use strict";
    return (e) => {
        return e.has(this.lock) && e.get(this.__flags.state).state_name === state_name;
    }
};

class IdleStateSystem extends GameSystem {
    constructor(s_id = `state${uid++}` ) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        scene.each(
            (entity) => {
                let physics = entity.get(this.__flags.movable);
                if (physics.velocity.y < 0) {
                    entity.add(new MovingUpState());
                } else if (physics.velocity.y > 0) {
                    entity.add(new MovingDownState());
                }
            },
            stateFilter.call(this, "idle")
        );
    }
}

class MovingDownStateSystem extends GameSystem {
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        scene.each(
            (entity) => {
                let physics = entity.get(this.__flags.movable);
                if (physics.velocity.y < 0) {
                    entity.add(new MovingUpState());
                }
            },
            stateFilter.call(this, "movingdown")
        );
    }
}

class MovingUpStateSystem extends GameSystem{
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        scene.each(
            (entity) => {
                let physics = entity.get(this.__flags.movable);
                if (physics.velocity.y > 0) {
                    entity.add(new MovingDownState());
                }
            },
            stateFilter.call(this, "movingup")
        );
    }
}
class IdleState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "idle";
    }
}

class MovingDownState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "movingdown";
    }
}

class MovingUpState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "movingup";
    }
}

export {IdleState, MovingDownState, MovingUpState, IdleStateSystem, MovingDownStateSystem, MovingUpStateSystem};