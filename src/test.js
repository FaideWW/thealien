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
import {PhysicsSystem, Movable} from './physics.js';

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
    },
    phases: ['physics'],
    systems: {
        physics: [
            new PhysicsSystem("physics", ["position", "movable"])
        ]
    }
})
    .ready(function (images) { // don't use arrow here, we need to preserve execution context
        "use strict";

        // solid rects
        let {man} = images;

        entities.push(new Entity("whiterect", [
            new RenderableSolidRect("rect1", "renderable", 50, 50, color(1.0,1.0,1.0)),
            new Position("pos1", "position", vMath.vec3(100, 100))
        ]));

        entities.push(new Entity("blackrect", [
            new RenderableSolidRect("rect2", "renderable", 50, 50),
            new Position("pos2", "position", vMath.vec3(50, 50))
        ]));

        entities.push(new Entity("man", [
            new RenderableTexturedRect("texrect", "renderable", 50, 50, undefined, man,
                man.width,        man.height,
                vMath.vec2(0, 0), vMath.vec2(man.width, man.height)),
            new Position("pos3", "position", vMath.vec3(250, 250)),
            new Movable("mov1", "movable", vMath.vec2(20, 0))
        ]));

        s = new Scene("scene1", entities);
        this.addScene(s);
        this.loadScene(s);

        // for testing
        window.vMath = vMath;
        window.mMath = mMath;

    })
    .step(function (dt, persist) {
        "use strict";

        let position   = Registry.getFlag("position");

        let e_pos = entities[2].getComponent(position);
        let {x, y} = e_pos;

        persist.time   = persist.time   || 0;
        persist.radius = persist.radius || 200;
        persist.center = persist.center || { x: e_pos.x, y: e_pos.y};
        persist.period = persist.period || 5000;


        // circle routine

        persist.time += dt;

        let interval = (persist.time / persist.period) * Math.PI * 2;

        e_pos.x = persist.center.x + (persist.radius * Math.cos(interval));
        e_pos.y = persist.center.y + (persist.radius * Math.sin(interval));

        return persist;
    })
    .run();