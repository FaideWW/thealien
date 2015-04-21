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
    shaders: shaders,
    images: {
        man: 'img/man.png'
    }
}).ready(function (images) { // don't use arrow here, we need to preserve execution context
        "use strict";

        // solid rects
        let {man} = images;

        let rect = new RenderableSolidRect("renderable", "rect1", 50, 50, color(1.0,1.0,1.0));
        let pos  = vMath.vec3(100, 100);

        let rect2 = new RenderableSolidRect("renderable", "rect2", 50, 50);
        let pos2  = vMath.vec3(50, 50);


        let rect3 = new RenderableTexturedRect("renderable", "texrect", 32, 32, undefined, man,
                                                man.width,        man.height,
                                                vMath.vec2(0, 0), vMath.vec2(man.width, man.height));
        let pos3 = vMath.vec3(250, 250);

        // for testing
        window.vMath = vMath;
        window.mMath = mMath;


        window.run = () => {
            "use strict";
            this.render.update();
            this.render.draw(rect, pos);
            this.render.draw(rect2, pos2, {
                //rotate: Math.PI / 4,
                //scale: vMath.vec2(0.5, 0.5)
            });

            this.render.draw(rect3, pos3);
        };
    });