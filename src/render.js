/**
 * Created by faide on 2015-04-01.
 */
"use strict";

// TODO: lots of optimizations can be made here; e.g. binding attribute buffers on every draw call is pretty expensive
/**
 * solution: batch draw calls
 *
 * TODO: use WebGL inspector to help reduce unnecessary calls
 *
 * sort draws with the following priority: same shader program -> same attributes -> same texture -> same uniforms
 *
 * http://stackoverflow.com/questions/15561871/the-fastest-way-to-batch-calls-in-webgl
 *
 *
 * scratch notes
 *
 * currently:
 *
 *   each update():
 *     gl.clear()
 *
 *     drawMap() * 1
 *
 *     drawTexturedRect() * num textured rects (1-10)
 *
 *  each drawMap():
 *      drawTexturedRct() num map tiles (100+)
 *
 *
 * each drawTexturedRect():    // associated batch level; these can be sorted as shader > texture > renderable
 *     activeTexture           - texture
 *     bindTexture             - texture
 *     useProgram              - shader
 *     getAttribLocation       - shader
 *     enableVertexAttribArray - shader
 *     getAttribLocation       - shader
 *     enableVertexAttibArray  - shader
 *     bindBuffer              - renderable
 *     bufferData              - renderable
 *     vertexAttribPointer     - renderable
 *     bindBuffer              - renderable
 *     bufferData              - renderable
 *     vertexAttribPointer     - renderable
 *     getUniformLocation      - shader
 *     uniformMatrix4fv        - renderable
 *     getUniformLocation      - shader
 *     uniformMatrix4fv        - renderable
 *     getUniformLocation      - shader
 *     uniform1i               - texture (sampler)
 *     getUniformLocation      - shader
 *     uniform1f               - renderable
 *
 *  some notes about optimization:
 *
 *  if we can sort renderables based on textures, we can save a lot of graphics memory by calling glBindTexture() ONCE
 *  per texture, instead of per renderable
 *
 *  if we can further sort texture batches based on shader used, we can save more by calling useProgram ONCE per shader
 *   - in addition to useProgram, we only need to cal getUniformLocation once per uniform (for the texture shader, 4 uniforms)
 *   - ^ furthermore the texture sampler uniform only needs to be bound once
 *   - getAttribLocation is also called once per attribute (for texture shader, 2 attributes)
 *
 *  =========== greatest performance gain (theoretically)
 *  if we can generate vertex and texture coordinate arrays for large batches of renderables (i.e. maps), we can:
 *   - reduce number of buffers to 2 per batch
 *   - call bindBuffer and bufferData twice per batch
 *   - send shader attribute and uniform data once per batch
 *   - drawArrays called once per batch
 *
 */

import {Component, Registry} from "./component.js";
import {vMath, mMath, color} from "./utils.js";
import GameSystem from './system.js';
let  {floor} = Math;

let uid = 0;

export default class WebGLRenderer extends GameSystem {
    constructor(s_id =`webglrenderer${uid++}`, opts = {}) {
        super(s_id, ['renderable', 'position']);
        if (!(opts.el && opts.resolution)) {
            return;
        }

        let {el: el,
                shaders: shader_programs,
                resolution: res,
                } = opts;

        /* https://www.khronos.org/webgl/wiki/HandlingHighDPI */

        el.style.width  = `${res.width}px`;
        el.style.height = `${res.height}px`;

        let device_pixel_ratio = window.devicePixelRatio || 1;

        el.width  = res.width  * device_pixel_ratio;
        el.height = res.height * device_pixel_ratio;

        this._resolution = vMath.vec3(res.width, res.height, 1);
        // used to send the resolution as a uniform variable to the vertex shader
        this._resolution_array = new Float32Array([el.width, el.height, 1.0]);


        try {
            this._ctx = el.getContext('webgl', {
            }) || el.getContext("experimental-webgl", {
            });
        } catch (e) {
            console.error(e);
        }

        if (!this._ctx) {
            // TODO: figure out a way to fallback into canvas renderer in a concise way
            this.success = false;
            return;
        } else {
            this.success = true;
        }

        // init the canvas (from MDN)
        let gl = this._ctx;

        if (gl) {
            gl.clearColor(1.0, 0.0, 1.0, 1.0);                      // Set clear color to black, fully opaque
            gl.disable(gl.DEPTH_TEST);                               // Enable depth testing
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        }

        this._textures = {};

        // one set of shaders per renderable type
        this._shaders = {};
        for (let mode in shader_programs) {
            if (shader_programs.hasOwnProperty(mode)) {
                this._shaders[mode] = this._initShaderProgram(shader_programs[mode]);
            }
        }

        this._ctx.viewport(0, 0, this._resolution.x * device_pixel_ratio, this._resolution.y * device_pixel_ratio);

    }

    get lock() {
        return this._lock;
    }

    _initShader(shader_type, shader_source) {
        let gl = this.ctx;

        let shader;


        shader = gl.createShader(shader_type);

        gl.shaderSource(shader, shader_source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader: ${ gl.getShaderInfoLog(shader) }. `);
            return null;
        }

        return shader;
    }

    _initShaderProgram(args) {
        let gl = this.ctx;

        let {fragment_source, vertex_source} = args;

        // attempt to compile shaders
        let fs = this._initShader(gl.FRAGMENT_SHADER, fragment_source);
        let vs = this._initShader(gl.VERTEX_SHADER, vertex_source);

        let program = gl.createProgram();


        this._shader_program = gl.createProgram();
        gl.attachShader(program, fs);
        gl.attachShader(program, vs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Error linking shader program. `);
        }

