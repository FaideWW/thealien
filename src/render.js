/**
 * Created by faide on 2015-04-01.
 */
'use strict';

// TODO: lots of optimizations can be made here; e.g. binding attribute buffers on every draw call is pretty expensive
/**
 * solution: batch draw calls
 *
 * sort draws with the following priority: same shader program -> same attributes -> same texture -> same uniforms
 *
 * http://stackoverflow.com/questions/15561871/the-fastest-way-to-batch-calls-in-webgl
 *
 *
 * scratch notes
 *
 * currently:
 *
 *   each update():
 *     gl.clear()
 *
 *     drawMap() * 1
 *
 *     drawTexturedRect() * num textured rects (1-10)
 *
 *  each drawMap():
 *      drawTexturedRct() num map tiles (100+)
 *
 *
 * each drawTexturedRect():    // associated batch level; these can be sorted as shader > texture > renderable
 *     activeTexture           - texture
 *     bindTexture             - texture
 *     useProgram              - shader
 *     getAttribLocation       - shader
 *     enableVertexAttribArray - shader
 *     getAttribLocation       - shader
 *     enableVertexAttibArray  - shader
 *     bindBuffer              - renderable
 *     bufferData              - renderable
 *     vertexAttribPointer     - renderable
 *     bindBuffer              - renderable
 *     bufferData              - renderable
 *     vertexAttribPointer     - renderable
 *     getUniformLocation      - shader
 *     uniformMatrix4fv        - renderable
 *     getUniformLocation      - shader
 *     uniformMatrix4fv        - renderable
 *     getUniformLocation      - shader
 *     uniform1i               - texture (sampler)
 *     getUniformLocation      - shader
 *     uniform1f               - renderable
 *
 *  some notes about optimization:
 *
 *  if we can sort renderables based on textures, we can save a lot of graphics memory by calling glBindTexture() ONCE
 *  per texture, instead of per renderable
 *
 *  if we can further sort texture batches based on shader used, we can save more by calling useProgram ONCE per shader
 *   - in addition to useProgram, we only need to cal getUniformLocation once per uniform (for the texture shader, 4 uniforms)
 *   - ^ furthermore the texture sampler uniform only needs to be bound once
 *   - getAttribLocation is also called once per attribute (for texture shader, 2 attributes)
 *
 *  =========== greatest performance gain (theoretically)
 *  if we can generate vertex and texture coordinate arrays for large batches of renderables (i.e. maps), we can:
 *   - reduce number of buffers to 2 per batch
 *   - call bindBuffer and bufferData twice per batch
 *   - send shader attribute and uniform data once per batch
 *   - drawArrays called once per batch
 *
 */

import {Component, Registry} from './component.js';
import {vMath, mMath, color} from './utils.js';
import GameSystem from './system.js';
const {floor} = Math;

let uid = 0;

export default class WebGLRenderer extends GameSystem {
  constructor(sID = `webglrenderer${uid++}`, opts = {}) {
    super(sID, ['renderable', 'position']);
    if (!(opts.el && opts.resolution)) {
      return;
    }

    const {el: el,
      shaders: shaderPrograms,
      resolution: res,
      } = opts;

    /* https://www.khronos.org/webgl/wiki/HandlingHighDPI */

    el.style.width = `${res.width}px`;
    el.style.height = `${res.height}px`;

    const devicePixelRatio = window.devicePixelRatio || 1;

    el.width = res.width * devicePixelRatio;
    el.height = res.height * devicePixelRatio;

    this._resolution = vMath.vec3(res.width, res.height, 1);

    // used to send the resolution as a uniform variable to the vertex shader

    try {
      this._ctx = el.getContext('webgl', {}) || el.getContext('experimental-webgl', {});
    } catch (e) {
      console.error(e);
    }

    if (!this._ctx) {
      // TODO: figure out a way to fallback into canvas renderer in a concise way
      this.success = false;
      return;
    } else {
      this.success = true;
    }

    // init the canvas (from MDN)
    const gl = this._ctx;

    if (gl) {
      gl.clearColor(1.0, 0.0, 1.0, 1.0);                      // Set clear color to black, fully opaque
      gl.disable(gl.DEPTH_TEST);                               // Enable depth testing
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    }

    this._textures = [];
    this._textureDict = {};

    // one set of shaders per renderable type
    this._shaders = {};
    for (let mode in shaderPrograms) {
      if (shaderPrograms.hasOwnProperty(mode)) {
        this._shaders[mode] = this._initShaderProgram(shaderPrograms[mode]);
      }
    }

    this._ctx.viewport(0, 0, this._resolution.x * devicePixelRatio, this._resolution.y * devicePixelRatio);

  }

