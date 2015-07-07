/**
 * Created by faide on 15-06-04.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';

let uid = 0;

class PlayerControllerSystem extends GameSystem {
  constructor(sID = `playercontroller${uid++}`) {
    'use strict';
    super(sID, ['state', 'movable', 'animatable', 'controllable'])
  }

  update(scene, dt) {
    'use strict';
    const fstate = Registry.getFlag('state');
    const fmovable = Registry.getFlag('movable');
    const fanimatable = Registry.getFlag('animatable');

    scene.each(
        (e) => {
          const state = e.get(fstate);
          const movable = e.get(fmovable);
          const animatable = e.get(fanimatable);

          // xmovement first
          const xmotion = state.xmotion;
          if (xmotion === 'idle') {
            movable.velocity.x = 0;
          } else if (xmotion === 'walkleft') {
            movable.velocity.x = -400;
            movable.facing = -1;
          } else if (xmotion === 'walkright') {
            movable.velocity.x = 400;
            movable.facing = 1;
          }

          const ymotion = state.ymotion;
          console.log(ymotion);

          //if (ymotion === 'ground') {
          //  //movable.velocity.y = 0;
          //} else
          if (ymotion === 'jump') {
            movable.__onground = false;
            movable.velocity.y = -800;
          } else if (ymotion === 'jumphold') {
            movable.velocity.y = -800;
          }

          //else if (ymotion === 'inair') {
          //
          //}

          PlayerControllerSystem.resolveAnimation(state, movable, animatable);
        },

        this.lock
    );
  }

  static resolveAnimation(state, movable, animatable) {
    'use strict';
    const xmotion = state.xmotion;
    const ymotion = state.ymotion;
    let animation;

    if (ymotion === 'ground') {
      if (xmotion === 'idle') {
        animation = 'idle';
      } else {
        animation = 'walk';
      }
    } else {
      animation = 'jump';
    }

    animation += (movable.facing === 1) ? 'right' : 'left';

    animatable.current = animation;
  }
}

class PlayerControllable extends Component {
  constructor(cName) {
    'use strict';
    super(cName, 'controllable');
  }
}

export {PlayerControllable, PlayerControllerSystem};