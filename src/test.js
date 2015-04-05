/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {RenderableRect} from './render.js';
import {vMath, mMath, color} from './utils.js';

let canvas                = document.querySelector("#screen");
let shader_rect_f_element = document.querySelector("#rect-fs");
let shader_rect_v_element = document.querySelector("#rect-vs");
let shader_rect_f_source  = "";
let shader_rect_v_source  = "";


let current_node = shader_rect_f_element.firstChild;
while (current_node) {
    if (current_node.nodeType === current_node.TEXT_NODE) {
        shader_rect_f_source += current_node.textContent;
    }
    current_node = current_node.nextSibling;
}
current_node = shader_rect_v_element.firstChild;
while (current_node) {
    if (current_node.nodeType === current_node.TEXT_NODE) {
        shader_rect_v_source += current_node.textContent;
    }
    current_node = current_node.nextSibling;
}

let shaders = {
    rect: {
        fragment_source: shader_rect_f_source,
        vertex_source: shader_rect_v_source
    }
};

window.g = new Game({
    canvasSelector: "#screen",
    shaders: shaders
});

//let [half_width = 0, half_height = 0, origin = vMath.vec2(), color = color()] = args;
window.rect = new RenderableRect("renderable", "rect1", 1, 1, color(1.0,1.0,1.0));
window.rect2 = new RenderableRect("renderable", "rect2", 1, 1);
window.pos  = vMath.vec3(2, 0, 0);

g.render.update();
g.render.draw(rect, pos);
g.render.draw(rect2, undefined, {
    rotate: Math.PI / 4,
    scale: vMath.vec2(0.5, 0.5)
});

// for testing
window.vMath = vMath;
window.mMath = mMath;
window.wtf   = color;