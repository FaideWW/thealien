/**
 * Created by faide on 2015-04-01.
 */

let {sqrt, cos, sin, tan, PI: pi} = Math;
let vec2 = function(x = 0, y = 0) {
    "use strict";
    return {
        x: x,
        y: y
    };
};

let vec3 = function(x = 0, y = 0, z = 0) {
    "use strict";
    return {
        x: x,
        y: y,
        z: z
    }
};

// operations
let vec_ops = {
    vec2:   vec2,
    vec3:   vec3,
    neg:    (v)      => vec2(-v.x, -v.y),
    add:    (v1, v2) => vec2(v1.x + v2.x, v1.y + v2.y),
    mul:    (v, s)   => vec2(v.x * s, v.y * s),

    sub:    (v1, v2) => vec_ops.add(v1, vec_ops.neg(v2)),
    div:    (v, s)   => vec_ops.mul(v, 1/s),

    magSq:  (v)      => (v.x * v.x) + (v.y * v.y),
    mag:    (v)      => sqrt(vec_ops.magSq(v)),
    unit:   (v)      => vec_ops.div(v, vec_ops.mag(v)),

    dot:    (v1, v2) => (v1.x * v2.x) + (v1.y * v2.y),
    cross:  (v1, v2) => (v1.x * v2.y) - (v1.y * v2.x),
    rot:    (v, r)   => vec2(v.x * cos(r) - v.y * sin(r), v.x * sin(r) + v.y * cos(r)),

    s_proj: (v1, v2) => vec_ops.dot(v1, v2) / vec_ops.mag(v2),
    v_proj: (v1, v2) => vec_ops.mul(v2, vec_ops.dot(v1, v2) / vec_ops.dot(v1, v2)),
    v_rej:  (v1, v2) => vec_ops.sub(v1, vec_ops.v_proj(v1, v2))
};

/**
 *
 * @param vals - should be a nested array of integers resembling a matrix
 */
let mtx = function (vals) {
    "use strict";
    // TODO: implement enough matrix operations to support GL rendering
    if (vals.length) {
        let n = vals[0].length;
        if (n && vals.every((v) => v.length === n)) {
            return vals.map((row) => row.slice());
        }
    }
    return [[0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]];
};

