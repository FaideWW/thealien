/**
 * Created by faide on 15-04-11.
 */
export default {
    vertex: `

          attribute vec3 aVertexPosition;
          attribute vec4 aVertexColor;

          uniform mat4 uMVMatrix;
          uniform mat4 uPMatrix;
          uniform vec3 uResolution;

          varying lowp vec4 vColor;

          void main(void) {
            //vec3 zero_to_one = aVertexPosition / uResolution;
            //vec3 zero_to_two = zero_to_one * 2.0;
            //vec3 clipSpace   = zero_to_two - 1.0;

            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
          }

    `,
    fragment: `

          varying lowp vec4 vColor;

          void main(void) {
            gl_FragColor = vColor;

          }

  `
};