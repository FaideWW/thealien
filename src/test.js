/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {RenderableSolidRect, RenderableTexturedRect} from './render.js';
import {vMath, mMath, color} from './utils.js';
import solid_rect_shaders from "./shaders/solidrect.glsl.js";
import textured_rect_shaders from "./shaders/texrect.glsl.js";

let canvas = document.querySelector("#screen");

let entities = [];

let shaders = {
    solid_rect: solid_rect_shaders,
    textured_rect: textured_rect_shaders
};

window.g = new Game({
        canvasSelector: "#screen",
        resolution: {
            width:  720,
            height: 480
        },
        shaders: shaders,
        images: {
            man: 'img/man.png'
        }
    })
    .ready(function (images) { // don't use arrow here, we need to preserve execution context
        "use strict";

        // solid rects
        let {man} = images;

        entities.push({
            rect: new RenderableSolidRect("renderable", "rect1", 50, 50, color(1.0,1.0,1.0)),
            pos:  vMath.vec3(100, 100)
        });

        entities.push({
            rect: new RenderableSolidRect("renderable", "rect2", 50, 50),
            pos:  vMath.vec3(50, 50)
        });

        entities.push({
            rect: new RenderableTexturedRect("renderable", "texrect", 32, 32, undefined, man,
                man.width,        man.height,
                vMath.vec2(0, 0), vMath.vec2(man.width, man.height)),
            pos: vMath.vec3(250, 250)
        });


        // for testing
        window.vMath = vMath;
        window.mMath = mMath;

    })
    .step(function (dt) {
        "use strict";

        entities.forEach((e) => {
            this.render.draw(e.rect, e.pos);
        });

        entities[0].pos = this.__input.__mouse_state.pos;
    })
    .run();