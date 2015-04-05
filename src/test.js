/**
 * Created by faide on 15-03-26.
 */

import Game from './game.js';
import {vMath, mMath} from './math.js';


window.g = new Game({
    canvasSelector: "#screen",
    fragmentShaderSelector: "#shader-fs",
    vertexShaderSelector: "#shader-vs"
});

// for testing
window.vMath = vMath;
window.mMath = mMath;