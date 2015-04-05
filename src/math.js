/**
 * Created by faide on 2015-04-01.
 */

let {sqrt, cos, sin, tan, PI: pi} = Math;
let vec2 = function(x,y) {
    "use strict";
    return {
        x: x,
        y: y
    };
};

let vec3 = function(x,y,z) {
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
                     m1[3][0] * m2[0][3] + m1[3][1] * m2[1][3] + m1[3][2] * m2[2][3] + m1[3][3] * m2[3][3]],
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

    translate(m, v) {
        "use strict";
        // preserve immutability
        let result = mtx(m);
        let t = [
            v.x,
            v.y,
            (v.z) ? v.z : 0
        ];

        result[0][3] += t[0];
        result[1][3] += t[1];
        result[2][3] += t[2];

        return result;
    }

};



export {vec2, vec_ops as vMath, mtx_ops as mMath};
