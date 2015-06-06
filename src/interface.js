/**
 * Created by faide on 15-04-13.
 */
import {vMath} from './utils.js';

export default class Interface {
    constructor(window, canvas_offset = vMath.vec2(), events = ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup']) {
        "use strict";
        this.__window = window;
        this.__event_queue = [];
        this.__key_state = {};
        this.__mouse_state = {
            lmb: 0,
            mmb: 0,
            rmb: 0,
            pos: vMath.vec2()
        };

        this.__canvas_offset = canvas_offset;

        events.forEach(this._bindEvent.bind(this));
    }

    get mouse() {
        "use strict";
        return this.__mouse_state;
    }

    get key() {
        "use strict";
        return this.__key_state;
    }

    _listener(event) {
        "use strict";
        this.__event_queue.push(event);
    }

    _bindEvent(event_name) {
        "use strict";
        this.__window.addEventListener(event_name, this._listener.bind(this));
    }

    process() {
        "use strict";
        // digest queue
        let event;
        while (this.__event_queue.length) {
            event = this.__event_queue.splice(0,1)[0];

            if (event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove') {
                this.handleMouseEvent(event);
            } else if (event.type === 'keydown' || event.type === 'keyup') {
                this.handleKeyEvent(event);
            }
        }
    }

    handleMouseEvent(e) {
        "use strict";
        let {sub, vec2} = vMath;
        if (e.type === 'mousemove') {
            this.__mouse_state.pos = sub(vec2(e.clientX, e.clientY), this.__canvas_offset);
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
                this.__mouse_state.lmb = assignment;
            } else if (e.button === 1) {
                this.__mouse_state.mmb = assignment;
            } else if (e.button === 2) {
                this.__mouse_state.rmb = assignment;
            }
        }
    }

    // TODO: add a compatibility shim to support browsers without KeyboardEvent.key
    handleKeyEvent(e) {
        "use strict";
        let key = "";
        if (e.key) {

            // uses the new DOM 3 key events
            key = e.key;
        } else {
            /*
                shim here; for the time being this only supports alphanumeric keys and space.
                a full polyfill would be a key-value association between keyCodes and the key
                strings provided by KeyboardEVent.key.  it's on the to-do list

             */
            key = String.fromCharCode(e.keyCode);
        }
        let assignment = this.__key_state[key];
        if (e.type === 'keydown' && assignment === 0) {
            assignment = Date.now();
        } else if (e.type === 'keyup') {
            assignment = 0;
        } else {
            return;
        }

        this.__key_state[key] = assignment;
    }

}