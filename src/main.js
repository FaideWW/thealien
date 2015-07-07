/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {Registry} from './component.js';
import {RenderableSolidRect, RenderableTexturedRect} from './renderable.js';
import Position from './position.js';
import {vMath, mMath, color} from './utils.js';
import Scene from './scene.js';
import Entity from './entity.js';
import {PhysicsSystem, Movable} from './physics.js';
import {XMotionStateManager, YMotionStateManager, Stateful} from './state.js';
import CollisionDetectionSystem from './collisiondetection.js';
import CollisionResolutionSystem from './collisionresolution.js';
import AABBCollidable from './collidable.js';
import Map from './map.js';
import SpriteLoader from './sprite.js';
import {Animatable, AnimationSystem, Animation} from './animation.js';
import {PlayerControllable, PlayerControllerSystem} from './controller.js';

const canvas = document.querySelector('#screen');

const entities = [];
let s = null;

const twidth = 64;
const theight = 64;

window.g = new Game({
  canvasSelector: '#screen',
  resolution: {
    width: canvas.clientWidth,
    height: canvas.clientHeight
  },

  //shaders: shaders,
  phases: ['state', 'collision', 'physics', 'draw'],
  systems: {
    state: [
      new XMotionStateManager(),
      new YMotionStateManager()

      //new MovingDownStateSystem(),
      //new MovingUpStateSystem()
    ],
    physics: [
      new PlayerControllerSystem(),
      new PhysicsSystem(),
      new CollisionDetectionSystem()

      //new CollisionResolutionSystem(),
    ],
    draw: [
      new AnimationSystem()
    ]
  }
})
    .resource({
      playerData: {
        type: 'json',
        path: 'assets/json/player.json'
      },
      playerSheet: {
        type: 'image',
        path: 'assets/img/player.png'
      },
      mapTileData: {
        type: 'json',
        path: 'assets/json/maptiles.json'
      },
      mapTileSheet: {
        type: 'image',
        path: 'assets/img/map.png'
      },
      mapLayoutData: {
        type: 'json',
        path: 'assets/json/map0.json'
      },
      texturedrectVertShader: {
        type: 'shader',
        path: 'assets/shaders/texturedrect/vertex.glsl'
      },
      texturedrectFragShader: {
        type: 'shader',
        path: 'assets/shaders/texturedrect/fragment.glsl'
      },
      solidrectVertShader: {
        type: 'shader',
        path: 'assets/shaders/solidrect/vertex.glsl'
      },
      solidrectFragShader: {
        type: 'shader',
        path: 'assets/shaders/solidrect/fragment.glsl'
      }
    })

  // compile shaders
    .then(function(resources) {
      'use strict';

      this.render.addShader('solidRect', {
            fragment: resources.shader.solidrectFragShader,
            vertex: resources.shader.solidrectVertShader
          },
          ['vertices', 'color'],
          ['uPMatrix', 'uMVMatrix'],
          ['aVertexPosition', 'aVertexColor']
      );
      this.render.addShader('texturedRect', {
            fragment: resources.shader.texturedrectFragShader,
            vertex: resources.shader.texturedrectVertShader
          },
          ['vertices', 'texture'],
          ['uPMatrix', 'uMVMatrix', 'uSampler', 'uAlpha'],
          ['aVertexPosition', 'aTextureCoord']
      );

      return resources;
    })
    .onFail(function(error) {
      'use strict';
      console.error(`Error compiling shaders: ${error}`)
    })

  // build sprites and textures
    .then(function(resources) {
      'use strict';

      // generate sprites and shitsprite_data = {
      let spriteData = {
        map: {
          texture: resources.image.mapTileSheet,
          sheet: resources.json.mapTileData
        },
        jetroid: {
          texture: resources.image.playerSheet,
          sheet: resources.json.playerData
        }
      };
      resources.sprites = SpriteLoader(resources.image, spriteData);

      return resources;
    })
    .onFail(function(error) {
      'use strict';
      console.error(`error: ${error}`);
    })

  // create animations
    .then(function(resources) {
      'use strict';
      const sprites = resources.sprites;
      const renderables = {};
      const animations = {};

      for (let spriteName in sprites.jetroid) {
        if (sprites.jetroid.hasOwnProperty(spriteName)) {
          const sprite = sprites.jetroid[spriteName];
          renderables[spriteName] = new RenderableTexturedRect(spriteName, 32, 32, sprite);
        }
      }

      const idleFrames = [
        renderables.idle0,
        renderables.idle1,
        renderables.idle2,
        renderables.idle3,
        renderables.idle4,
        renderables.idle5,
        renderables.idle6,
        renderables.idle7,
        renderables.idle8,
        renderables.idle9
      ];
      const walkFrames = [
        renderables.walk0,
        renderables.walk1,
        renderables.walk2,
        renderables.walk3,
        renderables.walk4,
        renderables.walk5,
        renderables.walk6,
        renderables.walk7
      ];
      const jumpFrames = [
        renderables.jump0,
        renderables.jump1,
        renderables.jump2,
        renderables.jump3,
        renderables.jump4
      ];

      animations.idleleft = new Animation(idleFrames, 15, true, mMath.flipx());
      animations.idleright = new Animation(idleFrames, 15, true);
      animations.walkleft = new Animation(walkFrames, 15, true, mMath.flipx());
      animations.walkright = new Animation(walkFrames, 15, true);
      animations.jumpleft = new Animation(jumpFrames, 15, false, mMath.flipx());
      animations.jumpright = new Animation(jumpFrames, 15, false);

      resources.animations = animations;
      return resources;
    })

    .ready(function(resources) { // don't use arrow here, we need to preserve execution context
      'use strict';

      const sprites = resources.sprites;

      // solid rects
      let {vec2, vec3} = vMath;

      entities.push(new Entity('blackrect', [
        new RenderableSolidRect('rect2', 20, 20),
        new Position('pos2', vec3(50, 50))

        //new AABBCollidable('col2', 50, 50)
      ]));

      entities.push(new Entity('man', [

        //new RenderableTexturedRect('texrect', 32, 32, sprites.jetroid.jump2),
        new Animatable('player', {
          idleleft: resources.animations.idleleft,
          idleright: resources.animations.idleright,
          walkleft: resources.animations.walkleft,
          walkright: resources.animations.walkright,
          jumpleft: resources.animations.jumpleft,
          jumpright: resources.animations.jumpright
        }, 'idleright'),
        new Position('pos3', vec3(83, 450)),
        new Movable('mov1', vec2(0, 0), undefined, 10),
        new AABBCollidable('man_collider', 32, 32),
        new Stateful('playerstate', {
          xmotion: 'idle',
          ymotion: 'inair'
        }),
        new PlayerControllable('player_control')
      ]));

      //entities.push(new Entity('man2', [
      //    //new RenderableTexturedRect('texrect', 32, 32, sprites.jetroid.jump2),
      //    new Animatable('walktest', {
      //        walk: resources.animations.walk
      //    }, 'walk'),
      //    new Position('pos3', vec3(300, 450)),
      //    new Movable('mov1', vec2(0, 0), undefined, 10),
      //    new AABBCollidable('man_collider', 32, 32),
      //]));

      let m = new Map(sprites.map,
          vec2(25, 25),
          resources.json.mapLayoutData.data,
          resources.image.mapTileSheet
      );

      s = new Scene('scene1', entities, m);
      this.addScene(s);
      this.loadScene(s);

      // for testing
      window.map = m;
      window.vMath = vMath;
      window.mMath = mMath;

    })
    .step(function(dt, persist) {
      'use strict';

      //
      let position = Registry.getFlag('position');
      let movable = Registry.getFlag('movable');
      let renderable = Registry.getFlag('renderable');

      //let collidable = Registry.getFlag('collidable');
      let fstate = Registry.getFlag('state');

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

      let rectPos = entities[0].get(position);
      rectPos.x = mouse.x;
      rectPos.y = mouse.y;

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
