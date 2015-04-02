/**
 * Created by faide on 2015-04-01.
 */

let {sqrt, cos, sin} = Math;
let vec2 = function(x,y) {
    "use strict";
    return {
        x: x,
        y: y
    };
};

// operations
let vec_ops = {
    vec2:   vec2,
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

export {vec2, vec_ops as vmath};