  addShader(shaderName, shaderSources, bufferNames, uniforms, attributes) {
    this._shaders[shaderName] = this._initShaderProgram({
      fragmentSource: shaderSources.fragment,
      vertexSource: shaderSources.vertex,
      buffers: bufferNames,
      uniforms: uniforms,
      attributes: attributes
    });
  }

  _initShader(shaderType, shaderSource) {
    const gl = this.ctx;

    const shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Error compiling shader: ${ gl.getShaderInfoLog(shader) }. `);
      return null;
    }

    return shader;
  }

  _initShaderProgram(args) {
    const gl = this.ctx;

    const {
      fragmentSource,
      vertexSource,
      buffers: bufferlist,
      uniforms: uniformList,
      attributes: attribList} = args;

    // attempt to compile shaders
    const fs = this._initShader(gl.FRAGMENT_SHADER, fragmentSource);
    const vs = this._initShader(gl.VERTEX_SHADER, vertexSource);

    const program = gl.createProgram();

    const buffers = {};
    const uniforms = {};
    const attribs = {};

    bufferlist.forEach((b) => {
      buffers[b] = gl.createBuffer();
    });

    gl.attachShader(program, fs);
    gl.attachShader(program, vs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`Error linking shader program. `);
    }

    uniformList.forEach((u) => {
      uniforms[u] = gl.getUniformLocation(program, u);
    });

    attribList.forEach((a) => {
      attribs[a] = gl.getAttribLocation(program, a);
    });

    return {
      program,
      buffers,
      uniforms,
      attribs
    };

  }

  _initTexture(image) {

    // cache any already loaded textures
    const textureID = (this._textureDict[image.src] !== void 0) ?
      this._textureDict[image.src] : this._textures.length;

    // if texture does not exist
    if (textureID === this._textures.length) {
      this._textureDict[image.src] = textureID;

      const gl = this.ctx;

      const texture = gl.createTexture();

      // maybe do activeTexture stuff here?
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);

      this._textures[textureID] = texture;
    }

    return textureID;
  }

  get ctx() {
    return this._ctx;
  }

  update(scene, dt) {
    this.clear();

    if (scene.map) {
      this.drawMap(scene.map);
    }

    scene.all((e) => {
      // TODO: more performance can be gained by doing this on scene creation as an insertion sort
      const sortedEntities = this._sortRenderablesByTexture(e);
      this._drawRenderablesByTexture(sortedEntities);

    }, this.lock);

  }

  clear() {
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
  }

  draw(renderable, position = vMath.vec3(), transform = {}) {
    // set up projection matrix and transformation matrix

    //let perspective_matrix = mMath.perspective(45, 640.0/480.0, 0.1, 100.0);

    const ortherMatrix = mMath.orthographic(0, this._resolution.x, this._resolution.y, 0, 0, 10);

    const transformationMatrix = mMath.compose()
      .translate(position);

    if (transform.rotate) {
      transformationMatrix.rotate(transform.rotate);
    }

    if (transform.scale) {
      transformationMatrix.scale(transform.scale);
    }

    const pMatrix = new Float32Array(mMath.flatten(ortherMatrix));
    const tMatrix = new Float32Array(mMath.flatten(transformationMatrix.done()));

    // use subroutine to draw the shape
    if (renderable.type === 'solidrect') {
      this._drawSolidRect(renderable, pMatrix, tMatrix);
    } else if (renderable.type === 'texturedrect') {
      this._drawTexturedRect(renderable, pMatrix, tMatrix);
    }
  }

  // TODO: when camera functionality is added, maporigin will change to camera offset
  drawMap(map /*maporigin = vMath.vec2()*/) {
    const gl = this.ctx;
    const shader = this._shaders.texturedRect;

    if (map.texture.initialized === false) {
      map.texture.glTextureID = this._initTexture(map.texture.source.img);
      map.texture.initialized = true;
    }

    gl.useProgram(shader.program);

    const vertexPositionAttribute = shader.attribs.aVertexPosition;
    const textureCoordinateAttribute = shader.attribs.aTextureCoord;
    const pUniform = shader.uniforms.uPMatrix;
    const mvUniform = shader.uniforms.uMVMatrix;
    const texSampler = shader.uniforms.uSampler;
    const alpha = shader.uniforms.uAlpha;

    const verticesBuffer = shader.buffers.vertices;

    const ortherMatrix = mMath.orthographic(0, this._resolution.x, this._resolution.y, 0, 0, 10);
    const pMatrix = new Float32Array(mMath.flatten(ortherMatrix));
    const tMatrix = new Float32Array(mMath.flatten(mMath.compose().done()));

    gl.uniformMatrix4fv(pUniform, false, pMatrix);
    gl.uniformMatrix4fv(mvUniform, false, tMatrix);

    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.enableVertexAttribArray(textureCoordinateAttribute);

    gl.bindTexture(gl.TEXTURE_2D, this._textures[map.texture.glTextureID]);
    gl.uniform1i(texSampler, 0);
    gl.uniform1f(alpha, 1.0);

    // vertex and texture data are interleaved (XYZ UV)
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 20, 0); // 20 = 5 * sizeof(float)
    gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 20, 12);// 12 = 3 * sizeof(float)

    map.buffers.forEach((layer) => {

      const {vertex} = layer;

      gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);

      gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 5);

    });
  }

  _sortRenderablesByTexture(entities) {
    const frenderable = Registry.getFlag('renderable');
    const texArray = {};
    for (let eID in entities) {
      if (entities.hasOwnProperty(eID)) {
        const e = entities[eID];
        const renderable = e.get(frenderable);

        //if (renderable.type === 'solidrect') {
        //    continue;
        //}

        if (renderable.initialized === false) {
          renderable.glTextureID = this._initTexture(renderable.sprite.texture.img);
          renderable.initialized = true;
        }

        let {glTextureID} = renderable;

        if (glTextureID === void 0) {
          glTextureID = 'none';
        }

        texArray[glTextureID] = texArray[glTextureID] ||
          {
            textureID: glTextureID,
            entities: []
          };

        texArray[glTextureID].entities.push(e);
      }
    }

    return texArray;
  }

  _drawRenderablesByTexture(textureGroups, transform = {}) {
    // shader layer
    const gl = this.ctx;
    const shader = this._shaders.texturedRect;

    gl.useProgram(shader.program);

    const vertexPositionAttribute = shader.attribs.aVertexPosition;
    const textureCoordinateAttribute = shader.attribs.aTextureCoord;
    const textureBuffer = shader.buffers.texture;
    const verticesBuffer = shader.buffers.vertices;
    const pUniform = shader.uniforms.uPMatrix;
    const mvUniform = shader.uniforms.uMVMatrix;
    const texSampler = shader.uniforms.uSampler;
    const alpha = shader.uniforms.uAlpha;
    const frenderable = Registry.getFlag('renderable');
    const fposition = Registry.getFlag('position');
    const orthoMatrix = mMath.orthographic(0, this._resolution.x, this._resolution.y, 0, 0, 10);
    const pMatrix = new Float32Array(mMath.flatten(orthoMatrix));

    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.enableVertexAttribArray(textureCoordinateAttribute);
    gl.uniformMatrix4fv(pUniform, false, pMatrix);

    for (let texGroupID in textureGroups) {
      if (textureGroups.hasOwnProperty(texGroupID)) {
        const texGroup = textureGroups[texGroupID];
        const {textureID, entities} = texGroup;

        // draw non-textured rects
        if (textureID === 'none') {
          entities.forEach((e) => {
            const renderable = e.get(frenderable);
            const position = e.get(fposition);

            this.draw(renderable, position);
          });

          continue;
        }

        gl.bindTexture(gl.TEXTURE_2D, this._textures[textureID]);
        gl.uniform1i(texSampler, 0);

        entities.forEach((e) => {
          const position = e.get(fposition);
          const renderable = e.get(frenderable);
          const texCoords = renderable.sprite.coords;
          const verts = renderable.verts;

          const transformationMatrix = mMath.compose()
            .translate(position)
            .mul(renderable.transform);

          if (transform.rotate) {
            transformationMatrix.rotate(transform.rotate);
          }

          if (transform.scale) {
            transformationMatrix.scale(transform.scale);
          }

          const tMatrix = new Float32Array(mMath.flatten(transformationMatrix.done()));

          gl.uniformMatrix4fv(mvUniform, false, tMatrix);
          gl.uniform1f(alpha, renderable.opacity);

          gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
          gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
          gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        })

      }
    }
  }

  // draw subroutines
  _drawSolidRect(renderable, pMatrix, tMatrix) {

    // these are pre-formatted Float32Arrays
    const color = renderable.color;
    const verts = renderable.verts;
    const gl = this.ctx;
    const shader = this._shaders.solidRect;

    gl.useProgram(shader.program);

    const vertexPositionAttribute = shader.attribs.aVertexPosition;
    const vertexColorAttribute = shader.attribs.aVertexColor;
    const pUniform = shader.uniforms.uPMatrix;
    const mvUniform = shader.uniforms.uMVMatrix;

    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.enableVertexAttribArray(vertexColorAttribute);

    const verticesBuffer = shader.buffers.vertices;
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    const colorBuffer = shader.buffers.color;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    // declare uniform variables
    gl.uniformMatrix4fv(pUniform, false, pMatrix);
    gl.uniformMatrix4fv(mvUniform, false, tMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  }

  // IF AT ALL POSSIBLE, DO NOT USE; EXTREMELY SLOW
  _drawTexturedRect(renderable, pMatrix, tMatrix) {
    if (renderable.initialized === false) {
      renderable.glTextureID = this._initTexture(renderable.sprite.texture.img);
      renderable.initialized = true;
    }

    const gl = this.ctx;
    const shader = this._shaders.texturedRect;
    const {glTextureID, verts} = renderable;
    const texCoords = renderable.sprite.coords;
    const glTexture = this._textures[glTextureID];

    // activate the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);

    gl.useProgram(shader.program);

    const vertexPositionAttribute = shader.attribs.aVertexPosition;
    const textureCoordinateAttribute = shader.attribs.aTextureCoord;
    const pUniform = shader.uniforms.uPMatrix;
    const mvUniform = shader.uniforms.uMVMatrix;
    const texSampler = shader.uniforms.uSampler;
    const alpha = shader.uniforms.uAlpha;

    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.enableVertexAttribArray(textureCoordinateAttribute);

    const textureBuffer = shader.buffers.texture;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);

    const verticesBuffer = shader.buffers.vertices;
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    // send uniforms

    gl.uniformMatrix4fv(pUniform, false, pMatrix);
    gl.uniformMatrix4fv(mvUniform, false, tMatrix);
    gl.uniform1i(texSampler, 0);
    gl.uniform1f(alpha, renderable.opacity);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  }
}