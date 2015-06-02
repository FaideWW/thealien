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
import {IdleState, IdleStateSystem, MovingDownStateSystem, MovingUpStateSystem} from './state.js';
import CollisionDetectionSystem from './collisiondetection.js';
import CollisionResolutionSystem from './collisionresolution.js';
import AABBCollidable from './collidable.js';
import Map from './map.js';
import SpriteLoader from "./sprite.js";

let canvas = document.querySelector("#screen");

let entities = [];
let s = null;

let shaders = {
        solid_rect: solid_rect_shaders,
        textured_rect: textured_rect_shaders
    },
    twidth = 64,
    theight = 64;

window.g = new Game({
    canvasSelector: "#screen",
    resolution: {
        width: canvas.clientWidth,
        height: canvas.clientHeight
    },
    shaders: shaders,
    phases: ['state', 'collision', 'physics'],
    systems: {
        state: [
            new IdleStateSystem(),
            new MovingDownStateSystem(),
            new MovingUpStateSystem()
        ],
        physics: [
            new CollisionDetectionSystem(),
            new CollisionResolutionSystem(),
            new PhysicsSystem(),
        ]
    }
})
    .resource({
        player_data: {
            type: 'json',
            path: 'assets/json/player.json'
        },
        player_sheet: {
            type: 'image',
            path: 'assets/img/player.png'
        },
        map_tile_data: {
            type: 'json',
            path: 'assets/json/maptiles.json'
        },
        map_tile_sheet: {
            type: 'image',
            path: 'assets/img/map.png'
        },
        map_layout_data: {
            type: 'json',
            path: 'assets/json/map0.json'
        }
    })

    .then(function (resources) {
        "use strict";

        // generate sprites and shitsprite_data = {
        let sprite_data = {
                map: {
                    texture: resources.image.map_tile_sheet,
                    sheet: resources.json.map_tile_data
                },
                jetroid: {
                    texture: resources.image.player_sheet,
                    sheet:   resources.json.player_data
                }
            };
        resources.sprites = SpriteLoader(resources.image, sprite_data);

        return resources;
    })
    .catch(function (error) {
        "use strict";
        console.error(`error: ${error}`);
    })

    .ready(function (resources) { // don't use arrow here, we need to preserve execution context
        "use strict";

        let sprites = resources.sprites;

        // solid rects
        let {vec2, vec3} = vMath;

        entities.push(new Entity("whiterect", [
            new RenderableSolidRect("rect1", 50, 50, color(1.0,1.0,1.0,0.0)),
            new Position("pos1", vec3(150, 150))
            //new AABBCollidable("col1", 50, 50)
        ]));

        entities.push(new Entity("blackrect", [
            new RenderableSolidRect("rect2", 50, 50),
            new Position("pos2",vec3(50, 50))
            //new AABBCollidable("col2", 50, 50)
        ]));

        entities.push(new Entity("man", [
            new RenderableTexturedRect("texrect", 32, 32, sprites.jetroid.jump2),
            new Position("pos3", vec3(83, 450)),
            new Movable("mov1", vec2(0, 0), undefined, 10),
            new AABBCollidable("man_collider", 32, 32),
            new IdleState()
        ]));

        console.log(sprites.map);

        let m = new Map(sprites.map,
            vec2(25, 25),
            resources.json.map_layout_data.data
            );

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
    //
        let position   = Registry.getFlag("position");
        let movable = Registry.getFlag("movable");
        let renderable = Registry.getFlag("renderable");
        let collidable = Registry.getFlag("collidable");
        let state      = Registry.getFlag("state");
    //
    //    // circle routine
    //
    //    //let e_vel = entities[2].get(movable).velocity;
    //    //
    //    //persist.time   = persist.time   || 0;
    //    //persist.radius = persist.radius || 100;
    //    //persist.period = persist.period || 5000;
    //    //
    //    //
    //    //persist.time += dt;
    //    //
    //    //let interval = (persist.time / persist.period) * Math.PI * 2;
    //    //
    //    //e_vel.x = (persist.radius * Math.cos(interval));
    //    //e_vel.y = (persist.radius * Math.sin(interval));
    //
    //
        let mouse = this.input.mouse.pos;

        let rect_pos = entities[1].get(position);
        rect_pos.x = mouse.x;
        rect_pos.y = mouse.y;
    //
    //    let rect_collidable = entities[1].get(collidable);
    //    let rect_renderable = entities[1].get(renderable);
    //
    //    let fill;
    //    if (rect_collidable.__collided) {
    //        fill = color(1.0, 0.0, 0.0);
    //    } else {
    //        fill = color(0.0, 0.0, 0.0);
    //    }
    //
    //    rect_renderable.color = fill;
    //
    //
        return persist;
    })
    .run();