#version 100

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform highp float uAlpha;

void main(void) {
  gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  gl_FragColor.a *= uAlpha;

}