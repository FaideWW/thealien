/**
 * Created by faide on 2015-04-01.
 */
"use strict";

import {Component} from "./component.js";
import {vMath, mMath} from "./math.js";



// TODO: implement untextured rect rendering
class WebGLRenderer {
    constructor(canvas_el, fragment_shader_els = [], vertex_shader_els = []) {
        if (!canvas_el) {
            return;
        }

        try {
            this._ctx = canvas_el.getContext('webgl') || canvas_el.getContext("experimental-webgl");
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
            this._ctx.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
            this._ctx.enable(this._ctx.DEPTH_TEST);                               // Enable depth testing
            this._ctx.depthFunc(this._ctx.LEQUAL);                                // Near things obscure far things
            this._ctx.clear(this._ctx.COLOR_BUFFER_BIT|this._ctx.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        }


        this._fragment_shaders = [];
        // fetch shaders
        if (fragment_shader_els.length) {

            // Chrome does not support iteration over NodeLists yet
            for (let s of fragment_shader_els) {
                this._initShader(s);
            }
        }

        this._vertex_shaders = [];
        if (vertex_shader_els.length) {
            for (let s of vertex_shader_els) {
                this._initShader(s);
            }
        }

        // create the shader program with the first two results
        if (this._vertex_shaders.length >= 1 && this._fragment_shaders.length >= 1) {
            this._initShaderProgram(this._fragment_shaders[0], this._vertex_shaders[0]);
        }



        this._ctx.viewport(0, 0, canvas_el.width, canvas_el.height);

    }

    _initShader(element) {
        if (!element) {
            return;
        }

        let gl = this.ctx;

        let shader_source = "";
        let shader;
        let shader_array;

        // from MDN

        let current_node = element.firstChild;
        while (current_node) {
            if (current_node.nodeType === current_node.TEXT_NODE) {
                shader_source += current_node.textContent;
            }

            current_node = current_node.nextSibling;
        }

        if (element.type === "x-shader/x-fragment") {
            shader_array = this._fragment_shaders;
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (element.type === "x-shader/x-vertex") {
            shader_array = this._vertex_shaders;
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            // not a shader
            console.error(`Error initializing shader '${element.id}': Unrecognized shader type ${element.type}`);
            return;
        }

        gl.shaderSource(shader, shader_source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader '${element.id}': ${gl.getShaderInfoLog(shader)}`);
            return;
        }

        shader_array.push(shader);

    }

    _initShaderProgram(fs, vs) {
        let gl = this.ctx;

        this._shader_program = gl.createProgram();
        gl.attachShader(this._shader_program, fs);
        gl.attachShader(this._shader_program, vs);
        gl.linkProgram(this._shader_program);

        if (!gl.getProgramParameter(this._shader_program, gl.LINK_STATUS)) {
            console.error(`Error linking shader program`);
        }

        gl.useProgram(this._shader_program);

        // TODO: does this attach to the renderable?
        this._vertex_position_attribute = gl.getAttribLocation(this._shader_program, "aVertexPosition");
        gl.enableVertexAttribArray(this._vertex_position_attribute);
        this._vertex_color_attribute = gl.getAttribLocation(this._shader_program, "aVertexColor");
        gl.enableVertexAttribArray(this._vertex_color_attribute);
    }

    get ctx() {
        return this._ctx;
    }

    update(scene, dt) {

        // TODO: Pull this out and either store it in the renderable, or be able to extract it from the renderable
        let gl = this.ctx;

        let vertices = [
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0
        ];

        let colors = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];


        this._vertices_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertices_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this._color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }

    draw(renderable, position) {
        let gl = this.ctx;

        // start the buffer (from MDN)
        let horiz_aspect = gl.canvas.width / gl.canvas.height;
        let {_vertex_position_attribute: vertex_position_attribute,
            _vertex_color_attribute: vertex_color_attribute,
                _shader_program: shader_program,
                _vertices_buffer: vertices_buffer,
                _color_buffer: color_buffer} = this;
        // draw the shape
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let perspective_matrix = mMath.perspective(45, 640.0/480.0, 0.1, 100.0);

        let transformation_matrix = mMath.i();
        transformation_matrix = mMath.translate(transformation_matrix, vMath.vec3(-0.0, 0.0, -6.0));

        gl.bindBuffer(gl.ARRAY_BUFFER, vertices_buffer);
        gl.vertexAttribPointer(vertex_position_attribute, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.vertexAttribPointer(vertex_color_attribute, 4, gl.FLOAT, false, 0, 0);

        let pUniform = gl.getUniformLocation(shader_program, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(mMath.flatten(perspective_matrix)));
        let mvUniform = gl.getUniformLocation(shader_program, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mMath.flatten(transformation_matrix)));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);



    }
}

let color = function (string_or_r = 0, g = 0, b = 0, a = 1) {
    let r = 0;

    if (typeof string_or_r === 'string') {
        let fullstr;

        if (string_or_r.startsWith("rgba")) {

            // string representation: "rgba(r,g,b,a)"
            [fullstr, r, g, b, a] = string_or_r.match(/rgba\((\d+),(\d+),(\d+),(\d+)\)/)
        } else if (string_or_r.startsWith("#")) {
            if (string_or_r.length === 9) {

                // string representation: "#RRGGBBAA"
                [fullstr, r, g, b, a] = string_or_r.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);

            } else if (string_or_r.length == 5) {

                // string representation: "#RGBA"
                [fullstr, r, g, b, a] = string_or_r.match(/#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})/);

                r = `${r}${r}`;
                g = `${g}${g}`;
                b = `${b}${b}`;
                a = `${a}${a}`;
            }

            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
            a = parseInt(a, 16);
        }
    } else {

        // otherwise assume it's a number
        r = string_or_r;

    }
    return {
        r: r,
        g: g,
        b: b,
        a: a,
        encode() {
            return `rgba(${this.r},${this.g},${this.b},${this.a})`;
        }
    };
};

// TODO: To facilitate webgl rendering, we should store vertex data here without having to decode it. Factory pattern?
class RenderableRect extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        let {half_width = 0, half_height = 0, origin = vMath.vec2(), fill = color(), stroke = color()} = args;

        this.hw = half_width;
        this.hh = half_height;
        this.origin = origin;

        this.fill = fill;
        this.stroke = stroke;
    }
}

class RenderablePoly extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        let {points = [], fill = color(), stroke = color()} = args;

        this.points = points;

        this.fill = fill;
        this.stroke = stroke;
    }
}

export {WebGLRenderer, color, RenderableRect, RenderablePoly};