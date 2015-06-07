/**
 * Created by faide on 15-06-04.
 */

import GameSystem from './system.js';
import {Registry} from './component.js';

let uid = 0;

export default class PlayerControllerSystem extends GameSystem {
    constructor(s_id = `playercontroller${uid++}`) {
        "use strict";
        super(s_id, ['state', 'movable', 'animatable'])
    }

    update(scene, dt) {
        "use strict";
        const fstate    = Registry.getFlag('state'),
            fmovable    = Registry.getFlag('movable'),
            fanimatable  = Registry.getFlag('animatable');

        scene.each(
            (e) => {
                const state = e.get(fstate),
                    movable = e.get(fmovable),
                    animatable = e.get(fanimatable);

                // xmovement first
                const xmotion = state['xmotion'];
                if (xmotion === 'idle') {
                    movable.velocity.x = 0;
                } else if (xmotion === 'walkleft') {
                    movable.velocity.x = -400;
                    movable.facing = -1;
                } else if (xmotion === 'walkright') {
                    movable.velocity.x = 400;
                    movable.facing = 1;
                }


                const ymotion = state['ymotion'];
                if (ymotion === 'ground') {
                    movable.velocity.y = 0;
                } else if (ymotion === 'jump') {
                    movable.__onground = false;
                    movable.velocity.y = -1000;
                } else if (ymotion === 'inair') {

                }

                PlayerControllerSystem.resolveAnimation(state, movable, animatable);
            },
            this.lock
        );
    }

    static resolveAnimation(state, movable, animatable) {
        "use strict";
        const xmotion = state['xmotion'],
            ymotion = state['ymotion'];
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

        animation += (movable.facing === 1) ? "right" : "left";

        animatable.current = animation;
    }



}