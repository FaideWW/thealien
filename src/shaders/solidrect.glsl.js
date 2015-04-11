/**
 * Created by faide on 15-04-09.
 */
export default {
    vertex_source: `

          attribute vec3 aVertexPosition;
          attribute vec4 aVertexColor;

          uniform mat4 uMVMatrix;
          uniform mat4 uPMatrix;

          varying lowp vec4 vColor;

          void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
          }

    `,
    fragment_source: `

          varying lowp vec4 vColor;

          void main(void) {
            gl_FragColor = vColor;

          }

  `
};