        return program;

    }

    _initTexture(image) {

        // cache any already loaded textures
        if (this._textures[image.src]) return this._textures[image.src];

        let gl = this.ctx;

        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._textures[image.src] = texture;

        return texture;
    }

    get ctx() {
        return this._ctx;
    }

    update(scene, dt) {
        let frenderable = Registry.getFlag('renderable');
        let fposition   = Registry.getFlag('position');
        //if (!this.__lock && renderable && position) {
        //    this.__lock = renderable | position;
        //}

        this.clear();

        if (scene.map) {
            this.drawMap(scene.map);
        }

        scene.each((e) => {
            let position = e.get(fposition);
            let renderable = e.get(frenderable);

            this.draw(renderable, position);

        }, this.lock);
    }

    clear() {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
    }

    draw(renderable, position = vMath.vec3(), transform = {}) {
        // set up projection matrix and transformation matrix

        //let perspective_matrix = mMath.perspective(45, 640.0/480.0, 0.1, 100.0);

        let ortho_matrix = mMath.orthographic(0, this._resolution.x, this._resolution.y, 0, 0, 10);

        let transformation_matrix = mMath.compose()
            .translate(position);

        if (transform.rotate) {
            transformation_matrix.rotate(transform.rotate);
        }
        if (transform.scale) {
            transformation_matrix.scale(transform.scale);
        }

        let pMatrix = new Float32Array(mMath.flatten(ortho_matrix));
        let tMatrix = new Float32Array(mMath.flatten(transformation_matrix.done()));


        // use subroutine to draw the shape
        if (renderable.type === 'solidrect') {
            this._drawSolidRect(renderable, pMatrix, tMatrix);
        } else if (renderable.type === 'texturedrect') {
            this._drawTexturedRect(renderable, pMatrix, tMatrix);
        }
    }

    // TODO: when camera functionality is added, maporigin will change to camera offset
    drawMap(map, map_origin = vMath.vec2()) {
        let tileW = map.tilewidth;
        let tileH = map.tileheight;

        map.render.forEach((layer) => {

            for (let y = 0; y < layer.length; y += 1) {
                for (let x = 0; x < layer[y].length; x += 1) {
                    let tile = layer[y][x];
                    if (tile === 0) continue;

                    let renderable = map.tiles[tile];

                    if (renderable) {
                        let tile_position = vMath.vec2(tileW * (x + 0.5), tileH * (y + 0.5));
                        this.draw(renderable, vMath.add(map_origin, tile_position));
                    }
                }
            }
        });
    }

    _sortRenderablesByTexture(entities) {
        const frenderable = Registry.getFlag('renderable');
        let tex_array = {};
        for (let e in entities) {
            if (entities.hasOwnProperty(e)) {
                const renderable = e.get(frenderable);

            }
        }
    }

    // draw subroutines
    _drawSolidRect(renderable, pMatrix, tMatrix) {

        // these are pre-formatted Float32Arrays
        let color = renderable.color,
            verts = renderable.verts,
            gl    = this.ctx,
            shader = this._shaders.solid_rect;


        gl.useProgram(shader);


        // TODO: does this attach to the renderable?
        let vertex_position_attribute = gl.getAttribLocation(shader, "aVertexPosition");
        gl.enableVertexAttribArray(vertex_position_attribute);
        let vertex_color_attribute = gl.getAttribLocation(shader, "aVertexColor");
        gl.enableVertexAttribArray(vertex_color_attribute);


        let vertices_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertex_position_attribute, 3, gl.FLOAT, false, 0, 0);

        let color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertex_color_attribute, 4, gl.FLOAT, false, 0, 0);


        // declare uniform variables
        let pUniform = gl.getUniformLocation(shader, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, pMatrix);
        let mvUniform = gl.getUniformLocation(shader, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, tMatrix);


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }

    _drawTexturedRect(renderable, pMatrix, tMatrix) {
        if (renderable.initialized === false) {
            renderable.gl_texture = this._initTexture(renderable.sprite.texture.img);
            renderable.initialized = true;
        }

        let gl = this.ctx,
            shader = this._shaders.textured_rect;
        let {gl_texture, verts} = renderable;
        let tex_coords = renderable.sprite.coords;

        if (!renderable.__shaderBuffers) {
            renderable.__shaderBuffers = {
                texture: gl.createBuffer(),
                vertices: gl.createBuffer()
            };
        }

        // activate the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl_texture);

        gl.useProgram(shader);

        let vertex_position_attribute,
            texture_coordinate_attribute;

        // TODO: does this attach to the renderable?
        vertex_position_attribute = gl.getAttribLocation(shader, "aVertexPosition");
        gl.enableVertexAttribArray(vertex_position_attribute);
        texture_coordinate_attribute = gl.getAttribLocation(shader, "aTextureCoord");
        gl.enableVertexAttribArray(texture_coordinate_attribute);

        let texture_buffer = renderable.__shaderBuffers.texture;
        gl.bindBuffer(gl.ARRAY_BUFFER, texture_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, tex_coords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(texture_coordinate_attribute, 2, gl.FLOAT, false, 0, 0);

        let vertices_buffer = renderable.__shaderBuffers.vertices;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertex_position_attribute, 3, gl.FLOAT, false, 0, 0);

        // declare uniform variables

        let pUniform = gl.getUniformLocation(shader, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, pMatrix);

        let mvUniform = gl.getUniformLocation(shader, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, tMatrix);

        let texSampler = gl.getUniformLocation(shader, "uSampler");
        gl.uniform1i(texSampler, 0);

        let alpha = gl.getUniformLocation(shader, "uAlpha");
        gl.uniform1f(alpha, renderable.opacity);


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }
}