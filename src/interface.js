/**
 * Created by faide on 15-04-13.
 */

import {vMath} from './utils.js';

export default class Interface {
  constructor(window, canvasOffset = vMath.vec2(), events = ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup']) {
    'use strict';
    this.__window = window;
    this.__eventQueue = [];
    this.__keyState = {};
    this.__mouseState = {
      lmb: 0,
      mmb: 0,
      rmb: 0,
      pos: vMath.vec2()
    };

    this.__canvasOffset = canvasOffset;

    events.forEach(this._bindEvent.bind(this));
  }

  get mouse() {
    'use strict';
    return this.__mouseState;
  }

  get key() {
    'use strict';
    return this.__keyState;
  }

  _listener(event) {
    'use strict';
    this.__eventQueue.push(event);
  }

  _bindEvent(eventName) {
    'use strict';
    this.__window.addEventListener(eventName, this._listener.bind(this));
  }

  process(timestamp) {
    'use strict';

    // digest queue
    let event;
    while (this.__eventQueue.length) {
      event = this.__eventQueue.splice(0, 1)[0];

      if (event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove') {
        this.handleMouseEvent(event, timestamp);
      } else if (event.type === 'keydown' || event.type === 'keyup') {
        this.handleKeyEvent(event, timestamp);
      }
    }
  }

  handleMouseEvent(e) {
    'use strict';
    let {sub, vec2} = vMath;
    if (e.type === 'mousemove') {
      this.__mouseState.pos = sub(vec2(e.clientX, e.clientY), this.__canvasOffset);
    } else {
      let assignment = -1;
      if (e.type === 'mousedown') {
        assignment = 1;
      } else if (e.type === 'mouseup') {
        assignment = 0;
      } else {
        // don't pollute the input state with undefined events
        return;
      }

      if (e.button === 0) {
        this.__mouseState.lmb = assignment;
      } else if (e.button === 1) {
        this.__mouseState.mmb = assignment;
      } else if (e.button === 2) {
        this.__mouseState.rmb = assignment;
      }
    }
  }

  // TODO: add a compatibility shim to support browsers without KeyboardEvent.key
  handleKeyEvent(e, timestamp) {
    'use strict';
    let key = '';
    if (e.key) {

      // uses the new DOM 3 key events
      key = e.key;
    } else {
      /*
       shim here; for the time being this only supports alphanumeric keys and space.
       a full polyfill would be a key-value association between keyCodes and the key
       strings provided by KeyboardEVent.key.  it's on the to-do list

       */
      key = String.fromCharCode(e.keyCode).toLowerCase();
    }

    let assignment = this.__keyState[key];
    if (e.type === 'keydown' && !assignment) {
      // stores the time that the key was first pressed
      // if you want to compute the 'time held', just subtract this from the current time
      assignment = timestamp;
    } else if (e.type === 'keyup') {
      assignment = 0;
    } else {
      return;
    }

    this.__keyState[key] = assignment;
  }

}