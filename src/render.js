/**
 * Created by faide on 2015-04-01.
 */
"use strict";

import {Component, Registry} from "./component.js";
import {vMath, mMath, color} from "./utils.js";
let  {floor} = Math;


export default class WebGLRenderer {
    constructor(opts) {
        if (!(opts.el && opts.resolution)) {
            return;
        }

        this.__lock = 0;

        let {el: el,
                shaders: shader_programs,
                resolution: res,
                } = opts;

        /* https://www.khronos.org/webgl/wiki/HandlingHighDPI */

        el.style.width  = `${res.width}px`;
        el.style.height = `${res.height}px`;

        let device_pixel_ratio = window.devicePixelRatio || 1;
        console.log(device_pixel_ratio);

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
        return this.__lock;
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
        let gl = this.ctx;

        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    }

    get ctx() {
        return this._ctx;
    }

    update(scene, dt) {
        let renderable = Registry.flags.renderable;
        let position   = Registry.flags.position;
        if (!this.__lock && renderable && position) {
            this.__lock = renderable | position;
        }


            this.clear();
        scene.each((e) => {
            let e_pos = e.getComponent(position);
            let e_ren = e.getComponent(renderable);

            this.draw(e_ren, e_pos);

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


        // use subroutine to draw the shape
        if (renderable.type === 'solidrect') {
            this._drawSolidRect(renderable, ortho_matrix, transformation_matrix.done());
        } else if (renderable.type === 'texturedrect') {
            this._drawTexturedRect(renderable, ortho_matrix, transformation_matrix.done());
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
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(mMath.flatten(pMatrix)));
        let mvUniform = gl.getUniformLocation(shader, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mMath.flatten(tMatrix)));


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }

    _drawTexturedRect(renderable, pMatrix, tMatrix) {
        if (renderable.initialized === false) {
            renderable.gl_texture = this._initTexture(renderable.tex_data);
            renderable.initialied = true;
        }

        let gl = this.ctx,
            shader = this._shaders.textured_rect;
        let {gl_texture, tex_coords, verts} = renderable;

        // activate the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl_texture);

        gl.useProgram(shader);


        // TODO: does this attach to the renderable?
        let vertex_position_attribute = gl.getAttribLocation(shader, "aVertexPosition");
        gl.enableVertexAttribArray(vertex_position_attribute);
        let texture_coordinate_attribute = gl.getAttribLocation(shader, "aTextureCoord");
        gl.enableVertexAttribArray(texture_coordinate_attribute);

        let texture_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texture_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, tex_coords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(texture_coordinate_attribute, 2, gl.FLOAT, false, 0, 0);

        let vertices_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertex_position_attribute, 3, gl.FLOAT, false, 0, 0);


        // declare uniform variables
        let pUniform = gl.getUniformLocation(shader, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(mMath.flatten(pMatrix)));
        let mvUniform = gl.getUniformLocation(shader, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mMath.flatten(tMatrix)));

        let texSampler = gl.getUniformLocation(shader, "uSampler");
        gl.uniform1i(texSampler, 0);

        let alpha = gl.getUniformLocation(shader, "uAlpha");
        gl.uniform1f(alpha, renderable.opacity);


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }
}