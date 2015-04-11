/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {RenderableSolidRect} from './render.js';
import {vMath, mMath, color} from './utils.js';
import rect_shaders from "./shaders/solidrect.glsl.js";

let canvas                = document.querySelector("#screen");


let shaders = {
    rect: {
        fragment_source: rect_shaders.fragment,
        vertex_source: rect_shaders.vertex
    }
};

window.g = new Game({
    canvasSelector: "#screen",
    resolution: {
        width:  720,
        height: 480
    },
    shaders: shaders
});

//let [half_width = 0, half_height = 0, origin = vMath.vec2(), color = color()] = args;
window.rect = new RenderableSolidRect("renderable", "rect1", 50, 50, color(1.0,1.0,1.0));
window.rect2 = new RenderableSolidRect("renderable", "rect2", 50, 50);
window.pos  = vMath.vec3(100, 100, 0);
window.pos2  = vMath.vec3(50, 50, 0);

g.render.update();
g.render.draw(rect, pos);
g.render.draw(rect2, pos2, {
    //rotate: Math.PI / 4,
    //scale: vMath.vec2(0.5, 0.5)
});

// for testing
window.vMath = vMath;
window.mMath = mMath;
window.wtf   = color;