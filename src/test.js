/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {Registry} from './component.js';
import {RenderableSolidRect, RenderableTexturedRect} from './render.js';
import Position from './position.js';
import {vMath, mMath, color} from './utils.js';
import solid_rect_shaders from "./shaders/solidrect.glsl.js";
import textured_rect_shaders from "./shaders/texrect.glsl.js";
import Scene from './scene.js';
import Entity from './entity.js';

let canvas = document.querySelector("#screen");

let entities = [];
let s = null;

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

        entities.push(new Entity("whiterect", [
            new RenderableSolidRect("renderable", "rect1", 50, 50, color(1.0,1.0,1.0)),
            new Position("position", "pos1", vMath.vec3(100, 100))
        ]));

        entities.push(new Entity("blackrect", [
            new RenderableSolidRect("renderable", "rect2", 50, 50),
            new Position("position", "pos2", vMath.vec3(50, 50))
        ]));

        entities.push(new Entity("man", [
            new RenderableTexturedRect("renderable", "texrect", 32, 32, undefined, man,
                man.width,        man.height,
                vMath.vec2(0, 0), vMath.vec2(man.width, man.height)),
            new Position("position", "pos3", vMath.vec3(250, 250))
        ]));

        s = new Scene("scene1", entities);
        this.addScene(s);
        this.loadScene(s);

        // for testing
        window.vMath = vMath;
        window.mMath = mMath;

    })
    .step(function (dt) {
        "use strict";

        let position   = Registry.getFlag("position");

        let e_pos = entities[2].getComponent(position)[0];
        let {x, y} = this.__input.__mouse_state.pos;
        e_pos.x = x;
        e_pos.y = y;
    })
    .run();