/**
 * Created by faide on 2015-04-01.
 */
"use strict";

import Component from "component.js";

class Renderer {
    constructor(canvasEl) {
        if (!canvasEl) {
            return;
        }
        this.ctx = canvasEl.getContext('webgl');
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

class RenderableRect extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        let {half_width = 0, half_height = 0, fill = color(), stroke = color()} = args;

        this.hw = half_width;
        this.hh = half_height;
        this.fill = fill;
        this.stroke = stroke;
    }
}

class RenderablePoly extends Component {
    constructor(c_type, c_name, ...args) {
        super(c_type, c_name);

        // TODO: implement this once math is done...
    }
}

export {Renderer, color, RenderableRect, RenderablePoly};