let mtx_ops = {
    _scalarMultiplication(m, s) {
        "use strict";
        return mtx(m.map((row) => row.map((v) => v * s)));
    },
    _matrixMultiplication(m1, m2) {
        "use strict";
        return mtx([[m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0] + m1[0][3] * m2[3][0],
                     m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1] + m1[0][3] * m2[3][1],
                     m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2] + m1[0][3] * m2[3][2],
                     m1[0][0] * m2[0][3] + m1[0][1] * m2[1][3] + m1[0][2] * m2[2][3] + m1[0][3] * m2[3][3]],

                    [m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0] + m1[1][3] * m2[3][0],
                     m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1] + m1[1][3] * m2[3][1],
                     m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2] + m1[1][3] * m2[3][2],
                     m1[1][0] * m2[0][3] + m1[1][1] * m2[1][3] + m1[1][2] * m2[2][3] + m1[1][3] * m2[3][3]],

                    [m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0] + m1[2][3] * m2[3][0],
                     m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1] + m1[2][3] * m2[3][1],
                     m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2] + m1[2][3] * m2[3][2],
                     m1[2][0] * m2[0][3] + m1[2][1] * m2[1][3] + m1[2][2] * m2[2][3] + m1[2][3] * m2[3][3]],

                    [m1[3][0] * m2[0][0] + m1[3][1] * m2[1][0] + m1[3][2] * m2[2][0] + m1[3][3] * m2[3][0],
                     m1[3][0] * m2[0][1] + m1[3][1] * m2[1][1] + m1[3][2] * m2[2][1] + m1[3][3] * m2[3][1],
                     m1[3][0] * m2[0][2] + m1[3][1] * m2[1][2] + m1[3][2] * m2[2][2] + m1[3][3] * m2[3][2],
                     m1[3][0] * m2[0][3] + m1[3][1] * m2[1][3] + m1[3][2] * m2[2][3] + m1[3][3] * m2[3][3]]
            ])
    },
    mtx: mtx,
    i: () => mtx([[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]]),
    mul(m1, s_m2) {
        "use strict";
        return (typeof s_m2 === 'number') ? this._scalarMultiplication(m1, s_m2) : this._matrixMultiplication(m1, s_m2);
    },

    flatten(m) {
        "use strict";

        let result = [];
        for (let i = 0; i < m[0].length; i += 1) {
            for (let j = 0; j < m.length; j += 1) {
                result.push(m[j][i]);
            }
        }
        return result;
    },

    perspective(fov, aspect, near, far, leftHanded = true) {
        "use strict";

        // assert that params are correct
        if (fov <= 0 || aspect === 0) {
            console.error(`Error creating a perspective matrix: Division by zero (fov = ${fov}, aspect = ${aspect}`);
            return result;
        }

        // from MDN

        let top = near * tan(fov * pi / 360.0),
            bot = -top,
            left = bot * aspect,
            right = top * aspect,

            X = 2 * near / (right - left),
            Y = 2 * near / (top - bot),
            A = (right + left) / (right - left),
            B = (top + bot) / (top - bot),
            C = -(far + near) / (far - near),
            D = -2 * far * near / (far - near);

        return mtx([[X,  0,  A,  0],
                    [0,  Y,  B,  0],
                    [0,  0,  C,  D],
                    [0,  0, -1,  0]]);
    },


    //mat4.ortho = function(left, right, bottom, top, near, far, dest) {
    //if(!dest) { dest = mat4.create(); }
    //var rl = (right - left);
    //var tb = (top - bottom);
    //var fn = (far - near);
    //dest[0] = 2 / rl;
    //dest[1] = 0;
    //dest[2] = 0;
    //dest[3] = 0;
    //dest[4] = 0;
    //dest[5] = 2 / tb;
    //dest[6] = 0;
    //dest[7] = 0;
    //dest[8] = 0;
    //dest[9] = 0;
    //dest[10] = -2 / fn;
    //dest[11] = 0;
    //dest[12] = -(left + right) / rl;
    //dest[13] = -(top + bottom) / tb;
    //dest[14] = -(far + near) / fn;
    //dest[15] = 1;
    //return dest;

    orthographic(left, right, bottom, top, near, far) {
        "use strict";
        let rl = (right - left);
        let tb = (top - bottom);
        let fn = (far - near);

        let X =  2 / rl;
        let Y =  2 / tb;
        let Z = -2 / fn;
        let A = -(left + right) / rl;
        let B = -(top + bottom) / tb;
        let C = -(far + near)   / fn;


        return mtx([[X, 0, 0, A],
                    [0, Y, 0, B],
                    [0, 0, Z, C],
                    [0, 0, 0, 1]]);
    },

    translation(v) {
        "use strict";
        let result = this.i();
        let t = [
            v.x,
            v.y,
            (v.z) ? v.z : 0
        ];

        result[0][3] = t[0];
        result[1][3] = t[1];
        result[2][3] = t[2];
        return result;
    },

    scale(v) {
        "use strict";
        let result = this.i();
        let t = [
            v.x,
            v.y,
            (v.z) ? v.z : 0
        ];

        result[0][0] = t[0];
        result[1][1] = t[1];
        result[2][2] = t[2];

        return result;
    },

    // all rotations are about the z axis
    rotation(r) {
        "use strict";
        let result = this.i();

        result[0][0] =  cos(r);
        result[0][1] =  sin(r);
        result[1][0] = -sin(r);
        result[1][1] =  cos(r);

        return result;
    },



    // create a transformation matrix by chaining transformation methods together
    compose() {
        "use strict";
        return {
            __mtx: mtx_ops.i(),
            done() {
                return this.__mtx;
            },
            translate(v) {
                this.__mtx = mtx_ops.mul(this.__mtx, mtx_ops.translation(v));
                return this;
            },
            scale(v) {
                this.__mtx = mtx_ops.mul(this.__mtx, mtx_ops.scale(v));
                return this;
            },
            rotate(r) {
                this.__mtx = mtx_ops.mul(this.__mtx, mtx_ops.rotation(r));
                return this;
            }

        }
    }

};


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

            r = parseInt(r, 16) / 255.0;
            g = parseInt(g, 16) / 255.0;
            b = parseInt(b, 16) / 255.0;
            a = parseInt(a, 16) / 255.0;
        }
    } else {

        // otherwise assume it's a number
        r = string_or_r;

    }
    return {
        _r: r,
        _g: g,
        _b: b,
        _a: a,
        arr: [r, g, b, a],
        get r() {
            return this._r;
        },
        set r(r) {
            this._r = r;
            this.arr[0] = r;
        },
        get g() {
            return this._g;
        },
        set g(g) {
            this._g = g;
            this.arr[1] = g;
        },
        get b() {
            return this._b;
        },
        set b(b) {
            this._b = b;
            this.arr[2] = b;
        },
        get a() {
            return this._a;
        },
        set a(a) {
            this._a = a;
            this.arr[3] = a;
        },

        toString() {
            return `rgba(${this.r},${this.g},${this.b},${this.a})`;
        }
    };
};

export {vec2, vec_ops as vMath, mtx_ops as mMath, color};
