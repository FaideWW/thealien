/**
 * Created by faide on 5/17/2015.
 */

import GameSystem from './system.js';
import {Component, Registry} from './component.js';
import {RenderableTexturedRect} from './renderable.js';
import {mMath} from './utils.js';

let uid = 0;

/*
 Animation piggy-backs off of the state manager; states share a one-to-one relation with animations, for simplicity
 */

class AnimationSystem extends GameSystem {
  constructor(cID = `animation${uid++}`) {
    'use strict';
    super(cID, ['animatable'])
  }

  update(scene, dt) {
    'use strict';

    const fanimatable = Registry.getFlag('animatable');

    scene.each(
        (e) => {
          const animatable = e.get(fanimatable);
          const currentAnimation = animatable.current;
          const lastAnimation    = animatable.__last;
          const animation = animatable.animations[animatable.current];

          // if the animation has been swapped, reset the last one
          if (currentAnimation !== lastAnimation) {
            animatable.animations[lastAnimation].currentFrame = 0;
            animatable.animations[lastAnimation].currentTime  = 0;
          }

          if (animation.currentTime + dt >= animation.frametime) {
            const numFrames = animation.frames.length;

            // trigger frame step
            if (animation.currentFrame < numFrames - 1 || animation.repeatable) {
              animation.currentFrame = (animation.currentFrame + 1) % numFrames;

              // reconcile transform matrices between animation and frames
              if (animation.frames[animation.currentFrame].transform !== animation.transform) {
                animation.frames[animation.currentFrame].transform = animation.transform;
              }

              // overwrite current renderable
              e.add(animation.frames[animation.currentFrame]);
            }
          }

          animatable.__last = currentAnimation;

          animation.currentTime = (animation.currentTime + dt) % animation.frametime;
        },

        this.lock
    )
  }
}

class Animation {
  constructor(frames, framerate, repeatable = true, transform = mMath.i()) {
    'use strict';

    this._frames = frames;
    this._frametime = 1000 / (framerate || 1);
    this._repeatable = repeatable;

    this.currentFrame = 0;
    this.currentTime = 0;

    this.transform = transform;

  }

  get frames() {
    'use strict';
    return this._frames;
  }

  get frametime() {
    'use strict';
    return this._frametime;
  }

  get repeatable() {
    'use strict';
    return this._repeatable;
  }
}

class Animatable extends Component {
  constructor(cName, animations, defaultAnimation) {
    'use strict';
    super(cName, 'animatable');
    this._animations = animations;
    this.current = defaultAnimation;
    this.__last = this.current;
  }

  get animations() {
    'use strict';
    return this._animations;
  }
}

export {AnimationSystem, Animation, Animatable}
