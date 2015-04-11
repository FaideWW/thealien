/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {RenderableSolidRect, RenderableTexturedRect} from './render.js';
import {vMath, mMath, color} from './utils.js';
import solid_rect_shaders from "./shaders/solidrect.glsl.js";
import textured_rect_shaders from "./shaders/texrect.glsl.js";

let canvas = document.querySelector("#screen");


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
    shaders: shaders
});

// solid rects

window.rect = new RenderableSolidRect("renderable", "rect1", 50, 50, color(1.0,1.0,1.0));
window.rect2 = new RenderableSolidRect("renderable", "rect2", 50, 50);
window.pos  = vMath.vec3(100, 100);
window.pos2  = vMath.vec3(50, 50);

// textured rect


// for testing
window.vMath = vMath;
window.mMath = mMath;


window.run = () => {
    "use strict";

    window.rect3 = new RenderableTexturedRect("renderable", "texrect", 32, 32, undefined, image,
        image.width,      image.height,
        vMath.vec2(0, 0), vMath.vec2(image.width, image.height));
    window.pos3 = vMath.vec3(250, 250);

    g.render.update();
    g.render.draw(rect, pos);
    g.render.draw(rect2, pos2, {
        //rotate: Math.PI / 4,
        //scale: vMath.vec2(0.5, 0.5)
    });

    g.render.draw(rect3, pos3);
};

let image = new Image();
image.__loaded = false;
image.onload = () => {
    "use strict";
    image.__loaded = true;
    run();
};
image.src = 'img/man.png';
