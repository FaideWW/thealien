/**
 * Created by faide on 5/10/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';

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
        return e.has(this.lock) && e.get(Registry.getFlag('state')).state_name === state_name;
    }
};

class IdleStateSystem extends GameSystem {
    constructor(s_id = `state${uid++}` ) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        const keys = scene.input.key;

        scene.each(
            (entity) => {

                if (keys.a) {
                    IdleStateSystem.transitionState(entity, WalkLeftState);
                } else if (keys.d) {
                    IdleStateSystem.transitionState(entity, WalkRightState);
                }

            },
            stateFilter.call(this, "idle")
        );
    }

    static transitionState(entity, state_constructor) {
        "use strict";
        entity.add(new state_constructor());
    }
}

class WalkLeftStateSystem extends GameSystem {
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        const keys = scene.input.key;

        scene.each(
            (entity) => {

                if (!keys.a) {
                    WalkLeftStateSystem.transitionState(entity, IdleState);
                } else if (keys.d > 0 && keys.d > keys.a) {
                    WalkLeftStateSystem.transitionState(entity, WalkRightState);
                }
            },
            stateFilter.call(this, "walkleft")
        );
    }

    static transitionState(entity, state_constructor) {
        "use strict";
        entity.add(new state_constructor());
    }
}

class WalkRightStateSystem extends GameSystem {
    constructor(s_id = `state${uid++}`) {
        "use strict";
        super(s_id, ["state", "movable"]);
    }

    update(scene, dt) {
        "use strict";
        const keys = scene.input.key;

        scene.each(
            (entity) => {

                if (!keys.d) {
                    WalkRightStateSystem.transitionState(entity, IdleState);
                } else if (keys.a > 0 && keys.a > keys.d) {
                    WalkRightStateSystem.transitionState(entity, WalkLeftState);
                }
            },
            stateFilter.call(this, "walkright")
        );
    }

    static transitionState(entity, state_constructor) {
        "use strict";
        entity.add(new state_constructor());
    }
}

class IdleState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "idle";
    }
}

class WalkLeftState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "walkleft";
    }
}

class WalkRightState extends Component {
    constructor(c_name) {
        "use strict";
        super(c_name, "state");
        this.state_name = "walkright";
    }
}

//class MovingDownStateSystem extends GameSystem {
//    constructor(s_id = `state${uid++}`) {
//        "use strict";
//        super(s_id, ["state", "movable"]);
//    }
//
//    update(scene, dt) {
//        "use strict";
//        scene.each(
//            (entity) => {
//                let physics = entity.get(Registry.getFlag('movable'));
//                if (physics.velocity.y < 0) {
//                    entity.add(new MovingUpState());
//                }
//            },
//            stateFilter.call(this, "movingdown")
//        );
//    }
//}
//
//class MovingUpStateSystem extends GameSystem{
//    constructor(s_id = `state${uid++}`) {
//        "use strict";
//        super(s_id, ["state", "movable"]);
//    }
//
//    update(scene, dt) {
//        "use strict";
//        scene.each(
//            (entity) => {
//                let physics = entity.get(Registry.getFlag('movable'));
//                if (physics.velocity.y > 0) {
//                    entity.add(new MovingDownState());
//                }
//            },
//            stateFilter.call(this, "movingup")
//        );
//    }
//}
//
//class MovingDownState extends Component {
//    constructor(c_name) {
//        "use strict";
//        super(c_name, "state");
//        this.state_name = "movingdown";
//    }
//}
//
//class MovingUpState extends Component {
//    constructor(c_name) {
//        "use strict";
//        super(c_name, "state");
//        this.state_name = "movingup";
//    }
//}

export {
    IdleState,
    IdleStateSystem,
    WalkLeftStateSystem,
    WalkRightStateSystem
    //MovingDownState,
    //MovingUpState,
    //MovingDownStateSystem,
    //MovingUpStateSystem
    };