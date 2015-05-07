/**
 * Created by faide on 15-04-11.
 */
export default {
    vertex_source: `

          attribute vec3 aVertexPosition;
          attribute vec2 aTextureCoord;

          uniform mat4 uMVMatrix;
          uniform mat4 uPMatrix;

          varying highp vec2 vTextureCoord;

          void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
          }

    `,
    fragment_source: `

          varying highp vec2 vTextureCoord;

          uniform sampler2D uSampler;
          uniform highp float uAlpha;

          void main(void) {
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor.a *= uAlpha;

          }

  `
};