/**
 * Created by faide on 5/7/2015.
 */

import {vMath,  color} from './utils.js';
import {Component} from './component.js';

class RenderableSolidRect extends Component {
    constructor(c_name, ...args) {
        super(c_name, "renderable");

        let [half_width = 0, half_height = 0, fill = color(), origin = vMath.vec3()] = args;

        this.type = "solidrect";
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
        this._color = new Float32Array([...fill.arr, ...fill.arr, ...fill.arr, ...fill.arr]);
    }

    get color() {
        return this._color;
    }

    set color(c) {
        if (c.arr) {
            this._color = new Float32Array([...c.arr, ...c.arr, ...c.arr, ...c.arr]);
        } else {
            this._color = c;
        }
    }
}

class RenderableTexturedRect extends Component {
    constructor(c_name, half_width = 0, half_height = 0, origin = vMath.vec3(),
                tex_image = null, tex_width = 1, tex_height = 1, tex_top_left = vMath.vec2(), tex_bottom_right = vMath.vec2(),
                opacity = 1) {
        super(c_name, "renderable");


        //TODO: pull out texture data into a texture object



        this.type = "texturedrect";
        this.origin = origin;


        // tex_image should already be image data pre-loaded... check for tex_image.__loaded

        this.initialized = false;
        this.gl_texture = null;

        this.tex_data = tex_image;


        this.tex_coords = new Float32Array([
            tex_bottom_right.x   / tex_width, tex_bottom_right.y   / tex_height, // top right
            tex_top_left.x / tex_width, tex_bottom_right.y   / tex_height,  // top left
            tex_bottom_right.x   / tex_width, tex_top_left.y / tex_height, // bottom right
            tex_top_left.x / tex_width, tex_top_left.y / tex_height // bottom left
        ]);

        console.log(c_name);
        console.log(this.tex_coords);

        this.verts = new Float32Array([
            half_width - origin.x,  half_height - origin.y, 0.0 - origin.z, // top right
            -half_width - origin.x,  half_height - origin.y, 0.0 - origin.z, // top left
            half_width - origin.x, -half_height - origin.y, 0.0 - origin.z, // bottom right
            -half_width - origin.x, -half_height - origin.y, 0.0 - origin.z  // bottom left
        ]);

        this.opacity = opacity;

    }
}

class RenderableSolidPoly extends Component {
    constructor(c_name, ...args) {
        super(c_name, "renderable");

        let [points = [], fill = color(), stroke = color()] = args;

        this.points = points;

        this.fill = fill;
        this.stroke = stroke;
    }
}

export {
    RenderableSolidRect,
    RenderableSolidPoly,
    RenderableTexturedRect
    };