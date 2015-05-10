/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {Registry} from './component.js';
import {RenderableSolidRect, RenderableTexturedRect} from './renderable.js';
import Position from './position.js';
import {vMath, mMath, color} from './utils.js';
import solid_rect_shaders from "./shaders/solidrect.glsl.js";
import textured_rect_shaders from "./shaders/texrect.glsl.js";
import Scene from './scene.js';
import Entity from './entity.js';
import {PhysicsSystem, Movable} from './physics.js';
import CollisionSystem from './collision.js';
import AABBCollidable from './collidable.js';
import Map from './map.js';

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
        width:  canvas.clientWidth,
        height: canvas.clientHeight
    },
    shaders: shaders,
    images: {
        man: 'img/man.png',
        map: 'img/map.png'
    },
    phases: ['collision', 'physics'],
    systems: {
        physics: [
            new PhysicsSystem("physics", ["position", "movable"]),
            new CollisionSystem("collision", ["position", "collidable"])
        ]
    }
})
    .ready(function (images) { // don't use arrow here, we need to preserve execution context
        "use strict";

        // solid rects
        let {man, map} = images;
        let {vec2, vec3} = vMath;

        entities.push(new Entity("whiterect", [
            new RenderableSolidRect("rect1", 50, 50, color(1.0,1.0,1.0,0.0)),
            new Position("pos1", "position", vec3(150, 150)),
            new AABBCollidable("col1", 50, 50)
        ]));

        entities.push(new Entity("blackrect", [
            new RenderableSolidRect("rect2", 50, 50),
            new Position("pos2", "position",vec3(50, 50)),
            new AABBCollidable("col2", 50, 50)
        ]));

        entities.push(new Entity("man", [
            new RenderableTexturedRect("texrect", 32, 32, undefined, man,
                man.width,        man.height,
                vec2(0, 0), vec2(man.width, man.height)),
            new Position("pos3", "position",vec3(250, 250)),
            new Movable("mov1", "movable", vec2(20, 0))
        ]));

        let tsize = vec2(64, 64);
        let m = new Map(map, {
            1: {
                origin: vec2(0,0),
                size: tsize
            },
            2: {
                origin: vec2(64,0),
                size: tsize
            },
            3: {
                origin: vec2(0,64),
                size: tsize
            },
            4: {
                origin: vec2(64, 64),
                size: tsize
            }
        },
            vec2(25, 25),
        [
            {
                collidable: true,
                data:  [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
            }
        ]);

        s = new Scene("scene1", entities, m);
        this.addScene(s);
        this.loadScene(s);

        // for testing
        window.map   = m;
        window.vMath = vMath;
        window.mMath = mMath;

    })
    .step(function (dt, persist) {
        "use strict";

        let position   = Registry.getFlag("position");
        let movable = Registry.getFlag("movable");
        let renderable = Registry.getFlag("renderable");
        let collidable = Registry.getFlag("collidable");

        let e_vel = entities[2].getComponent(movable).velocity;

        persist.time   = persist.time   || 0;
        persist.radius = persist.radius || 100;
        persist.period = persist.period || 5000;


        // circle routine

        persist.time += dt;

        let interval = (persist.time / persist.period) * Math.PI * 2;

        e_vel.x = (persist.radius * Math.cos(interval));
        e_vel.y = (persist.radius * Math.sin(interval));


        let mouse = this.input.mouse.pos;

        let rect_pos = entities[1].getComponent(position);
        rect_pos.x = mouse.x;
        rect_pos.y = mouse.y;

        let rect_collidable = entities[1].getComponent(collidable);
        let rect_renderable = entities[1].getComponent(renderable);

        let fill;
        if (rect_collidable.__collided) {
            fill = color(1.0, 0.0, 0.0);
        } else {
            fill = color(0.0, 0.0, 0.0);
        }

        // TODO: there has to be a better way to handle colors
        rect_renderable.color = fill;

        this.render.draw(this.activeScene.map.tiles[1], vMath.vec2(200, 200));
        this.render.draw(this.activeScene.map.tiles[2], vMath.vec2(265, 200));
        this.render.draw(this.activeScene.map.tiles[3], vMath.vec2(200, 265));
        this.render.draw(this.activeScene.map.tiles[4], vMath.vec2(265, 265));

        this.render.draw(this.activeScene.map.tiles[1], vMath.vec2(400, 200), {rotate: Math.PI / 4});

        return persist;
    })
    .run();