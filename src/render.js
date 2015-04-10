/**
 * Created by faide on 2015-04-01.
 */
"use strict";

import {Component} from "./component.js";
import {vMath, mMath, color} from "./utils.js";
let  {floor} = Math;


// TODO: implement untextured rect rendering
class WebGLRenderer {
    constructor(opts) {
        if (!(opts.el && opts.resolution)) {
            return;
        }

        let {el: el,
                shaders: shader_programs,
                resolution: res
                } = opts;

        /* https://www.khronos.org/webgl/wiki/HandlingHighDPI */

        el.style.width  = `${res.width}px`;
        el.style.height = `${res.height}px`;

        let device_pixel_ratio = window.devicePixelRatio || 1;

        el.width  = res.width  * device_pixel_ratio;
        el.height = res.height * device_pixel_ratio;

        this._resolution = vMath.vec3(el.width, el.height, 1);
        // used to send the resolution as a uniform variable to the vertex shader
        this._resolution_array = new Float32Array([el.width, el.height, 1.0]);



        try {
            this._ctx = el.getContext('webgl') || el.getContext("experimental-webgl");
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

        if (this._ctx) {
            this._ctx.clearColor(1.0, 0.0, 1.0, 1.0);                      // Set clear color to black, fully opaque
            this._ctx.enable(this._ctx.DEPTH_TEST);                               // Enable depth testing
            this._ctx.depthFunc(this._ctx.LEQUAL);                                // Near things obscure far things
            this._ctx.clear(this._ctx.COLOR_BUFFER_BIT|this._ctx.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        }

        // one set of shaders per renderable type
        this._shaders = {};
        for (let mode in shader_programs) {
            if (shader_programs.hasOwnProperty(mode)) {
                this._shaders[mode] = this._initShaderProgram(shader_programs[mode]);
            }
        }



        this._ctx.viewport(0, 0, this._resolution.x, this._resolution.y);

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

    get ctx() {
        return this._ctx;
    }

    update(scene, dt) {
        this.clear();
    }

    clear() {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
    }

    draw(renderable, position = vMath.vec3(), transform = {}) {
        let gl = this.ctx;

        // clear the screen

        // set up projection matrix and transformation matrix

        //let perspective_matrix = mMath.perspective(45, 640.0/480.0, 0.1, 100.0);
        let ortho_matrix = mMath.orthographic(0, this._resolution.x / 2, 0, this._resolution.y / 2, 0, 10);

        let transformation_matrix = mMath.compose()
            .translate(position);

        if (transform.rotate) {
            transformation_matrix.rotate(transform.rotate);
        }
        if (transform.scale) {
            transformation_matrix.scale(transform.scale);
        }


        // use subroutine to draw the shape
        if (renderable.type === 'rect') {
            this._drawRect(renderable, ortho_matrix, transformation_matrix.done());
        }
    }

    // draw subroutines
    _drawRect(renderable, pMatrix, tMatrix) {

        // these are pre-formatted Float32Arrays
        let color = renderable.color,
            verts = renderable.verts,
            gl    = this.ctx,
            shader = this._shaders.rect;


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
        let resUniform = gl.getUniformLocation(shader, "uResolution");
        gl.uniform3fv(resUniform, this._resolution_array);


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }
}


// TODO: To facilitate webgl rendering, we should store vertex data here without having to decode it. Factory pattern?
class RenderableRect extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        let [half_width = 0, half_height = 0, fill = color(), origin = vMath.vec3()] = args;

        this.type = "rect";
        this.origin = origin;

        // build the vertex array (TRIANGLE_STRIP order)
        this.verts = new Float32Array([
             half_width - origin.x,  half_height - origin.y, 0.0 - origin.z,
            -half_width - origin.x,  half_height - origin.y, 0.0 - origin.z,
             half_width - origin.x, -half_height - origin.y, 0.0 - origin.z,
            -half_width - origin.x, -half_height - origin.y, 0.0 - origin.z
        ]);

        // each of the four vertices has an individual color
        //TODO: decouple this a bit from color object
        this.color = new Float32Array([...fill.arr, ...fill.arr, ...fill.arr, ...fill.arr]);
    }
}

class RenderablePoly extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        let [points = [], fill = color(), stroke = color()] = args;

        this.points = points;

        this.fill = fill;
        this.stroke = stroke;
    }
}

export {WebGLRenderer, RenderableRect, RenderablePoly};