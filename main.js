/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7:
/***/ ((module) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/

;// ./node_modules/modern-normalize/modern-normalize.css
// extracted by mini-css-extract-plugin

;// ./src/todoPriorities.js
/**
 * Enum for task priorities.
 * @readonly
 * @enum {{value: number, name: string}}
 */
const Priorities = Object.freeze({
    Lowest: {value: -2, name: "Lowest"},
    Low: {value: -1, name: "Low"},
    Medium: {value: 0, name: "Medium"},
    High: {value: 1, name: "High"},
    Highest: {value: 2, name: "Highest"},
    values: function() {
        const valuesArray = [];
        for (const prop in Priorities) {
            if (Object.prototype.hasOwnProperty.call(Priorities, prop)) {                
                const priority = Priorities[prop];
                if(typeof priority === "object") {
                    valuesArray.push(priority);
                }
            }
        }

        return valuesArray;
    },
    exists: function (value) {
        return Object.values(Priorities).includes(value);
    },
    fromValue: function(value) {
        for (const prop in Priorities) {
            if (Object.prototype.hasOwnProperty.call(Priorities, prop)) {
                const priority = Priorities[prop];
                if(priority.value === Number(value)) {
                    return priority;
                }
            }
        }

        throw new Error(`Priority with value ${value} does not exist.`);
    }
});

/* harmony default export */ const todoPriorities = (Priorities);
// EXTERNAL MODULE: ./node_modules/events/events.js
var events = __webpack_require__(7);
var events_default = /*#__PURE__*/__webpack_require__.n(events);
;// ./src/todoTask.js




const TASK_CHANGED_EVENT = "taskChanged";

class TodoTask {
    /**
     * @type {TodoSection}
     */
    #ownerSection;
    #title;
    #description = null;
    #date = null;
    #priority;
    #done;
    #taskChangedEmitter;

    constructor(section, title, description, date, priority) {
        this.#taskChangedEmitter = new (events_default())();

        this.#ownerSection = section;
        this.title = title || "";
        this.description = description || "";
        this.date = date || null;
        this.priority = priority || todoPriorities.Lowest;
        this.done = false;
    }

    deleteTask() {
        this.#ownerSection.removeTask(this);
    }

    set title(newTitle) {
        if (typeof newTitle !== 'string'
            && (newTitle instanceof String) == false
            && newTitle != null) {
            throw new Error("Only strings and null values accepted");
        }

        this.#title = newTitle;
        this.#triggerTaskChangedEvent();
    }

    get title() {
        return this.#title;
    }

    set description(newDescription) {
        if (typeof newDescription !== 'string'
            && (newDescription instanceof String) == false
            && newDescription != null) {
            throw new Error("Only strings and null values accepted");
        }

        this.#description = newDescription;
        this.#triggerTaskChangedEvent();
    }

    get description() {
        return this.#description;
    }

    set date(newDate) {
        if ((newDate instanceof Date) == false && newDate != null) {
            throw new Error("Only Date and null values accepted");
        }

        this.#date = newDate;
        this.#triggerTaskChangedEvent();
    }

    get date() {
        return this.#date;
    }

    set priority(newPrio) {
        if (todoPriorities.exists(newPrio) === false) {
            throw new Error("Only accept valid Priorities values.")
        }

        this.#priority = newPrio;
        this.#triggerTaskChangedEvent();
    }

    get priority() {
        return this.#priority;
    }

    set done(value) {
        if ((typeof value === "boolean") === false) {
            throw new Error("Only bool values accepted");
        }

        this.#done = value;
        this.#triggerTaskChangedEvent();
    }

    get done() {
        return this.#done;
    }

    toJson() {
        return {
            title: this.#title,
            description: this.#description,
            dueDate: this.#date,
            priority: this.#priority,
            done: this.#done
        };
    }

    fromJson(jsonData) {
        this.#title = jsonData.title;
        this.#description = jsonData.description;
        this.#date = jsonData.dueDate;
        this.#priority = jsonData.priority;
        this.#done = jsonData.done;
    }

    addTaskChangedListener(func) {
        this.#taskChangedEmitter.on(TASK_CHANGED_EVENT, func);
    }

    removeTaskChangedListener(func) {
        this.#taskChangedEmitter.removeListener(TASK_CHANGED_EVENT, func);
    }

    #triggerTaskChangedEvent() {
        this.#taskChangedEmitter.emit(TASK_CHANGED_EVENT, this);
    }
}

/* harmony default export */ const todoTask = (TodoTask);
;// ./src/todoSection.js




const SECTION_CHANGED_EVENT = "sectionChanged";
const TASK_ADDED_EVENT = "taskAdded";
const TASK_REMOVED_EVENT = "taskRemoved";

class TodoSection {
    #ownerProject;
    #title;
    #tasks = [];
    #eventEmitter;

    constructor(project, title) {
        this.#ownerProject = project;
        this.#title = title;
        this.#eventEmitter = new (events_default())();
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        if (typeof newTitle !== 'string'
            && (newTitle instanceof String) == false
            && newTitle != null) {
            throw new Error("Only strings and null values accepted");
        }

        this.#title = newTitle;
        this.#eventEmitter.emit(SECTION_CHANGED_EVENT, this);
    }

    get tasksCount() {
        return this.#tasks.length;
    }

    deleteSection() {
        this.#ownerProject.removeSection(this);
    }

    #addTask(todoTask) {
        this.#tasks.push(todoTask);
    }

    addTask(title, description, dueDate = null, priority = todoPriorities.Lowest) {
        const task = new todoTask(this, title, description, dueDate, priority);
        this.#addTask(task);

        this.#eventEmitter.emit(TASK_ADDED_EVENT, task);

        return task;
    }

    removeTask(todoTask) {
        const index = this.#tasks.indexOf(todoTask);
        if (index >= 0) {
            this.#tasks.splice(index, 1);
            this.#eventEmitter.emit(TASK_REMOVED_EVENT, todoTask);
        }
    }

    get tasks() {
        return [...this.#tasks];
    }

    toJson() {
        return {
            title: this.#title,
            tasks: this.#tasks.map((task) => task.toJson())
        };
    }

    fromJson(jsonData) {
        this.#title = jsonData.title;
        const tasks = jsonData.tasks;
        if(tasks && Array.isArray(tasks)) {
            tasks.forEach((item) => {
                const task = new todoTask(this);
                task.fromJson(item);
                this.#addTask(task);
            });
        }
    }

    addSectionChangedListener(callback) {
        this.#eventEmitter.addListener(SECTION_CHANGED_EVENT, callback);
    }

    removeSectionChangedListener(callback) {
        this.#eventEmitter.removeListener(SECTION_CHANGED_EVENT, callback);
    }

    addTaskAddedListener(callback) {
        this.#eventEmitter.addListener(TASK_ADDED_EVENT, callback);
    }

    removeTaskAddedListener(callback) {
        this.#eventEmitter.removeListener(TASK_ADDED_EVENT, callback);
    }

    addTaskRemovedListener(callback) {
        this.#eventEmitter.addListener(TASK_REMOVED_EVENT, callback);
    }

    removeTaskRemovedListener(callback) {
        this.#eventEmitter.removeListener(TASK_REMOVED_EVENT, callback);
    }
}

/* harmony default export */ const todoSection = (TodoSection);
;// ./src/todoProject.js



const PROJECT_CHANGED_EVENT = "projectChanged";
const SECTION_ADDED_EVENT = "projectSectionAdded";
const SECTION_REMOVED_EVENT = "projectSectionRemoved";

class TodoProject {
    #id;
    #title;
    #sections = [];
    #eventEmitter;

    constructor(title) {
        this.#id = self.crypto.randomUUID();
        this.#title = title;
        this.#eventEmitter = new (events_default())();
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        if ((typeof newTitle === "string") === false) {
            throw new Error("Only string values valid.");
        }

        this.#title = newTitle;
        this.#eventEmitter.emit(PROJECT_CHANGED_EVENT, this);
    }

    get id() {
        return this.#id;
    }

    #addSection(section) {
        this.#sections.push(section);
    }

    addSection(sectionTitle) {
        if (sectionTitle == false) {
            throw new Error("Trying to create a section with an empty title");
        }

        const section = new todoSection(this, sectionTitle);
        this.#addSection(section);

        this.#eventEmitter.emit(SECTION_ADDED_EVENT, section);

        return section;
    }

    removeSection(section) {
        if (section == false) {
            return;
        }

        const index = this.#sections.indexOf(section);
        if (index >= 0) {
            this.#sections.splice(index, 1);
            this.#eventEmitter.emit(SECTION_REMOVED_EVENT, section);
        }
    }

    get sections() {
        return [...this.#sections];
    }

    toJson() {
        return {
            id: this.#id,
            title: this.#title,
            sections: this.#sections.map((section) => section.toJson())
        };
    }

    fromJson(jsonData) {
        this.#id = jsonData.id;
        this.#title = jsonData.title;
        const sections = jsonData.sections;
        if(sections && Array.isArray(sections)) {
            sections.forEach((item) => {
                const section = new todoSection(this);
                section.fromJson(item);
                this.#addSection(section);
            });
        }
    }

    addProjectChangedListener(func) {
        this.#eventEmitter.on(PROJECT_CHANGED_EVENT, func);
    }

    removeProjectChangedListener(func) {
        this.#eventEmitter.removeListener(PROJECT_CHANGED_EVENT, func);
    }

    addSectionAddedListener(func) {
        this.#eventEmitter.on(SECTION_ADDED_EVENT, func);
    }

    removeSectionAddedListener(func) {
        this.#eventEmitter.removeListener(SECTION_ADDED_EVENT, func);
    }

    addSectionRemovedListener(func) {
        this.#eventEmitter.on(SECTION_REMOVED_EVENT, func);
    }

    removeSectionRemovedListener(func) {
        this.#eventEmitter.removeListener(SECTION_REMOVED_EVENT, func);
    }
}

/* harmony default export */ const todoProject = (TodoProject);
;// ./node_modules/date-fns/constants.js
/**
 * @module constants
 * @summary Useful constants
 * @description
 * Collection of useful date constants.
 *
 * The constants could be imported from `date-fns/constants`:
 *
 * ```ts
 * import { maxTime, minTime } from "./constants/date-fns/constants";
 *
 * function isAllowedTime(time) {
 *   return time <= maxTime && time >= minTime;
 * }
 * ```
 */

/**
 * @constant
 * @name daysInWeek
 * @summary Days in 1 week.
 */
const daysInWeek = 7;

/**
 * @constant
 * @name daysInYear
 * @summary Days in 1 year.
 *
 * @description
 * How many days in a year.
 *
 * One years equals 365.2425 days according to the formula:
 *
 * > Leap year occurs every 4 years, except for years that are divisible by 100 and not divisible by 400.
 * > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
 */
const daysInYear = 365.2425;

/**
 * @constant
 * @name maxTime
 * @summary Maximum allowed time.
 *
 * @example
 * import { maxTime } from "./constants/date-fns/constants";
 *
 * const isValid = 8640000000000001 <= maxTime;
 * //=> false
 *
 * new Date(8640000000000001);
 * //=> Invalid Date
 */
const maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1000;

/**
 * @constant
 * @name minTime
 * @summary Minimum allowed time.
 *
 * @example
 * import { minTime } from "./constants/date-fns/constants";
 *
 * const isValid = -8640000000000001 >= minTime;
 * //=> false
 *
 * new Date(-8640000000000001)
 * //=> Invalid Date
 */
const minTime = -maxTime;

/**
 * @constant
 * @name millisecondsInWeek
 * @summary Milliseconds in 1 week.
 */
const millisecondsInWeek = 604800000;

/**
 * @constant
 * @name millisecondsInDay
 * @summary Milliseconds in 1 day.
 */
const millisecondsInDay = 86400000;

/**
 * @constant
 * @name millisecondsInMinute
 * @summary Milliseconds in 1 minute
 */
const millisecondsInMinute = 60000;

/**
 * @constant
 * @name millisecondsInHour
 * @summary Milliseconds in 1 hour
 */
const millisecondsInHour = 3600000;

/**
 * @constant
 * @name millisecondsInSecond
 * @summary Milliseconds in 1 second
 */
const millisecondsInSecond = 1000;

/**
 * @constant
 * @name minutesInYear
 * @summary Minutes in 1 year.
 */
const minutesInYear = 525600;

/**
 * @constant
 * @name minutesInMonth
 * @summary Minutes in 1 month.
 */
const minutesInMonth = 43200;

/**
 * @constant
 * @name minutesInDay
 * @summary Minutes in 1 day.
 */
const minutesInDay = 1440;

/**
 * @constant
 * @name minutesInHour
 * @summary Minutes in 1 hour.
 */
const minutesInHour = 60;

/**
 * @constant
 * @name monthsInQuarter
 * @summary Months in 1 quarter.
 */
const monthsInQuarter = 3;

/**
 * @constant
 * @name monthsInYear
 * @summary Months in 1 year.
 */
const monthsInYear = 12;

/**
 * @constant
 * @name quartersInYear
 * @summary Quarters in 1 year
 */
const quartersInYear = 4;

/**
 * @constant
 * @name secondsInHour
 * @summary Seconds in 1 hour.
 */
const secondsInHour = 3600;

/**
 * @constant
 * @name secondsInMinute
 * @summary Seconds in 1 minute.
 */
const secondsInMinute = 60;

/**
 * @constant
 * @name secondsInDay
 * @summary Seconds in 1 day.
 */
const secondsInDay = secondsInHour * 24;

/**
 * @constant
 * @name secondsInWeek
 * @summary Seconds in 1 week.
 */
const secondsInWeek = secondsInDay * 7;

/**
 * @constant
 * @name secondsInYear
 * @summary Seconds in 1 year.
 */
const secondsInYear = secondsInDay * daysInYear;

/**
 * @constant
 * @name secondsInMonth
 * @summary Seconds in 1 month
 */
const secondsInMonth = secondsInYear / 12;

/**
 * @constant
 * @name secondsInQuarter
 * @summary Seconds in 1 quarter.
 */
const secondsInQuarter = secondsInMonth * 3;

/**
 * @constant
 * @name constructFromSymbol
 * @summary Symbol enabling Date extensions to inherit properties from the reference date.
 *
 * The symbol is used to enable the `constructFrom` function to construct a date
 * using a reference date and a value. It allows to transfer extra properties
 * from the reference date to the new date. It's useful for extensions like
 * [`TZDate`](https://github.com/date-fns/tz) that accept a time zone as
 * a constructor argument.
 */
const constructFromSymbol = Symbol.for("constructDateFrom");

;// ./node_modules/date-fns/constructFrom.js


/**
 * @name constructFrom
 * @category Generic Helpers
 * @summary Constructs a date using the reference date and the value
 *
 * @description
 * The function constructs a new date using the constructor from the reference
 * date and the given value. It helps to build generic functions that accept
 * date extensions.
 *
 * It defaults to `Date` if the passed reference date is a number or a string.
 *
 * Starting from v3.7.0, it allows to construct a date using `[Symbol.for("constructDateFrom")]`
 * enabling to transfer extra properties from the reference date to the new date.
 * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
 * that accept a time zone as a constructor argument.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The reference date to take constructor from
 * @param value - The value to create the date
 *
 * @returns Date initialized using the given date and value
 *
 * @example
 * import { constructFrom } from "./constructFrom/date-fns";
 *
 * // A function that clones a date preserving the original type
 * function cloneDate<DateType extends Date>(date: DateType): DateType {
 *   return constructFrom(
 *     date, // Use constructor from the given date
 *     date.getTime() // Use the date value to create a new date
 *   );
 * }
 */
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);

  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);

  if (date instanceof Date) return new date.constructor(value);

  return new Date(value);
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_constructFrom = ((/* unused pure expression or super */ null && (constructFrom)));

;// ./node_modules/date-fns/toDate.js


/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * Starting from v3.7.0, it clones a date using `[Symbol.for("constructDateFrom")]`
 * enabling to transfer extra properties from the reference date to the new date.
 * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
 * that accept a time zone as a constructor argument.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param argument - The value to convert
 *
 * @returns The parsed date in the local time zone
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */
function toDate(argument, context) {
  // [TODO] Get rid of `toDate` or `constructFrom`?
  return constructFrom(context || argument, argument);
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_toDate = ((/* unused pure expression or super */ null && (toDate)));

;// ./node_modules/date-fns/addDays.js



/**
 * The {@link addDays} function options.
 */

/**
 * @name addDays
 * @category Day Helpers
 * @summary Add the specified number of days to the given date.
 *
 * @description
 * Add the specified number of days to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The date to be changed
 * @param amount - The amount of days to be added.
 * @param options - An object with options
 *
 * @returns The new date with the days added
 *
 * @example
 * // Add 10 days to 1 September 2014:
 * const result = addDays(new Date(2014, 8, 1), 10)
 * //=> Thu Sep 11 2014 00:00:00
 */
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);

  // If 0 days, no-op to avoid changing times in the hour before end of DST
  if (!amount) return _date;

  _date.setDate(_date.getDate() + amount);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_addDays = ((/* unused pure expression or super */ null && (addDays)));

;// ./src/todoAppSerializer.js


function storageAvailable() {
    let storage;
    try {
        storage = window["localStorage"];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

function loadProjects() {
    if (storageAvailable() == false) {
        throw new Error("Local Storage unavailable");
    }

    const projectsJson = localStorage.getItem("projects");
    if (projectsJson == null) {
        return [];
    }

    try {
        const projectsJsonArray = JSON.parse(projectsJson);

        if(projectsJsonArray == false || Array.isArray(projectsJsonArray) == false) {
            throw new Error();
        }

        const projects = projectsJsonArray.map((item) => {
            const project = new todoProject();
            project.fromJson(item);

            return project;
        });

        return projects;
    } catch (error) {
        console.error("Failed to parse projects json from LocalStorage\n" + error);
        return [];
    }
}

function saveProjects(projects) {
    if (storageAvailable() == false) {
        throw new Error("Local Storage unavailable");
    }

    const projectsJsonArray = projects.map((item) => item.toJson());
    const projectsJsonString = JSON.stringify(projectsJsonArray);

    localStorage.setItem("projects", projectsJsonString);
}


;// ./src/todoAppData.js






const PROJECT_CREATED_EVENT = "projectCreated";
const PROJECT_DELETED_EVENT = "projectDeleted";

const projects = [];
const appEvents = new (events_default())();

function loadData() {
    try {
        const projectsLoaded = loadProjects();
        if (projectsLoaded.length === 0) {
            const demoProject = createDemoProject();
            projects.push(demoProject);
        }
        else {
            projectsLoaded.forEach((item) => projects.push(item));
        }
    } catch (error) {
        console.error("Failed to load projects.\n" + error);
    }
}

function createDemoProject() {
    const demoProject = new todoProject("Demo project");

    const codingSection = demoProject.addSection("Coding");
    const workoutSection = demoProject.addSection("Workout");

    const todoAppTask = codingSection.addTask("Todo app", "Finish the todo app project", null, todoPriorities.Highest);
    todoAppTask.done = true;
    const odinTask = codingSection.addTask("Odin", "Continue the odin project course", null, todoPriorities.Medium);

    const workoutTask = workoutSection.addTask("Leg day");
    let workoutDueDate = new Date(Date.now());
    workoutDueDate = addDays(workoutDueDate, 3);
    workoutTask.date = workoutDueDate;

    return demoProject;
}

function getProjects() {
    return [...projects];
}

function addProject(title) {
    const project = new todoProject(title);

    projects.push(project);

    appEvents.emit(PROJECT_CREATED_EVENT, project);

    return project;
}

function deleteProject(projectToDelete) {
    const index = projects.indexOf(projectToDelete);
    if (index >= 0) {
        projects.splice(index, 1);
        appEvents.emit(PROJECT_DELETED_EVENT, projectToDelete);
    }
}

function addProjectCreatedListener(func) {
    appEvents.on(PROJECT_CREATED_EVENT, func);
}

function removeProjectCreatedListener(func) {
    appEvents.removeListener(PROJECT_CREATED_EVENT, func);
}

function addProjectDeletedListener(func) {
    appEvents.on(PROJECT_DELETED_EVENT, func);
}

function removeProjectDeletedListener(func) {
    appEvents.removeListener(PROJECT_DELETED_EVENT, func);
}

function saveChanges() {
    try {
        saveProjects(projects);
    } catch (error) {
        console.error("Failed to save projects.\n" + error);
    }
}

const todoData = {
    loadData,
    getProjects,
    addProject,
    deleteProject,
    addProjectCreatedListener,
    removeProjectCreatedListener,
    addProjectDeletedListener,
    removeProjectDeletedListener,
    saveChanges
};

/* harmony default export */ const todoAppData = (todoData);
;// ./node_modules/iconify-icon/dist/iconify-icon.mjs
/**
* (c) Iconify
*
* For the full copyright and license information, please view the license.txt
* files at https://github.com/iconify/iconify
*
* Licensed under MIT.
*
* @license MIT
* @version 2.3.0
*/
const defaultIconDimensions = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
);
const defaultIconTransformations = Object.freeze({
  rotate: 0,
  vFlip: false,
  hFlip: false
});
const defaultIconProps = Object.freeze({
  ...defaultIconDimensions,
  ...defaultIconTransformations
});
const defaultExtendedIconProps = Object.freeze({
  ...defaultIconProps,
  body: "",
  hidden: false
});

const defaultIconSizeCustomisations = Object.freeze({
  width: null,
  height: null
});
const defaultIconCustomisations = Object.freeze({
  // Dimensions
  ...defaultIconSizeCustomisations,
  // Transformations
  ...defaultIconTransformations
});

function rotateFromString(value, defaultValue = 0) {
  const units = value.replace(/^-?[0-9.]*/, "");
  function cleanup(value2) {
    while (value2 < 0) {
      value2 += 4;
    }
    return value2 % 4;
  }
  if (units === "") {
    const num = parseInt(value);
    return isNaN(num) ? 0 : cleanup(num);
  } else if (units !== value) {
    let split = 0;
    switch (units) {
      case "%":
        split = 25;
        break;
      case "deg":
        split = 90;
    }
    if (split) {
      let num = parseFloat(value.slice(0, value.length - units.length));
      if (isNaN(num)) {
        return 0;
      }
      num = num / split;
      return num % 1 === 0 ? cleanup(num) : 0;
    }
  }
  return defaultValue;
}

const separator = /[\s,]+/;
function flipFromString(custom, flip) {
  flip.split(separator).forEach((str) => {
    const value = str.trim();
    switch (value) {
      case "horizontal":
        custom.hFlip = true;
        break;
      case "vertical":
        custom.vFlip = true;
        break;
    }
  });
}

const defaultCustomisations = {
    ...defaultIconCustomisations,
    preserveAspectRatio: '',
};
/**
 * Get customisations
 */
function getCustomisations(node) {
    const customisations = {
        ...defaultCustomisations,
    };
    const attr = (key, def) => node.getAttribute(key) || def;
    // Dimensions
    customisations.width = attr('width', null);
    customisations.height = attr('height', null);
    // Rotation
    customisations.rotate = rotateFromString(attr('rotate', ''));
    // Flip
    flipFromString(customisations, attr('flip', ''));
    // SVG attributes
    customisations.preserveAspectRatio = attr('preserveAspectRatio', attr('preserveaspectratio', ''));
    return customisations;
}
/**
 * Check if customisations have been updated
 */
function haveCustomisationsChanged(value1, value2) {
    for (const key in defaultCustomisations) {
        if (value1[key] !== value2[key]) {
            return true;
        }
    }
    return false;
}

const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
  const colonSeparated = value.split(":");
  if (value.slice(0, 1) === "@") {
    if (colonSeparated.length < 2 || colonSeparated.length > 3) {
      return null;
    }
    provider = colonSeparated.shift().slice(1);
  }
  if (colonSeparated.length > 3 || !colonSeparated.length) {
    return null;
  }
  if (colonSeparated.length > 1) {
    const name2 = colonSeparated.pop();
    const prefix = colonSeparated.pop();
    const result = {
      // Allow provider without '@': "provider:prefix:name"
      provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
      prefix,
      name: name2
    };
    return validate && !validateIconName(result) ? null : result;
  }
  const name = colonSeparated[0];
  const dashSeparated = name.split("-");
  if (dashSeparated.length > 1) {
    const result = {
      provider,
      prefix: dashSeparated.shift(),
      name: dashSeparated.join("-")
    };
    return validate && !validateIconName(result) ? null : result;
  }
  if (allowSimpleName && provider === "") {
    const result = {
      provider,
      prefix: "",
      name
    };
    return validate && !validateIconName(result, allowSimpleName) ? null : result;
  }
  return null;
};
const validateIconName = (icon, allowSimpleName) => {
  if (!icon) {
    return false;
  }
  return !!// Check prefix: cannot be empty, unless allowSimpleName is enabled
  // Check name: cannot be empty
  ((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
};

function mergeIconTransformations(obj1, obj2) {
  const result = {};
  if (!obj1.hFlip !== !obj2.hFlip) {
    result.hFlip = true;
  }
  if (!obj1.vFlip !== !obj2.vFlip) {
    result.vFlip = true;
  }
  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
  if (rotate) {
    result.rotate = rotate;
  }
  return result;
}

function mergeIconData(parent, child) {
  const result = mergeIconTransformations(parent, child);
  for (const key in defaultExtendedIconProps) {
    if (key in defaultIconTransformations) {
      if (key in parent && !(key in result)) {
        result[key] = defaultIconTransformations[key];
      }
    } else if (key in child) {
      result[key] = child[key];
    } else if (key in parent) {
      result[key] = parent[key];
    }
  }
  return result;
}

function getIconsTree(data, names) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  const resolved = /* @__PURE__ */ Object.create(null);
  function resolve(name) {
    if (icons[name]) {
      return resolved[name] = [];
    }
    if (!(name in resolved)) {
      resolved[name] = null;
      const parent = aliases[name] && aliases[name].parent;
      const value = parent && resolve(parent);
      if (value) {
        resolved[name] = [parent].concat(value);
      }
    }
    return resolved[name];
  }
  (Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
  return resolved;
}

function internalGetIconData(data, name, tree) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  let currentProps = {};
  function parse(name2) {
    currentProps = mergeIconData(
      icons[name2] || aliases[name2],
      currentProps
    );
  }
  parse(name);
  tree.forEach(parse);
  return mergeIconData(data, currentProps);
}

function parseIconSet(data, callback) {
  const names = [];
  if (typeof data !== "object" || typeof data.icons !== "object") {
    return names;
  }
  if (data.not_found instanceof Array) {
    data.not_found.forEach((name) => {
      callback(name, null);
      names.push(name);
    });
  }
  const tree = getIconsTree(data);
  for (const name in tree) {
    const item = tree[name];
    if (item) {
      callback(name, internalGetIconData(data, name, item));
      names.push(name);
    }
  }
  return names;
}

const optionalPropertyDefaults = {
  provider: "",
  aliases: {},
  not_found: {},
  ...defaultIconDimensions
};
function checkOptionalProps(item, defaults) {
  for (const prop in defaults) {
    if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
      return false;
    }
  }
  return true;
}
function quicklyValidateIconSet(obj) {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  const data = obj;
  if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
    return null;
  }
  if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
    return null;
  }
  const icons = data.icons;
  for (const name in icons) {
    const icon = icons[name];
    if (
      // Name cannot be empty
      !name || // Must have body
      typeof icon.body !== "string" || // Check other props
      !checkOptionalProps(
        icon,
        defaultExtendedIconProps
      )
    ) {
      return null;
    }
  }
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  for (const name in aliases) {
    const icon = aliases[name];
    const parent = icon.parent;
    if (
      // Name cannot be empty
      !name || // Parent must be set and point to existing icon
      typeof parent !== "string" || !icons[parent] && !aliases[parent] || // Check other props
      !checkOptionalProps(
        icon,
        defaultExtendedIconProps
      )
    ) {
      return null;
    }
  }
  return data;
}

const dataStorage = /* @__PURE__ */ Object.create(null);
function newStorage(provider, prefix) {
  return {
    provider,
    prefix,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function getStorage(provider, prefix) {
  const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
  return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
}
function addIconSet(storage, data) {
  if (!quicklyValidateIconSet(data)) {
    return [];
  }
  return parseIconSet(data, (name, icon) => {
    if (icon) {
      storage.icons[name] = icon;
    } else {
      storage.missing.add(name);
    }
  });
}
function addIconToStorage(storage, name, icon) {
  try {
    if (typeof icon.body === "string") {
      storage.icons[name] = { ...icon };
      return true;
    }
  } catch (err) {
  }
  return false;
}
function listIcons$1(provider, prefix) {
  let allIcons = [];
  const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
  providers.forEach((provider2) => {
    const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
    prefixes.forEach((prefix2) => {
      const storage = getStorage(provider2, prefix2);
      allIcons = allIcons.concat(
        Object.keys(storage.icons).map(
          (name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name
        )
      );
    });
  });
  return allIcons;
}

let simpleNames = false;
function allowSimpleNames(allow) {
  if (typeof allow === "boolean") {
    simpleNames = allow;
  }
  return simpleNames;
}
function getIconData(name) {
  const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
  if (icon) {
    const storage = getStorage(icon.provider, icon.prefix);
    const iconName = icon.name;
    return storage.icons[iconName] || (storage.missing.has(iconName) ? null : void 0);
  }
}
function addIcon$1(name, data) {
  const icon = stringToIcon(name, true, simpleNames);
  if (!icon) {
    return false;
  }
  const storage = getStorage(icon.provider, icon.prefix);
  if (data) {
    return addIconToStorage(storage, icon.name, data);
  } else {
    storage.missing.add(icon.name);
    return true;
  }
}
function addCollection$1(data, provider) {
  if (typeof data !== "object") {
    return false;
  }
  if (typeof provider !== "string") {
    provider = data.provider || "";
  }
  if (simpleNames && !provider && !data.prefix) {
    let added = false;
    if (quicklyValidateIconSet(data)) {
      data.prefix = "";
      parseIconSet(data, (name, icon) => {
        if (addIcon$1(name, icon)) {
          added = true;
        }
      });
    }
    return added;
  }
  const prefix = data.prefix;
  if (!validateIconName({
    provider,
    prefix,
    name: "a"
  })) {
    return false;
  }
  const storage = getStorage(provider, prefix);
  return !!addIconSet(storage, data);
}
function iconLoaded$1(name) {
  return !!getIconData(name);
}
function getIcon$1(name) {
  const result = getIconData(name);
  return result ? {
    ...defaultIconProps,
    ...result
  } : result;
}

function sortIcons(icons) {
  const result = {
    loaded: [],
    missing: [],
    pending: []
  };
  const storage = /* @__PURE__ */ Object.create(null);
  icons.sort((a, b) => {
    if (a.provider !== b.provider) {
      return a.provider.localeCompare(b.provider);
    }
    if (a.prefix !== b.prefix) {
      return a.prefix.localeCompare(b.prefix);
    }
    return a.name.localeCompare(b.name);
  });
  let lastIcon = {
    provider: "",
    prefix: "",
    name: ""
  };
  icons.forEach((icon) => {
    if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
      return;
    }
    lastIcon = icon;
    const provider = icon.provider;
    const prefix = icon.prefix;
    const name = icon.name;
    const providerStorage = storage[provider] || (storage[provider] = /* @__PURE__ */ Object.create(null));
    const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
    let list;
    if (name in localStorage.icons) {
      list = result.loaded;
    } else if (prefix === "" || localStorage.missing.has(name)) {
      list = result.missing;
    } else {
      list = result.pending;
    }
    const item = {
      provider,
      prefix,
      name
    };
    list.push(item);
  });
  return result;
}

function removeCallback(storages, id) {
  storages.forEach((storage) => {
    const items = storage.loaderCallbacks;
    if (items) {
      storage.loaderCallbacks = items.filter((row) => row.id !== id);
    }
  });
}
function updateCallbacks(storage) {
  if (!storage.pendingCallbacksFlag) {
    storage.pendingCallbacksFlag = true;
    setTimeout(() => {
      storage.pendingCallbacksFlag = false;
      const items = storage.loaderCallbacks ? storage.loaderCallbacks.slice(0) : [];
      if (!items.length) {
        return;
      }
      let hasPending = false;
      const provider = storage.provider;
      const prefix = storage.prefix;
      items.forEach((item) => {
        const icons = item.icons;
        const oldLength = icons.pending.length;
        icons.pending = icons.pending.filter((icon) => {
          if (icon.prefix !== prefix) {
            return true;
          }
          const name = icon.name;
          if (storage.icons[name]) {
            icons.loaded.push({
              provider,
              prefix,
              name
            });
          } else if (storage.missing.has(name)) {
            icons.missing.push({
              provider,
              prefix,
              name
            });
          } else {
            hasPending = true;
            return true;
          }
          return false;
        });
        if (icons.pending.length !== oldLength) {
          if (!hasPending) {
            removeCallback([storage], item.id);
          }
          item.callback(
            icons.loaded.slice(0),
            icons.missing.slice(0),
            icons.pending.slice(0),
            item.abort
          );
        }
      });
    });
  }
}
let idCounter = 0;
function storeCallback(callback, icons, pendingSources) {
  const id = idCounter++;
  const abort = removeCallback.bind(null, pendingSources, id);
  if (!icons.pending.length) {
    return abort;
  }
  const item = {
    id,
    icons,
    callback,
    abort
  };
  pendingSources.forEach((storage) => {
    (storage.loaderCallbacks || (storage.loaderCallbacks = [])).push(item);
  });
  return abort;
}

const storage = /* @__PURE__ */ Object.create(null);
function setAPIModule(provider, item) {
  storage[provider] = item;
}
function getAPIModule(provider) {
  return storage[provider] || storage[""];
}

function listToIcons(list, validate = true, simpleNames = false) {
  const result = [];
  list.forEach((item) => {
    const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames) : item;
    if (icon) {
      result.push(icon);
    }
  });
  return result;
}

// src/config.ts
var defaultConfig = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: false,
  dataAfterTimeout: false
};

// src/query.ts
function sendQuery(config, payload, query, done) {
  const resourcesCount = config.resources.length;
  const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
  let resources;
  if (config.random) {
    let list = config.resources.slice(0);
    resources = [];
    while (list.length > 1) {
      const nextIndex = Math.floor(Math.random() * list.length);
      resources.push(list[nextIndex]);
      list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
    }
    resources = resources.concat(list);
  } else {
    resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
  }
  const startTime = Date.now();
  let status = "pending";
  let queriesSent = 0;
  let lastError;
  let timer = null;
  let queue = [];
  let doneCallbacks = [];
  if (typeof done === "function") {
    doneCallbacks.push(done);
  }
  function resetTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function abort() {
    if (status === "pending") {
      status = "aborted";
    }
    resetTimer();
    queue.forEach((item) => {
      if (item.status === "pending") {
        item.status = "aborted";
      }
    });
    queue = [];
  }
  function subscribe(callback, overwrite) {
    if (overwrite) {
      doneCallbacks = [];
    }
    if (typeof callback === "function") {
      doneCallbacks.push(callback);
    }
  }
  function getQueryStatus() {
    return {
      startTime,
      payload,
      status,
      queriesSent,
      queriesPending: queue.length,
      subscribe,
      abort
    };
  }
  function failQuery() {
    status = "failed";
    doneCallbacks.forEach((callback) => {
      callback(void 0, lastError);
    });
  }
  function clearQueue() {
    queue.forEach((item) => {
      if (item.status === "pending") {
        item.status = "aborted";
      }
    });
    queue = [];
  }
  function moduleResponse(item, response, data) {
    const isError = response !== "success";
    queue = queue.filter((queued) => queued !== item);
    switch (status) {
      case "pending":
        break;
      case "failed":
        if (isError || !config.dataAfterTimeout) {
          return;
        }
        break;
      default:
        return;
    }
    if (response === "abort") {
      lastError = data;
      failQuery();
      return;
    }
    if (isError) {
      lastError = data;
      if (!queue.length) {
        if (!resources.length) {
          failQuery();
        } else {
          execNext();
        }
      }
      return;
    }
    resetTimer();
    clearQueue();
    if (!config.random) {
      const index = config.resources.indexOf(item.resource);
      if (index !== -1 && index !== config.index) {
        config.index = index;
      }
    }
    status = "completed";
    doneCallbacks.forEach((callback) => {
      callback(data);
    });
  }
  function execNext() {
    if (status !== "pending") {
      return;
    }
    resetTimer();
    const resource = resources.shift();
    if (resource === void 0) {
      if (queue.length) {
        timer = setTimeout(() => {
          resetTimer();
          if (status === "pending") {
            clearQueue();
            failQuery();
          }
        }, config.timeout);
        return;
      }
      failQuery();
      return;
    }
    const item = {
      status: "pending",
      resource,
      callback: (status2, data) => {
        moduleResponse(item, status2, data);
      }
    };
    queue.push(item);
    queriesSent++;
    timer = setTimeout(execNext, config.rotate);
    query(resource, payload, item.callback);
  }
  setTimeout(execNext);
  return getQueryStatus;
}

// src/index.ts
function initRedundancy(cfg) {
  const config = {
    ...defaultConfig,
    ...cfg
  };
  let queries = [];
  function cleanup() {
    queries = queries.filter((item) => item().status === "pending");
  }
  function query(payload, queryCallback, doneCallback) {
    const query2 = sendQuery(
      config,
      payload,
      queryCallback,
      (data, error) => {
        cleanup();
        if (doneCallback) {
          doneCallback(data, error);
        }
      }
    );
    queries.push(query2);
    return query2;
  }
  function find(callback) {
    return queries.find((value) => {
      return callback(value);
    }) || null;
  }
  const instance = {
    query,
    find,
    setIndex: (index) => {
      config.index = index;
    },
    getIndex: () => config.index,
    cleanup
  };
  return instance;
}

function createAPIConfig(source) {
  let resources;
  if (typeof source.resources === "string") {
    resources = [source.resources];
  } else {
    resources = source.resources;
    if (!(resources instanceof Array) || !resources.length) {
      return null;
    }
  }
  const result = {
    // API hosts
    resources,
    // Root path
    path: source.path || "/",
    // URL length limit
    maxURL: source.maxURL || 500,
    // Timeout before next host is used.
    rotate: source.rotate || 750,
    // Timeout before failing query.
    timeout: source.timeout || 5e3,
    // Randomise default API end point.
    random: source.random === true,
    // Start index
    index: source.index || 0,
    // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
    dataAfterTimeout: source.dataAfterTimeout !== false
  };
  return result;
}
const configStorage = /* @__PURE__ */ Object.create(null);
const fallBackAPISources = [
  "https://api.simplesvg.com",
  "https://api.unisvg.com"
];
const fallBackAPI = [];
while (fallBackAPISources.length > 0) {
  if (fallBackAPISources.length === 1) {
    fallBackAPI.push(fallBackAPISources.shift());
  } else {
    if (Math.random() > 0.5) {
      fallBackAPI.push(fallBackAPISources.shift());
    } else {
      fallBackAPI.push(fallBackAPISources.pop());
    }
  }
}
configStorage[""] = createAPIConfig({
  resources: ["https://api.iconify.design"].concat(fallBackAPI)
});
function addAPIProvider$1(provider, customConfig) {
  const config = createAPIConfig(customConfig);
  if (config === null) {
    return false;
  }
  configStorage[provider] = config;
  return true;
}
function getAPIConfig(provider) {
  return configStorage[provider];
}
function listAPIProviders() {
  return Object.keys(configStorage);
}

function emptyCallback$1() {
}
const redundancyCache = /* @__PURE__ */ Object.create(null);
function getRedundancyCache(provider) {
  if (!redundancyCache[provider]) {
    const config = getAPIConfig(provider);
    if (!config) {
      return;
    }
    const redundancy = initRedundancy(config);
    const cachedReundancy = {
      config,
      redundancy
    };
    redundancyCache[provider] = cachedReundancy;
  }
  return redundancyCache[provider];
}
function sendAPIQuery(target, query, callback) {
  let redundancy;
  let send;
  if (typeof target === "string") {
    const api = getAPIModule(target);
    if (!api) {
      callback(void 0, 424);
      return emptyCallback$1;
    }
    send = api.send;
    const cached = getRedundancyCache(target);
    if (cached) {
      redundancy = cached.redundancy;
    }
  } else {
    const config = createAPIConfig(target);
    if (config) {
      redundancy = initRedundancy(config);
      const moduleKey = target.resources ? target.resources[0] : "";
      const api = getAPIModule(moduleKey);
      if (api) {
        send = api.send;
      }
    }
  }
  if (!redundancy || !send) {
    callback(void 0, 424);
    return emptyCallback$1;
  }
  return redundancy.query(query, send, callback)().abort;
}

function emptyCallback() {
}
function loadedNewIcons(storage) {
  if (!storage.iconsLoaderFlag) {
    storage.iconsLoaderFlag = true;
    setTimeout(() => {
      storage.iconsLoaderFlag = false;
      updateCallbacks(storage);
    });
  }
}
function checkIconNamesForAPI(icons) {
  const valid = [];
  const invalid = [];
  icons.forEach((name) => {
    (name.match(matchIconName) ? valid : invalid).push(name);
  });
  return {
    valid,
    invalid
  };
}
function parseLoaderResponse(storage, icons, data) {
  function checkMissing() {
    const pending = storage.pendingIcons;
    icons.forEach((name) => {
      if (pending) {
        pending.delete(name);
      }
      if (!storage.icons[name]) {
        storage.missing.add(name);
      }
    });
  }
  if (data && typeof data === "object") {
    try {
      const parsed = addIconSet(storage, data);
      if (!parsed.length) {
        checkMissing();
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }
  checkMissing();
  loadedNewIcons(storage);
}
function parsePossiblyAsyncResponse(response, callback) {
  if (response instanceof Promise) {
    response.then((data) => {
      callback(data);
    }).catch(() => {
      callback(null);
    });
  } else {
    callback(response);
  }
}
function loadNewIcons(storage, icons) {
  if (!storage.iconsToLoad) {
    storage.iconsToLoad = icons;
  } else {
    storage.iconsToLoad = storage.iconsToLoad.concat(icons).sort();
  }
  if (!storage.iconsQueueFlag) {
    storage.iconsQueueFlag = true;
    setTimeout(() => {
      storage.iconsQueueFlag = false;
      const { provider, prefix } = storage;
      const icons2 = storage.iconsToLoad;
      delete storage.iconsToLoad;
      if (!icons2 || !icons2.length) {
        return;
      }
      const customIconLoader = storage.loadIcon;
      if (storage.loadIcons && (icons2.length > 1 || !customIconLoader)) {
        parsePossiblyAsyncResponse(
          storage.loadIcons(icons2, prefix, provider),
          (data) => {
            parseLoaderResponse(storage, icons2, data);
          }
        );
        return;
      }
      if (customIconLoader) {
        icons2.forEach((name) => {
          const response = customIconLoader(name, prefix, provider);
          parsePossiblyAsyncResponse(response, (data) => {
            const iconSet = data ? {
              prefix,
              icons: {
                [name]: data
              }
            } : null;
            parseLoaderResponse(storage, [name], iconSet);
          });
        });
        return;
      }
      const { valid, invalid } = checkIconNamesForAPI(icons2);
      if (invalid.length) {
        parseLoaderResponse(storage, invalid, null);
      }
      if (!valid.length) {
        return;
      }
      const api = prefix.match(matchIconName) ? getAPIModule(provider) : null;
      if (!api) {
        parseLoaderResponse(storage, valid, null);
        return;
      }
      const params = api.prepare(provider, prefix, valid);
      params.forEach((item) => {
        sendAPIQuery(provider, item, (data) => {
          parseLoaderResponse(storage, item.icons, data);
        });
      });
    });
  }
}
const loadIcons$1 = (icons, callback) => {
  const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
  const sortedIcons = sortIcons(cleanedIcons);
  if (!sortedIcons.pending.length) {
    let callCallback = true;
    if (callback) {
      setTimeout(() => {
        if (callCallback) {
          callback(
            sortedIcons.loaded,
            sortedIcons.missing,
            sortedIcons.pending,
            emptyCallback
          );
        }
      });
    }
    return () => {
      callCallback = false;
    };
  }
  const newIcons = /* @__PURE__ */ Object.create(null);
  const sources = [];
  let lastProvider, lastPrefix;
  sortedIcons.pending.forEach((icon) => {
    const { provider, prefix } = icon;
    if (prefix === lastPrefix && provider === lastProvider) {
      return;
    }
    lastProvider = provider;
    lastPrefix = prefix;
    sources.push(getStorage(provider, prefix));
    const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
    if (!providerNewIcons[prefix]) {
      providerNewIcons[prefix] = [];
    }
  });
  sortedIcons.pending.forEach((icon) => {
    const { provider, prefix, name } = icon;
    const storage = getStorage(provider, prefix);
    const pendingQueue = storage.pendingIcons || (storage.pendingIcons = /* @__PURE__ */ new Set());
    if (!pendingQueue.has(name)) {
      pendingQueue.add(name);
      newIcons[provider][prefix].push(name);
    }
  });
  sources.forEach((storage) => {
    const list = newIcons[storage.provider][storage.prefix];
    if (list.length) {
      loadNewIcons(storage, list);
    }
  });
  return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
};
const loadIcon$1 = (icon) => {
  return new Promise((fulfill, reject) => {
    const iconObj = typeof icon === "string" ? stringToIcon(icon, true) : icon;
    if (!iconObj) {
      reject(icon);
      return;
    }
    loadIcons$1([iconObj || icon], (loaded) => {
      if (loaded.length && iconObj) {
        const data = getIconData(iconObj);
        if (data) {
          fulfill({
            ...defaultIconProps,
            ...data
          });
          return;
        }
      }
      reject(icon);
    });
  });
};

/**
 * Test icon string
 */
function testIconObject(value) {
    try {
        const obj = typeof value === 'string' ? JSON.parse(value) : value;
        if (typeof obj.body === 'string') {
            return {
                ...obj,
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (err) {
        //
    }
}

/**
 * Parse icon value, load if needed
 */
function parseIconValue(value, onload) {
    if (typeof value === 'object') {
        const data = testIconObject(value);
        return {
            data,
            value,
        };
    }
    if (typeof value !== 'string') {
        // Invalid value
        return {
            value,
        };
    }
    // Check for JSON
    if (value.includes('{')) {
        const data = testIconObject(value);
        if (data) {
            return {
                data,
                value,
            };
        }
    }
    // Parse icon name
    const name = stringToIcon(value, true, true);
    if (!name) {
        return {
            value,
        };
    }
    // Valid icon name: check if data is available
    const data = getIconData(name);
    // Icon data exists or icon has no prefix. Do not load icon from API if icon has no prefix
    if (data !== undefined || !name.prefix) {
        return {
            value,
            name,
            data, // could be 'null' -> icon is missing
        };
    }
    // Load icon
    const loading = loadIcons$1([name], () => onload(value, name, getIconData(name)));
    return {
        value,
        name,
        loading,
    };
}

// Check for Safari
let isBuggedSafari = false;
try {
    isBuggedSafari = navigator.vendor.indexOf('Apple') === 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
}
catch (err) {
    //
}
/**
 * Get render mode
 */
function getRenderMode(body, mode) {
    switch (mode) {
        // Force mode
        case 'svg':
        case 'bg':
        case 'mask':
            return mode;
    }
    // Check for animation, use 'style' for animated icons, unless browser is Safari
    // (only <a>, which should be ignored or animations start with '<a')
    if (mode !== 'style' &&
        (isBuggedSafari || body.indexOf('<a') === -1)) {
        // Render <svg>
        return 'svg';
    }
    // Use background or mask
    return body.indexOf('currentColor') === -1 ? 'bg' : 'mask';
}

const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function calculateSize$1(size, ratio, precision) {
  if (ratio === 1) {
    return size;
  }
  precision = precision || 100;
  if (typeof size === "number") {
    return Math.ceil(size * ratio * precision) / precision;
  }
  if (typeof size !== "string") {
    return size;
  }
  const oldParts = size.split(unitsSplit);
  if (oldParts === null || !oldParts.length) {
    return size;
  }
  const newParts = [];
  let code = oldParts.shift();
  let isNumber = unitsTest.test(code);
  while (true) {
    if (isNumber) {
      const num = parseFloat(code);
      if (isNaN(num)) {
        newParts.push(code);
      } else {
        newParts.push(Math.ceil(num * ratio * precision) / precision);
      }
    } else {
      newParts.push(code);
    }
    code = oldParts.shift();
    if (code === void 0) {
      return newParts.join("");
    }
    isNumber = !isNumber;
  }
}

function splitSVGDefs(content, tag = "defs") {
  let defs = "";
  const index = content.indexOf("<" + tag);
  while (index >= 0) {
    const start = content.indexOf(">", index);
    const end = content.indexOf("</" + tag);
    if (start === -1 || end === -1) {
      break;
    }
    const endEnd = content.indexOf(">", end);
    if (endEnd === -1) {
      break;
    }
    defs += content.slice(start + 1, end).trim();
    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
  }
  return {
    defs,
    content
  };
}
function mergeDefsAndContent(defs, content) {
  return defs ? "<defs>" + defs + "</defs>" + content : content;
}
function wrapSVGContent(body, start, end) {
  const split = splitSVGDefs(body);
  return mergeDefsAndContent(split.defs, start + split.content + end);
}

const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
function iconToSVG(icon, customisations) {
  const fullIcon = {
    ...defaultIconProps,
    ...icon
  };
  const fullCustomisations = {
    ...defaultIconCustomisations,
    ...customisations
  };
  const box = {
    left: fullIcon.left,
    top: fullIcon.top,
    width: fullIcon.width,
    height: fullIcon.height
  };
  let body = fullIcon.body;
  [fullIcon, fullCustomisations].forEach((props) => {
    const transformations = [];
    const hFlip = props.hFlip;
    const vFlip = props.vFlip;
    let rotation = props.rotate;
    if (hFlip) {
      if (vFlip) {
        rotation += 2;
      } else {
        transformations.push(
          "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
        );
        transformations.push("scale(-1 1)");
        box.top = box.left = 0;
      }
    } else if (vFlip) {
      transformations.push(
        "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
      );
      transformations.push("scale(1 -1)");
      box.top = box.left = 0;
    }
    let tempValue;
    if (rotation < 0) {
      rotation -= Math.floor(rotation / 4) * 4;
    }
    rotation = rotation % 4;
    switch (rotation) {
      case 1:
        tempValue = box.height / 2 + box.top;
        transformations.unshift(
          "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
      case 2:
        transformations.unshift(
          "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
        );
        break;
      case 3:
        tempValue = box.width / 2 + box.left;
        transformations.unshift(
          "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
    }
    if (rotation % 2 === 1) {
      if (box.left !== box.top) {
        tempValue = box.left;
        box.left = box.top;
        box.top = tempValue;
      }
      if (box.width !== box.height) {
        tempValue = box.width;
        box.width = box.height;
        box.height = tempValue;
      }
    }
    if (transformations.length) {
      body = wrapSVGContent(
        body,
        '<g transform="' + transformations.join(" ") + '">',
        "</g>"
      );
    }
  });
  const customisationsWidth = fullCustomisations.width;
  const customisationsHeight = fullCustomisations.height;
  const boxWidth = box.width;
  const boxHeight = box.height;
  let width;
  let height;
  if (customisationsWidth === null) {
    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    width = calculateSize$1(height, boxWidth / boxHeight);
  } else {
    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
    height = customisationsHeight === null ? calculateSize$1(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
  }
  const attributes = {};
  const setAttr = (prop, value) => {
    if (!isUnsetKeyword(value)) {
      attributes[prop] = value.toString();
    }
  };
  setAttr("width", width);
  setAttr("height", height);
  const viewBox = [box.left, box.top, boxWidth, boxHeight];
  attributes.viewBox = viewBox.join(" ");
  return {
    attributes,
    viewBox,
    body
  };
}

function iconToHTML$1(body, attributes) {
  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const attr in attributes) {
    renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
}

function encodeSVGforURL(svg) {
  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function svgToData(svg) {
  return "data:image/svg+xml," + encodeSVGforURL(svg);
}
function svgToURL$1(svg) {
  return 'url("' + svgToData(svg) + '")';
}

const detectFetch = () => {
  let callback;
  try {
    callback = fetch;
    if (typeof callback === "function") {
      return callback;
    }
  } catch (err) {
  }
};
let fetchModule = detectFetch();
function setFetch(fetch2) {
  fetchModule = fetch2;
}
function getFetch() {
  return fetchModule;
}
function calculateMaxLength(provider, prefix) {
  const config = getAPIConfig(provider);
  if (!config) {
    return 0;
  }
  let result;
  if (!config.maxURL) {
    result = 0;
  } else {
    let maxHostLength = 0;
    config.resources.forEach((item) => {
      const host = item;
      maxHostLength = Math.max(maxHostLength, host.length);
    });
    const url = prefix + ".json?icons=";
    result = config.maxURL - maxHostLength - config.path.length - url.length;
  }
  return result;
}
function shouldAbort(status) {
  return status === 404;
}
const prepare = (provider, prefix, icons) => {
  const results = [];
  const maxLength = calculateMaxLength(provider, prefix);
  const type = "icons";
  let item = {
    type,
    provider,
    prefix,
    icons: []
  };
  let length = 0;
  icons.forEach((name, index) => {
    length += name.length + 1;
    if (length >= maxLength && index > 0) {
      results.push(item);
      item = {
        type,
        provider,
        prefix,
        icons: []
      };
      length = name.length;
    }
    item.icons.push(name);
  });
  results.push(item);
  return results;
};
function getPath(provider) {
  if (typeof provider === "string") {
    const config = getAPIConfig(provider);
    if (config) {
      return config.path;
    }
  }
  return "/";
}
const send = (host, params, callback) => {
  if (!fetchModule) {
    callback("abort", 424);
    return;
  }
  let path = getPath(params.provider);
  switch (params.type) {
    case "icons": {
      const prefix = params.prefix;
      const icons = params.icons;
      const iconsList = icons.join(",");
      const urlParams = new URLSearchParams({
        icons: iconsList
      });
      path += prefix + ".json?" + urlParams.toString();
      break;
    }
    case "custom": {
      const uri = params.uri;
      path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
      break;
    }
    default:
      callback("abort", 400);
      return;
  }
  let defaultError = 503;
  fetchModule(host + path).then((response) => {
    const status = response.status;
    if (status !== 200) {
      setTimeout(() => {
        callback(shouldAbort(status) ? "abort" : "next", status);
      });
      return;
    }
    defaultError = 501;
    return response.json();
  }).then((data) => {
    if (typeof data !== "object" || data === null) {
      setTimeout(() => {
        if (data === 404) {
          callback("abort", data);
        } else {
          callback("next", defaultError);
        }
      });
      return;
    }
    setTimeout(() => {
      callback("success", data);
    });
  }).catch(() => {
    callback("next", defaultError);
  });
};
const fetchAPIModule = {
  prepare,
  send
};

function setCustomIconsLoader$1(loader, prefix, provider) {
  getStorage(provider || "", prefix).loadIcons = loader;
}
function setCustomIconLoader$1(loader, prefix, provider) {
  getStorage(provider || "", prefix).loadIcon = loader;
}

/**
 * Attribute to add
 */
const nodeAttr = 'data-style';
/**
 * Custom style to add to each node
 */
let customStyle = '';
/**
 * Set custom style to add to all components
 *
 * Affects only components rendered after function call
 */
function appendCustomStyle(style) {
    customStyle = style;
}
/**
 * Add/update style node
 */
function updateStyle(parent, inline) {
    // Get node, create if needed
    let styleNode = Array.from(parent.childNodes).find((node) => node.hasAttribute &&
        node.hasAttribute(nodeAttr));
    if (!styleNode) {
        styleNode = document.createElement('style');
        styleNode.setAttribute(nodeAttr, nodeAttr);
        parent.appendChild(styleNode);
    }
    // Update content
    styleNode.textContent =
        ':host{display:inline-block;vertical-align:' +
            (inline ? '-0.125em' : '0') +
            '}span,svg{display:block;margin:auto}' +
            customStyle;
}

// Core
/**
 * Get functions and initialise stuff
 */
function exportFunctions() {
    /**
     * Initialise stuff
     */
    // Set API module
    setAPIModule('', fetchAPIModule);
    // Allow simple icon names
    allowSimpleNames(true);
    let _window;
    try {
        _window = window;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (err) {
        //
    }
    if (_window) {
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection$1(item)) {
                            console.error(err);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (const key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!addAPIProvider$1(key, value)) {
                            console.error(err);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    const _api = {
        getAPIConfig,
        setAPIModule,
        sendAPIQuery,
        setFetch,
        getFetch,
        listAPIProviders,
    };
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enableCache: (storage) => {
            // No longer used
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        disableCache: (storage) => {
            // No longer used
        },
        iconLoaded: iconLoaded$1,
        iconExists: iconLoaded$1, // deprecated, kept to avoid breaking changes
        getIcon: getIcon$1,
        listIcons: listIcons$1,
        addIcon: addIcon$1,
        addCollection: addCollection$1,
        calculateSize: calculateSize$1,
        buildIcon: iconToSVG,
        iconToHTML: iconToHTML$1,
        svgToURL: svgToURL$1,
        loadIcons: loadIcons$1,
        loadIcon: loadIcon$1,
        addAPIProvider: addAPIProvider$1,
        setCustomIconLoader: setCustomIconLoader$1,
        setCustomIconsLoader: setCustomIconsLoader$1,
        appendCustomStyle,
        _api,
    };
}

// List of properties to apply
const monotoneProps = {
    'background-color': 'currentColor',
};
const coloredProps = {
    'background-color': 'transparent',
};
// Dynamically add common props to variables above
const propsToAdd = {
    image: 'var(--svg)',
    repeat: 'no-repeat',
    size: '100% 100%',
};
const propsToAddTo = {
    '-webkit-mask': monotoneProps,
    'mask': monotoneProps,
    'background': coloredProps,
};
for (const prefix in propsToAddTo) {
    const list = propsToAddTo[prefix];
    for (const prop in propsToAdd) {
        list[prefix + '-' + prop] = propsToAdd[prop];
    }
}
/**
 * Fix size: add 'px' to numbers
 */
function fixSize(value) {
    return value ? value + (value.match(/^[-0-9.]+$/) ? 'px' : '') : 'inherit';
}
/**
 * Render node as <span>
 */
function renderSPAN(data, icon, useMask) {
    const node = document.createElement('span');
    // Body
    let body = data.body;
    if (body.indexOf('<a') !== -1) {
        // Animated SVG: add something to fix timing bug
        body += '<!-- ' + Date.now() + ' -->';
    }
    // Generate SVG as URL
    const renderAttribs = data.attributes;
    const html = iconToHTML$1(body, {
        ...renderAttribs,
        width: icon.width + '',
        height: icon.height + '',
    });
    const url = svgToURL$1(html);
    // Generate style
    const svgStyle = node.style;
    const styles = {
        '--svg': url,
        'width': fixSize(renderAttribs.width),
        'height': fixSize(renderAttribs.height),
        ...(useMask ? monotoneProps : coloredProps),
    };
    // Apply style
    for (const prop in styles) {
        svgStyle.setProperty(prop, styles[prop]);
    }
    return node;
}

let policy;
function createPolicy() {
  try {
    policy = window.trustedTypes.createPolicy("iconify", {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      createHTML: (s) => s
    });
  } catch (err) {
    policy = null;
  }
}
function cleanUpInnerHTML(html) {
  if (policy === void 0) {
    createPolicy();
  }
  return policy ? policy.createHTML(html) : html;
}

/**
 * Render node as <svg>
 */
function renderSVG(data) {
    const node = document.createElement('span');
    // Add style if needed
    const attr = data.attributes;
    let style = '';
    if (!attr.width) {
        style = 'width: inherit;';
    }
    if (!attr.height) {
        style += 'height: inherit;';
    }
    if (style) {
        attr.style = style;
    }
    // Generate SVG
    const html = iconToHTML$1(data.body, attr);
    node.innerHTML = cleanUpInnerHTML(html);
    return node.firstChild;
}

/**
 * Find icon node
 */
function findIconElement(parent) {
    return Array.from(parent.childNodes).find((node) => {
        const tag = node.tagName &&
            node.tagName.toUpperCase();
        return tag === 'SPAN' || tag === 'SVG';
    });
}
/**
 * Render icon
 */
function renderIcon(parent, state) {
    const iconData = state.icon.data;
    const customisations = state.customisations;
    // Render icon
    const renderData = iconToSVG(iconData, customisations);
    if (customisations.preserveAspectRatio) {
        renderData.attributes['preserveAspectRatio'] =
            customisations.preserveAspectRatio;
    }
    const mode = state.renderedMode;
    let node;
    switch (mode) {
        case 'svg':
            node = renderSVG(renderData);
            break;
        default:
            node = renderSPAN(renderData, {
                ...defaultIconProps,
                ...iconData,
            }, mode === 'mask');
    }
    // Set element
    const oldNode = findIconElement(parent);
    if (oldNode) {
        // Replace old element
        if (node.tagName === 'SPAN' && oldNode.tagName === node.tagName) {
            // Swap style instead of whole node
            oldNode.setAttribute('style', node.getAttribute('style'));
        }
        else {
            parent.replaceChild(node, oldNode);
        }
    }
    else {
        // Add new element
        parent.appendChild(node);
    }
}

/**
 * Set state to PendingState
 */
function setPendingState(icon, inline, lastState) {
    const lastRender = lastState &&
        (lastState.rendered
            ? lastState
            : lastState.lastRender);
    return {
        rendered: false,
        inline,
        icon,
        lastRender,
    };
}

/**
 * Register 'iconify-icon' component, if it does not exist
 */
function defineIconifyIcon(name = 'iconify-icon') {
    // Check for custom elements registry and HTMLElement
    let customElements;
    let ParentClass;
    try {
        customElements = window.customElements;
        ParentClass = window.HTMLElement;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (err) {
        return;
    }
    // Make sure registry and HTMLElement exist
    if (!customElements || !ParentClass) {
        return;
    }
    // Check for duplicate
    const ConflictingClass = customElements.get(name);
    if (ConflictingClass) {
        return ConflictingClass;
    }
    // All attributes
    const attributes = [
        // Icon
        'icon',
        // Mode
        'mode',
        'inline',
        'noobserver',
        // Customisations
        'width',
        'height',
        'rotate',
        'flip',
    ];
    /**
     * Component class
     */
    const IconifyIcon = class extends ParentClass {
        // Root
        _shadowRoot;
        // Initialised
        _initialised = false;
        // Icon state
        _state;
        // Attributes check queued
        _checkQueued = false;
        // Connected
        _connected = false;
        // Observer
        _observer = null;
        _visible = true;
        /**
         * Constructor
         */
        constructor() {
            super();
            // Attach shadow DOM
            const root = (this._shadowRoot = this.attachShadow({
                mode: 'open',
            }));
            // Add style
            const inline = this.hasAttribute('inline');
            updateStyle(root, inline);
            // Create empty state
            this._state = setPendingState({
                value: '',
            }, inline);
            // Queue icon render
            this._queueCheck();
        }
        /**
         * Connected to DOM
         */
        connectedCallback() {
            this._connected = true;
            this.startObserver();
        }
        /**
         * Disconnected from DOM
         */
        disconnectedCallback() {
            this._connected = false;
            this.stopObserver();
        }
        /**
         * Observed attributes
         */
        static get observedAttributes() {
            return attributes.slice(0);
        }
        /**
         * Observed properties that are different from attributes
         *
         * Experimental! Need to test with various frameworks that support it
         */
        /*
        static get properties() {
            return {
                inline: {
                    type: Boolean,
                    reflect: true,
                },
                // Not listing other attributes because they are strings or combination
                // of string and another type. Cannot have multiple types
            };
        }
        */
        /**
         * Attribute has changed
         */
        attributeChangedCallback(name) {
            switch (name) {
                case 'inline': {
                    // Update immediately: not affected by other attributes
                    const newInline = this.hasAttribute('inline');
                    const state = this._state;
                    if (newInline !== state.inline) {
                        // Update style if inline mode changed
                        state.inline = newInline;
                        updateStyle(this._shadowRoot, newInline);
                    }
                    break;
                }
                case 'noobserver': {
                    const value = this.hasAttribute('noobserver');
                    if (value) {
                        this.startObserver();
                    }
                    else {
                        this.stopObserver();
                    }
                    break;
                }
                default:
                    // Queue check for other attributes
                    this._queueCheck();
            }
        }
        /**
         * Get/set icon
         */
        get icon() {
            const value = this.getAttribute('icon');
            if (value && value.slice(0, 1) === '{') {
                try {
                    return JSON.parse(value);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }
                catch (err) {
                    //
                }
            }
            return value;
        }
        set icon(value) {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            this.setAttribute('icon', value);
        }
        /**
         * Get/set inline
         */
        get inline() {
            return this.hasAttribute('inline');
        }
        set inline(value) {
            if (value) {
                this.setAttribute('inline', 'true');
            }
            else {
                this.removeAttribute('inline');
            }
        }
        /**
         * Get/set observer
         */
        get observer() {
            return this.hasAttribute('observer');
        }
        set observer(value) {
            if (value) {
                this.setAttribute('observer', 'true');
            }
            else {
                this.removeAttribute('observer');
            }
        }
        /**
         * Restart animation
         */
        restartAnimation() {
            const state = this._state;
            if (state.rendered) {
                const root = this._shadowRoot;
                if (state.renderedMode === 'svg') {
                    // Update root node
                    try {
                        root.lastChild.setCurrentTime(0);
                        return;
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    }
                    catch (err) {
                        // Failed: setCurrentTime() is not supported
                    }
                }
                renderIcon(root, state);
            }
        }
        /**
         * Get status
         */
        get status() {
            const state = this._state;
            return state.rendered
                ? 'rendered'
                : state.icon.data === null
                    ? 'failed'
                    : 'loading';
        }
        /**
         * Queue attributes re-check
         */
        _queueCheck() {
            if (!this._checkQueued) {
                this._checkQueued = true;
                setTimeout(() => {
                    this._check();
                });
            }
        }
        /**
         * Check for changes
         */
        _check() {
            if (!this._checkQueued) {
                return;
            }
            this._checkQueued = false;
            const state = this._state;
            // Get icon
            const newIcon = this.getAttribute('icon');
            if (newIcon !== state.icon.value) {
                this._iconChanged(newIcon);
                return;
            }
            // Ignore other attributes if icon is not rendered
            if (!state.rendered || !this._visible) {
                return;
            }
            // Check for mode and attribute changes
            const mode = this.getAttribute('mode');
            const customisations = getCustomisations(this);
            if (state.attrMode !== mode ||
                haveCustomisationsChanged(state.customisations, customisations) ||
                !findIconElement(this._shadowRoot)) {
                this._renderIcon(state.icon, customisations, mode);
            }
        }
        /**
         * Icon value has changed
         */
        _iconChanged(newValue) {
            const icon = parseIconValue(newValue, (value, name, data) => {
                // Asynchronous callback: re-check values to make sure stuff wasn't changed
                const state = this._state;
                if (state.rendered || this.getAttribute('icon') !== value) {
                    // Icon data is already available or icon attribute was changed
                    return;
                }
                // Change icon
                const icon = {
                    value,
                    name,
                    data,
                };
                if (icon.data) {
                    // Render icon
                    this._gotIconData(icon);
                }
                else {
                    // Nothing to render: update icon in state
                    state.icon = icon;
                }
            });
            if (icon.data) {
                // Icon is ready to render
                this._gotIconData(icon);
            }
            else {
                // Pending icon
                this._state = setPendingState(icon, this._state.inline, this._state);
            }
        }
        /**
         * Force render icon on state change
         */
        _forceRender() {
            if (!this._visible) {
                // Remove icon
                const node = findIconElement(this._shadowRoot);
                if (node) {
                    this._shadowRoot.removeChild(node);
                }
                return;
            }
            // Re-render icon
            this._queueCheck();
        }
        /**
         * Got new icon data, icon is ready to (re)render
         */
        _gotIconData(icon) {
            this._checkQueued = false;
            this._renderIcon(icon, getCustomisations(this), this.getAttribute('mode'));
        }
        /**
         * Re-render based on icon data
         */
        _renderIcon(icon, customisations, attrMode) {
            // Get mode
            const renderedMode = getRenderMode(icon.data.body, attrMode);
            // Inline was not changed
            const inline = this._state.inline;
            // Set state and render
            renderIcon(this._shadowRoot, (this._state = {
                rendered: true,
                icon,
                inline,
                customisations,
                attrMode,
                renderedMode,
            }));
        }
        /**
         * Start observer
         */
        startObserver() {
            if (!this._observer && !this.hasAttribute('noobserver')) {
                try {
                    this._observer = new IntersectionObserver((entries) => {
                        const intersecting = entries.some((entry) => entry.isIntersecting);
                        if (intersecting !== this._visible) {
                            this._visible = intersecting;
                            this._forceRender();
                        }
                    });
                    this._observer.observe(this);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }
                catch (err) {
                    // Something went wrong, possibly observer is not supported
                    if (this._observer) {
                        try {
                            this._observer.disconnect();
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        }
                        catch (err) {
                            //
                        }
                        this._observer = null;
                    }
                }
            }
        }
        /**
         * Stop observer
         */
        stopObserver() {
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
                this._visible = true;
                if (this._connected) {
                    // Render icon
                    this._forceRender();
                }
            }
        }
    };
    // Add getters and setters
    attributes.forEach((attr) => {
        if (!(attr in IconifyIcon.prototype)) {
            Object.defineProperty(IconifyIcon.prototype, attr, {
                get: function () {
                    return this.getAttribute(attr);
                },
                set: function (value) {
                    if (value !== null) {
                        this.setAttribute(attr, value);
                    }
                    else {
                        this.removeAttribute(attr);
                    }
                },
            });
        }
    });
    // Add exported functions: both as static and instance methods
    const functions = exportFunctions();
    for (const key in functions) {
        IconifyIcon[key] = IconifyIcon.prototype[key] = functions[key];
    }
    // Define new component
    customElements.define(name, IconifyIcon);
    return IconifyIcon;
}

/**
 * Create exported data: either component instance or functions
 */
const IconifyIconComponent = defineIconifyIcon() || exportFunctions();
/**
 * Export functions
 */
const { enableCache, disableCache, iconLoaded, iconExists, // deprecated, kept to avoid breaking changes
getIcon, listIcons, addIcon, addCollection, calculateSize, buildIcon, iconToHTML, svgToURL, loadIcons, loadIcon, setCustomIconLoader, setCustomIconsLoader, addAPIProvider, _api, } = IconifyIconComponent;



;// ./src/todoAppComponents.js


const Icons = Object.freeze({
    Edit: "material-symbols:edit-square-outline",
    Plus: "ic:baseline-plus",
    Calendar: "mdi:calendar-blank-outline",
    Circle: "material-symbols:circle-outline",
    Check: "material-symbols:check-rounded",
    Close: "material-symbols:close",
    Hash: "ph:hash"
});

function createIconButton(icon, text = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.classList = ["ic-button"];
    const iconElement = createIconifyIcon(icon);
    button.appendChild(iconElement);

    if (text) {
        const textSpan = document.createElement("span");
        textSpan.textContent = text;
        textSpan.classList = ["ic-button-text"];
        button.appendChild(textSpan);
    }

    return button;
}

function createIconifyIcon(icon) {
    const wrapper = document.createElement("span");
    wrapper.classList = ["ic-wrapper"];

    const iconElement = document.createElement("iconify-icon");
    iconElement.classList = ["ic-icon"];
    iconElement.setAttribute("icon", icon);

    wrapper.appendChild(iconElement);

    return wrapper;
}


;// ./src/todoSidebar.js




/**
 * Callback for when the add project button was clicked in the sidebar.
 *
 * @callback addProjectCallback
 */

/** @type {addProjectCallback} */
let onAddProjectCb = null;

/**
 * @type {function(TodoProject):void}
 */
let onProjectSelectedCb = null;

const projectsList = document.querySelector("#sidebar-nav-projects-list");
let projectsSidebarElements = [];

class ProjectSidebarElement {
    #project;
    #domElement;
    #titleDomElement;
    #button;

    constructor(project) {
        this.#project = project;
        this.#domElement = this.#createMarkup();
    }

    #createMarkup() {
        const project = this.#project;

        const li = document.createElement("li");
        li.dataset.projectId = project.id.toString();
        const projectButton = createIconButton(Icons.Hash, project.title);
        projectButton.classList.add("sidebar-button");
        this.#button = projectButton;

        this.#titleDomElement = projectButton.querySelector("span:last-child");
        this.#titleDomElement.textContent = project.title;
        projectButton.addEventListener("click", this.#projectClickedCb);

        project.addProjectChangedListener(this.#onProjectChanged);

        li.appendChild(projectButton);
        return li;
    }

    get project() {
        return this.#project;
    }

    get domElement() {
        return this.#domElement;
    }

    set selected(value) {
        this.#button.classList.toggle("selected", value);
    }

    #onProjectChanged = (project) => {
        this.#titleDomElement.textContent = project.title;
    };

    dispose() {
        const project = this.#project;
        project.removeProjectChangedListener(this.#onProjectChanged);
        this.#button.removeEventListener("click", this.#projectClickedCb);

        this.#titleDomElement = null;
        this.#domElement = null;
        this.#project = null;
        this.#button = null;
    }

    #projectClickedCb = (event) => {
        const target = event.target;
        if(target.classList.contains("selected")) {
            return;
        }

        if(onProjectSelectedCb) {
            onProjectSelectedCb(this.#project);
        }
    };
}

function buildProjectsList(projects) {
    clearProjectsList();

    for (const project of projects) {
        addProjectSidebarElement(project);
    }
}

function addProjectSidebarElement(project) {
    const element = new ProjectSidebarElement(project);
    projectsList.appendChild(element.domElement);
    projectsSidebarElements.push(element);
}

function clearProjectsList() {
    while (projectsList.lastElementChild) {
        projectsList.removeChild(projectsList.lastElementChild);
    }

    for (const sidebarProject of projectsSidebarElements) {
        sidebarProject.dispose();
    }
    projectsSidebarElements = [];
}

function setActiveProject(project) {
    projectsSidebarElements.forEach((projectSidebarElement) => {
        projectSidebarElement.selected = projectSidebarElement.project === project;
    });
}

function initSidebar(addProjectCb, projectSelectedCb) {
    onAddProjectCb = addProjectCb;
    onProjectSelectedCb = projectSelectedCb;
    const addProjectButton = document.querySelector("#nav-add-project");
    addProjectButton.addEventListener("click", () => { 
        if(onAddProjectCb) {
            onAddProjectCb();
        }
    });

    const projects = todoAppData.getProjects();
    buildProjectsList(projects);
    todoAppData.addProjectCreatedListener(onProjectCreated);
    todoAppData.addProjectDeletedListener(onProjectDeleted);
}

function onProjectCreated(project) {
    const projects = todoAppData.getProjects();
    buildProjectsList(projects);
}

function onProjectDeleted(project) {
    const projects = todoAppData.getProjects();
    buildProjectsList(projects);
}

const sidebar = {
    initSidebar,
    setActiveProject
};

/* harmony default export */ const todoSidebar = (sidebar); 
;// ./src/domEventListener.js
/**
 * 
 * @param {HTMLElement} element 
 * @param {string} type 
 * @param {(Event)} listener 
 */
function DomEventListener(element, type ,listener) {
    this.element = element;
    this.type = type;
    this.listener = listener;
    this.element.addEventListener(type, listener);
}

DomEventListener.prototype.dispose = function() {
    this.element.removeEventListener(this.type, this.listener);
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} type 
 * @param {(Event)} listener 
 *
 * @returns {DomEventListener} A new dom event listener subscribed to the element event.
 */
function createDomEventListener(element, type, listener) {
    return new DomEventListener(element, type, listener);
}

/* harmony default export */ const domEventListener = (createDomEventListener);
;// ./src/todoOverlayModal.js






class OverlayModal {
    #overlay;
    #title;

    constructor(title) {
        this.#title = title;
    }

    show() {
        if (this.#overlay) {
            console.error("Modal already displayed !");
            return;
        }

        this.#overlay = document.createElement("div");
        this.#overlay.classList = ["overlay"];

        const backgroundClickCb = (event) => {
            if(event.target === this.#overlay) {
                this.#overlay.removeEventListener("click", backgroundClickCb);
                this.hide();
            }
        };
        this.#overlay.addEventListener("click", backgroundClickCb);

        const modal = document.createElement("div");
        modal.classList = ["overlay-modal"];
        this.#overlay.appendChild(modal);

        // Header
        const header = this.#createHeader();
        modal.appendChild(header);
        // Content
        const content = document.createElement("div");
        content.classList = ["overlay-content"];
        const generatedContent = this.createContent();
        if (generatedContent) {
            content.appendChild(generatedContent);
        }
        modal.appendChild(content);
        // Footer
        const footer = document.createElement("footer");
        footer.classList = ["overlay-footer"];
        const generatedFooter = this.createFooter();
        if (generatedFooter) {
            footer.appendChild(generatedFooter);
        }
        modal.appendChild(footer);

        const body = document.body;
        body.appendChild(this.#overlay);
    }

    hide() {
        if (this.#overlay) {
            const body = document.body;
            body.removeChild(this.#overlay);
            this.#overlay = null;
        }
    }

    #createHeader() {
        const header = document.createElement("header");
        header.classList = ["overlay-header"];

        const title = document.createElement("span");
        title.classList = ["overlay-title"];
        title.textContent = this.#title;

        const closeButton = createIconButton(Icons.Close);
        closeButton.classList.add("overlay-close-button");
        const closeCb = (event) => {
            closeButton.removeEventListener("click", closeCb);
            this.hide();
        };
        closeButton.addEventListener("click", closeCb);

        header.appendChild(title);
        header.appendChild(closeButton);

        return header;
    }

    createContent() {
    }

    createFooter() {
    }
}

class CreateProjectModal extends OverlayModal {
    #formId = "add-project-form";
    #projectCreatedCallback;

    constructor() {
        super("Add Project");
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["add-project-form"];
        const item = document.createElement("div");
        item.classList = ["form-item"];

        const label = document.createElement("label");
        label.htmlFor = "add-project-form-title";
        label.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "project-title";
        titleInput.id = label.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;

        item.appendChild(label);
        item.appendChild(titleInput);
        form.appendChild(item);

        const formSubmittedCb = (event) => {
            form.removeEventListener("submit", formSubmittedCb);
            this.#onCreateProjectFormSubmitted(event);
            this.hide();
        };
        form.addEventListener("submit", formSubmittedCb);

        return form;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    /**
     * 
     * @param {(title : string) => void} callback 
     */
    projectCreated(callback) {
        this.#projectCreatedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onCreateProjectFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const projectCreatedData = {
            title : formData.get("project-title").valueOf()
        };

        if(this.#projectCreatedCallback) {
            this.#projectCreatedCallback(projectCreatedData);
        }
    }
}

class EditProjectModal extends OverlayModal{
    #formId = "edit-project-form";
    #projectEditedCallback;
    #projectDeletedCallback;
    #project;

    /**
     * 
     * @param {TodoProject} project 
     */
    constructor(project) {
        super("Edit Project");
        this.#project = project;
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["edit-project-form"];
        const item = document.createElement("div");
        item.classList = ["form-item"];

        const label = document.createElement("label");
        label.htmlFor = "edit-project-form-title";
        label.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "project-title";
        titleInput.id = label.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = this.#project.title;

        item.appendChild(label);
        item.appendChild(titleInput);
        form.appendChild(item);

        const formSubmittedCb = (event) => {
            form.removeEventListener("submit", formSubmittedCb);
            this.#onEditProjectFormSubmitted(event);
        };
        form.addEventListener("submit", formSubmittedCb);

        return form;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Edit";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", this.#onDeleteProjectClicked);

        container.appendChild(deleteButton);
        container.appendChild(submitButton);

        return container;
    }

    /**
     * 
     * @param {(title : string) => void} callback 
     */
    projectEdited(callback) {
        this.#projectEditedCallback = callback;
    }

    projectDeleted(callback) {
        this.#projectDeletedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onEditProjectFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const projectEditedData = {
            title : formData.get("project-title").valueOf()
        };

        if(this.#projectEditedCallback) {
            this.#projectEditedCallback(projectEditedData);
        }

        this.hide();
    }

    #onDeleteProjectClicked = () => {
        if(this.#projectDeletedCallback) {
            this.#projectDeletedCallback(this.#project);
        }

        this.hide();
    };
}

class EditTaskModal extends OverlayModal{
    #formId = "edit-task-form";
    #task;
    #taskEditedCallback;
    #taskDeletedCallback;
    #eventListeners;

    constructor(task) {
        super("Edit task");
        this.#eventListeners = [];
        this.#task = task;
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["edit-task-form"];

        const titleItem = this.#createTitleFormItem();
        const descriptionItem = this.#createDescriptionFormItem();
        const dueDateItem = this.#createDateFormItem();
        const priorityItem = this.#createPriorityFormItem();

        form.appendChild(titleItem);
        form.appendChild(descriptionItem);
        form.appendChild(dueDateItem);
        form.appendChild(priorityItem);

        const eventListener = domEventListener(form, "submit", this.#onEditTaskFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "edit-task-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "task-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = this.#task.title;
        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    #createDescriptionFormItem() {
        const item = this.#createFormItemContainer();

        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "edit-task-form-description";
        descriptionLabel.textContent = "Description";
        const descriptionTextArea = document.createElement("textarea");
        descriptionTextArea.name = "task-description";
        descriptionTextArea.id = descriptionLabel.htmlFor;
        descriptionTextArea.maxLength = 256;
        descriptionTextArea.value = this.#task.description;

        item.appendChild(descriptionLabel);
        item.appendChild(descriptionTextArea);
        return item;
    }

    #createDateFormItem() {
        const item = this.#createFormItemContainer();

        const dueDateLabel = document.createElement("label");
        dueDateLabel.htmlFor = "edit-task-form-date";
        dueDateLabel.textContent = "Due date";
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.name = "task-date";
        dueDateInput.id = dueDateLabel.htmlFor;
        dueDateInput.valueAsDate = this.#task.date;

        item.appendChild(dueDateLabel);
        item.appendChild(dueDateInput);

        return item;
    }

    #createPriorityFormItem() {
        const item = this.#createFormItemContainer();

        const priorityLabel = document.createElement("label");
        priorityLabel.htmlFor = "edit-task-form-priority";
        priorityLabel.textContent = "Priority";
        const prioritySelect = document.createElement("select");
        prioritySelect.name = "task-priority";
        prioritySelect.id = priorityLabel.htmlFor;

        const priorityValues = todoPriorities.values();
        for (const priority of priorityValues) {
            const priorityOption = document.createElement("option");
            priorityOption.value = priority.value;
            priorityOption.textContent = priority.name;

            if(this.#task.priority === priority) {
                priorityOption.selected = true;
            }

            prioritySelect.appendChild(priorityOption);
        }

        item.appendChild(priorityLabel);
        item.appendChild(prioritySelect);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Edit";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        const deleteTaskButton = document.createElement("button");
        deleteTaskButton.textContent = "Delete";
        deleteTaskButton.type = "button";
        deleteTaskButton.classList.add("delete-button");

        const eventListener = domEventListener(deleteTaskButton, "click", this.#onDeleteTask.bind(this));
        this.#eventListeners.push(eventListener);

        container.appendChild(deleteTaskButton);
        container.appendChild(submitButton);

        return container;
    }

    taskEdited(callback) {
        this.#taskEditedCallback = callback;
    }

    taskDeleted(callback) {
        this.#taskDeletedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onEditTaskFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        let dueDate = null;
        if(formData.get("task-date")) {
            dueDate = new Date(formData.get("task-date").valueOf());
        }
        const taskEditedData = {
            title : formData.get("task-title").valueOf(),
            description: formData.get("task-description").valueOf(),
            dueDate: dueDate,
            priority: todoPriorities.fromValue(formData.get("task-priority").valueOf())
        };

        if(this.#taskEditedCallback) {
            this.#taskEditedCallback(taskEditedData);
        }

        this.hide();
    }

    #onDeleteTask(event) {
        if(this.#taskDeletedCallback) {
            this.#taskDeletedCallback(this.#task);
        }

        this.hide();
    }
}

class CreateTaskModal extends OverlayModal{
    #formId = "add-task-form";
    #taskCreatedCallback;
    #eventListeners;

    constructor() {
        super("Add task");
        this.#eventListeners = [];
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["add-task-form"];

        const titleItem = this.#createTitleFormItem();
        const descriptionItem = this.#createDescriptionFormItem();
        const dueDateItem = this.#createDateFormItem();
        const priorityItem = this.#createPriorityFormItem();

        form.appendChild(titleItem);
        form.appendChild(descriptionItem);
        form.appendChild(dueDateItem);
        form.appendChild(priorityItem);

        const eventListener = domEventListener(form, "submit", this.#onAddTaskFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "add-task-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "task-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    #createDescriptionFormItem() {
        const item = this.#createFormItemContainer();

        const descriptionLabel = document.createElement("label");
        descriptionLabel.htmlFor = "add-task-form-description";
        descriptionLabel.textContent = "Description";
        const descriptionTextArea = document.createElement("textarea");
        descriptionTextArea.name = "task-description";
        descriptionTextArea.id = descriptionLabel.htmlFor;
        descriptionTextArea.maxLength = 256;

        item.appendChild(descriptionLabel);
        item.appendChild(descriptionTextArea);
        return item;
    }

    #createDateFormItem() {
        const item = this.#createFormItemContainer();

        const dueDateLabel = document.createElement("label");
        dueDateLabel.htmlFor = "edit-task-form-date";
        dueDateLabel.textContent = "Due date";
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "date";
        dueDateInput.name = "task-date";
        dueDateInput.id = dueDateLabel.htmlFor;
        dueDateInput.valueAsDate = null;

        item.appendChild(dueDateLabel);
        item.appendChild(dueDateInput);

        return item;
    }

    #createPriorityFormItem() {
        const item = this.#createFormItemContainer();

        const priorityLabel = document.createElement("label");
        priorityLabel.htmlFor = "edit-task-form-priority";
        priorityLabel.textContent = "Priority";
        const prioritySelect = document.createElement("select");
        prioritySelect.name = "task-priority";
        prioritySelect.id = priorityLabel.htmlFor;

        const priorityValues = todoPriorities.values();
        for (const priority of priorityValues) {
            const priorityOption = document.createElement("option");
            priorityOption.value = priority.value;
            priorityOption.textContent = priority.name;

            if(priority === todoPriorities.Lowest) {
                priorityOption.selected = true;
            }

            prioritySelect.appendChild(priorityOption);
        }

        item.appendChild(priorityLabel);
        item.appendChild(prioritySelect);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    taskCreated(callback) {
        this.#taskCreatedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onAddTaskFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        let dueDate = null;
        if(formData.get("task-date")) {
            dueDate = new Date(formData.get("task-date").valueOf());
        }
        const taskCreatedData = {
            title : formData.get("task-title").valueOf(),
            description: formData.get("task-description").valueOf(),
            dueDate: dueDate,
            priority: todoPriorities.fromValue(formData.get("task-priority").valueOf())
        };

        if(this.#taskCreatedCallback) {
            this.#taskCreatedCallback(taskCreatedData);
        }

        this.hide();
    }
}

class CreateSectionModal extends OverlayModal{
    #formId = "add-section-form";
    #sectionCreatedCallback;
    #eventListeners;

    constructor() {
        super("Add section");
        this.#eventListeners = [];
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["add-section-form"];

        const titleItem = this.#createTitleFormItem();

        form.appendChild(titleItem);

        const eventListener = domEventListener(form, "submit", this.#onAddSectionFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "add-section-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "section-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Add";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        container.appendChild(submitButton);

        return container;
    }

    sectionCreated(callback) {
        this.#sectionCreatedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onAddSectionFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const sectionCreatedData = {
            title : formData.get("section-title").valueOf(),
        };

        if(this.#sectionCreatedCallback) {
            this.#sectionCreatedCallback(sectionCreatedData);
        }

        this.hide();
    }
}

class EditSectionModal extends OverlayModal{
    #formId = "edit-section-form";
    #section;
    #sectionEditedCallback;
    #sectionDeletedCallback;
    #eventListeners;

    constructor(section) {
        super("Edit section");
        this.#section = section;
        this.#eventListeners = [];
    }

    hide() {
        super.hide();
        this.#eventListeners.forEach((item) => item.dispose());
        this.#eventListeners = [];
    }

    createContent() {
        const form = document.createElement("form");
        form.id = this.#formId;
        form.classList = ["edit-section-form"];

        const titleItem = this.#createTitleFormItem();

        form.appendChild(titleItem);

        const eventListener = domEventListener(form, "submit", this.#onEditSectionFormSubmitted.bind(this));
        this.#eventListeners.push(eventListener);

        return form;
    }

    #createFormItemContainer() {
        const item = document.createElement("div");
        item.classList = ["form-item"];

        return item;
    }

    #createTitleFormItem() {
        const item = this.#createFormItemContainer();

        const titleLabel = document.createElement("label");
        titleLabel.htmlFor = "edit-section-form-title";
        titleLabel.textContent = "Name";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.name = "section-title";
        titleInput.id = titleLabel.htmlFor;
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = this.#section.title;

        item.appendChild(titleLabel);
        item.appendChild(titleInput);

        return item;
    }

    createFooter() {
        const container = document.createElement("div");
        container.classList = "form-controls";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Edit";
        submitButton.type = "submit";
        submitButton.classList.add("form-submit-button");
        submitButton.setAttribute("form", this.#formId);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");

        const eventListener = domEventListener(deleteButton, "click", this.#onDeleteSection);
        this.#eventListeners.push(eventListener);

        container.appendChild(deleteButton);
        container.appendChild(submitButton);

        return container;
    }

    sectionEdited(callback) {
        this.#sectionEditedCallback = callback;
    }

    sectionDeleted(callback) {
        this.#sectionDeletedCallback = callback;
    }

    /**
     * 
     * @param {Event} event 
     */
    #onEditSectionFormSubmitted(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const sectionEditedData = {
            title : formData.get("section-title").valueOf(),
        };

        if(this.#sectionEditedCallback) {
            this.#sectionEditedCallback(sectionEditedData);
        }

        this.hide();
    }

    #onDeleteSection = () => {
        if(this.#sectionDeletedCallback) {
            this.#sectionDeletedCallback(this.#section);
        }

        this.hide();
    };
}


;// ./node_modules/date-fns/locale/en-US/_lib/formatDistance.js
const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds",
  },

  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds",
  },

  halfAMinute: "half a minute",

  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes",
  },

  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes",
  },

  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours",
  },

  xHours: {
    one: "1 hour",
    other: "{{count}} hours",
  },

  xDays: {
    one: "1 day",
    other: "{{count}} days",
  },

  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks",
  },

  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks",
  },

  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months",
  },

  xMonths: {
    one: "1 month",
    other: "{{count}} months",
  },

  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years",
  },

  xYears: {
    one: "1 year",
    other: "{{count}} years",
  },

  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years",
  },

  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years",
  },
};

const formatDistance = (token, count, options) => {
  let result;

  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }

  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }

  return result;
};

;// ./node_modules/date-fns/locale/_lib/buildFormatLongFn.js
function buildFormatLongFn(args) {
  return (options = {}) => {
    // TODO: Remove String()
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

;// ./node_modules/date-fns/locale/en-US/_lib/formatLong.js


const dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy",
};

const timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a",
};

const dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}",
};

const formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full",
  }),

  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full",
  }),

  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full",
  }),
};

;// ./node_modules/date-fns/locale/en-US/_lib/formatRelative.js
const formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P",
};

const formatRelative = (token, _date, _baseDate, _options) =>
  formatRelativeLocale[token];

;// ./node_modules/date-fns/locale/_lib/buildLocalizeFn.js
/**
 * The localize function argument callback which allows to convert raw value to
 * the actual type.
 *
 * @param value - The value to convert
 *
 * @returns The converted value
 */

/**
 * The map of localized values for each width.
 */

/**
 * The index type of the locale unit value. It types conversion of units of
 * values that don't start at 0 (i.e. quarters).
 */

/**
 * Converts the unit value to the tuple of values.
 */

/**
 * The tuple of localized era values. The first element represents BC,
 * the second element represents AD.
 */

/**
 * The tuple of localized quarter values. The first element represents Q1.
 */

/**
 * The tuple of localized day values. The first element represents Sunday.
 */

/**
 * The tuple of localized month values. The first element represents January.
 */

function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";

    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;

      valuesArray =
        args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;

      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;

    // @ts-expect-error - For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
    return valuesArray[index];
  };
}

;// ./node_modules/date-fns/locale/en-US/_lib/localize.js


const eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"],
};

const quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
};

// Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.
const monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

const dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
};

const formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
};

const ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);

  // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};

const localize = {
  ordinalNumber,

  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide",
  }),

  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1,
  }),

  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide",
  }),

  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide",
  }),

  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide",
  }),
};

;// ./node_modules/date-fns/locale/_lib/buildMatchFn.js
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;

    const matchPattern =
      (width && args.matchPatterns[width]) ||
      args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);

    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];

    const parsePatterns =
      (width && args.parsePatterns[width]) ||
      args.parsePatterns[args.defaultParseWidth];

    const key = Array.isArray(parsePatterns)
      ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString))
      : // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString));

    let value;

    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback
      ? // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      : value;

    const rest = string.slice(matchedString.length);

    return { value, rest };
  };
}

function findKey(object, predicate) {
  for (const key in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      predicate(object[key])
    ) {
      return key;
    }
  }
  return undefined;
}

function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return undefined;
}

;// ./node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];

    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback
      ? args.valueCallback(parseResult[0])
      : parseResult[0];

    // [TODO] I challenge you to fix the type
    value = options.valueCallback ? options.valueCallback(value) : value;

    const rest = string.slice(matchedString.length);

    return { value, rest };
  };
}

;// ./node_modules/date-fns/locale/en-US/_lib/match.js



const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
const parseOrdinalNumberPattern = /\d+/i;

const matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i,
};
const parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i],
};

const matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i,
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i],
};

const matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
};
const parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],

  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],
};

const matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
};
const parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
};

const matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i,
  },
};

const match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10),
  }),

  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any",
  }),

  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1,
  }),

  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any",
  }),

  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any",
  }),

  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any",
  }),
};

;// ./node_modules/date-fns/locale/en-US.js






/**
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
 * @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
 */
const enUS = {
  code: "en-US",
  formatDistance: formatDistance,
  formatLong: formatLong,
  formatRelative: formatRelative,
  localize: localize,
  match: match,
  options: {
    weekStartsOn: 0 /* Sunday */,
    firstWeekContainsDate: 1,
  },
};

// Fallback for modularized imports:
/* harmony default export */ const en_US = ((/* unused pure expression or super */ null && (enUS)));

;// ./node_modules/date-fns/_lib/defaultOptions.js
let defaultOptions = {};

function getDefaultOptions() {
  return defaultOptions;
}

function setDefaultOptions(newOptions) {
  defaultOptions = newOptions;
}

;// ./node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js


/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds(),
    ),
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

;// ./node_modules/date-fns/_lib/normalizeDates.js


function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object"),
  );
  return dates.map(normalize);
}

;// ./node_modules/date-fns/startOfDay.js


/**
 * The {@link startOfDay} function options.
 */

/**
 * @name startOfDay
 * @category Day Helpers
 * @summary Return the start of a day for the given date.
 *
 * @description
 * Return the start of a day for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - The options
 *
 * @returns The start of a day
 *
 * @example
 * // The start of a day for 2 September 2014 11:55:00:
 * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 00:00:00
 */
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfDay = ((/* unused pure expression or super */ null && (startOfDay)));

;// ./node_modules/date-fns/differenceInCalendarDays.js





/**
 * The {@link differenceInCalendarDays} function options.
 */

/**
 * @name differenceInCalendarDays
 * @category Day Helpers
 * @summary Get the number of calendar days between the given dates.
 *
 * @description
 * Get the number of calendar days between the given dates. This means that the times are removed
 * from the dates and then the difference in days is calculated.
 *
 * @param laterDate - The later date
 * @param earlierDate - The earlier date
 * @param options - The options object
 *
 * @returns The number of calendar days
 *
 * @example
 * // How many calendar days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInCalendarDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 366
 * // How many calendar days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInCalendarDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 1
 */
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate,
  );

  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);

  const laterTimestamp =
    +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp =
    +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);

  // Round the number of days to the nearest integer because the number of
  // milliseconds in a day is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_differenceInCalendarDays = ((/* unused pure expression or super */ null && (differenceInCalendarDays)));

;// ./node_modules/date-fns/startOfYear.js


/**
 * The {@link startOfYear} function options.
 */

/**
 * @name startOfYear
 * @category Year Helpers
 * @summary Return the start of a year for the given date.
 *
 * @description
 * Return the start of a year for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - The options
 *
 * @returns The start of a year
 *
 * @example
 * // The start of a year for 2 September 2014 11:55:00:
 * const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
 * //=> Wed Jan 01 2014 00:00:00
 */
function startOfYear(date, options) {
  const date_ = toDate(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfYear = ((/* unused pure expression or super */ null && (startOfYear)));

;// ./node_modules/date-fns/getDayOfYear.js




/**
 * The {@link getDayOfYear} function options.
 */

/**
 * @name getDayOfYear
 * @category Day Helpers
 * @summary Get the day of the year of the given date.
 *
 * @description
 * Get the day of the year of the given date.
 *
 * @param date - The given date
 * @param options - The options
 *
 * @returns The day of year
 *
 * @example
 * // Which day of the year is 2 July 2014?
 * const result = getDayOfYear(new Date(2014, 6, 2))
 * //=> 183
 */
function getDayOfYear(date, options) {
  const _date = toDate(date, options?.in);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_getDayOfYear = ((/* unused pure expression or super */ null && (getDayOfYear)));

;// ./node_modules/date-fns/startOfWeek.js



/**
 * The {@link startOfWeek} function options.
 */

/**
 * @name startOfWeek
 * @category Week Helpers
 * @summary Return the start of a week for the given date.
 *
 * @description
 * Return the start of a week for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week
 *
 * @example
 * // The start of a week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfWeek(date, options) {
  const defaultOptions = getDefaultOptions();
  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfWeek = ((/* unused pure expression or super */ null && (startOfWeek)));

;// ./node_modules/date-fns/startOfISOWeek.js


/**
 * The {@link startOfISOWeek} function options.
 */

/**
 * @name startOfISOWeek
 * @category ISO Week Helpers
 * @summary Return the start of an ISO week for the given date.
 *
 * @description
 * Return the start of an ISO week for the given date.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of an ISO week
 *
 * @example
 * // The start of an ISO week for 2 September 2014 11:55:00:
 * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfISOWeek(date, options) {
  return startOfWeek(date, { ...options, weekStartsOn: 1 });
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfISOWeek = ((/* unused pure expression or super */ null && (startOfISOWeek)));

;// ./node_modules/date-fns/getISOWeekYear.js




/**
 * The {@link getISOWeekYear} function options.
 */

/**
 * @name getISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Get the ISO week-numbering year of the given date.
 *
 * @description
 * Get the ISO week-numbering year of the given date,
 * which always starts 3 days before the year's first Thursday.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param date - The given date
 *
 * @returns The ISO week-numbering year
 *
 * @example
 * // Which ISO-week numbering year is 2 January 2005?
 * const result = getISOWeekYear(new Date(2005, 0, 2))
 * //=> 2004
 */
function getISOWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();

  const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);

  const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);

  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_getISOWeekYear = ((/* unused pure expression or super */ null && (getISOWeekYear)));

;// ./node_modules/date-fns/startOfISOWeekYear.js




/**
 * The {@link startOfISOWeekYear} function options.
 */

/**
 * @name startOfISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Return the start of an ISO week-numbering year for the given date.
 *
 * @description
 * Return the start of an ISO week-numbering year,
 * which always starts 3 days before the year's first Thursday.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of an ISO week-numbering year
 *
 * @example
 * // The start of an ISO week-numbering year for 2 July 2005:
 * const result = startOfISOWeekYear(new Date(2005, 6, 2))
 * //=> Mon Jan 03 2005 00:00:00
 */
function startOfISOWeekYear(date, options) {
  const year = getISOWeekYear(date, options);
  const fourthOfJanuary = constructFrom(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfISOWeekYear = ((/* unused pure expression or super */ null && (startOfISOWeekYear)));

;// ./node_modules/date-fns/getISOWeek.js





/**
 * The {@link getISOWeek} function options.
 */

/**
 * @name getISOWeek
 * @category ISO Week Helpers
 * @summary Get the ISO week of the given date.
 *
 * @description
 * Get the ISO week of the given date.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param date - The given date
 * @param options - The options
 *
 * @returns The ISO week
 *
 * @example
 * // Which week of the ISO-week numbering year is 2 January 2005?
 * const result = getISOWeek(new Date(2005, 0, 2))
 * //=> 53
 */
function getISOWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);

  // Round the number of weeks to the nearest integer because the number of
  // milliseconds in a week is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round(diff / millisecondsInWeek) + 1;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_getISOWeek = ((/* unused pure expression or super */ null && (getISOWeek)));

;// ./node_modules/date-fns/getWeekYear.js





/**
 * The {@link getWeekYear} function options.
 */

/**
 * @name getWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Get the local week-numbering year of the given date.
 *
 * @description
 * Get the local week-numbering year of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @param date - The given date
 * @param options - An object with options.
 *
 * @returns The local week-numbering year
 *
 * @example
 * // Which week numbering year is 26 December 2004 with the default settings?
 * const result = getWeekYear(new Date(2004, 11, 26))
 * //=> 2005
 *
 * @example
 * // Which week numbering year is 26 December 2004 if week starts on Saturday?
 * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
 * //=> 2004
 *
 * @example
 * // Which week numbering year is 26 December 2004 if the first week contains 4 January?
 * const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
 * //=> 2004
 */
function getWeekYear(date, options) {
  const _date = toDate(date, options?.in);
  const year = _date.getFullYear();

  const defaultOptions = getDefaultOptions();
  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);

  const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);

  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_getWeekYear = ((/* unused pure expression or super */ null && (getWeekYear)));

;// ./node_modules/date-fns/startOfWeekYear.js





/**
 * The {@link startOfWeekYear} function options.
 */

/**
 * @name startOfWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Return the start of a local week-numbering year for the given date.
 *
 * @description
 * Return the start of a local week-numbering year.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week-numbering year
 *
 * @example
 * // The start of an a week-numbering year for 2 July 2005 with default settings:
 * const result = startOfWeekYear(new Date(2005, 6, 2))
 * //=> Sun Dec 26 2004 00:00:00
 *
 * @example
 * // The start of a week-numbering year for 2 July 2005
 * // if Monday is the first day of week
 * // and 4 January is always in the first week of the year:
 * const result = startOfWeekYear(new Date(2005, 6, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> Mon Jan 03 2005 00:00:00
 */
function startOfWeekYear(date, options) {
  const defaultOptions = getDefaultOptions();
  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const year = getWeekYear(date, options);
  const firstWeek = constructFrom(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_startOfWeekYear = ((/* unused pure expression or super */ null && (startOfWeekYear)));

;// ./node_modules/date-fns/getWeek.js





/**
 * The {@link getWeek} function options.
 */

/**
 * @name getWeek
 * @category Week Helpers
 * @summary Get the local week index of the given date.
 *
 * @description
 * Get the local week index of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @param date - The given date
 * @param options - An object with options
 *
 * @returns The week
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005 with default options?
 * const result = getWeek(new Date(2005, 0, 2))
 * //=> 2
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005,
 * // if Monday is the first day of the week,
 * // and the first week of the year always contains 4 January?
 * const result = getWeek(new Date(2005, 0, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> 53
 */
function getWeek(date, options) {
  const _date = toDate(date, options?.in);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);

  // Round the number of weeks to the nearest integer because the number of
  // milliseconds in a week is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round(diff / millisecondsInWeek) + 1;
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_getWeek = ((/* unused pure expression or super */ null && (getWeek)));

;// ./node_modules/date-fns/_lib/addLeadingZeros.js
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

;// ./node_modules/date-fns/_lib/format/lightFormatters.js


/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */

const lightFormatters = {
  // Year
  y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

    const signedYear = date.getFullYear();
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },

  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },

  // Day of the month
  d(date, token) {
    return addLeadingZeros(date.getDate(), token.length);
  },

  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },

  // Hour [1-12]
  h(date, token) {
    return addLeadingZeros(date.getHours() % 12 || 12, token.length);
  },

  // Hour [0-23]
  H(date, token) {
    return addLeadingZeros(date.getHours(), token.length);
  },

  // Minute
  m(date, token) {
    return addLeadingZeros(date.getMinutes(), token.length);
  },

  // Second
  s(date, token) {
    return addLeadingZeros(date.getSeconds(), token.length);
  },

  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3),
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  },
};

;// ./node_modules/date-fns/_lib/format/formatters.js









const dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
};

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */

const formatters = {
  // Era
  G: function (date, token, localize) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize.era(era, { width: "wide" });
    }
  },

  // Year
  y: function (date, token, localize) {
    // Ordinal number
    if (token === "yo") {
      const signedYear = date.getFullYear();
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, { unit: "year" });
    }

    return lightFormatters.y(date, token);
  },

  // Local week-numbering year
  Y: function (date, token, localize, options) {
    const signedWeekYear = getWeekYear(date, options);
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

    // Two digit year
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }

    // Ordinal number
    if (token === "Yo") {
      return localize.ordinalNumber(weekYear, { unit: "year" });
    }

    // Padding
    return addLeadingZeros(weekYear, token.length);
  },

  // ISO week-numbering year
  R: function (date, token) {
    const isoWeekYear = getISOWeekYear(date);

    // Padding
    return addLeadingZeros(isoWeekYear, token.length);
  },

  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function (date, token) {
    const year = date.getFullYear();
    return addLeadingZeros(year, token.length);
  },

  // Quarter
  Q: function (date, token, localize) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize.quarter(quarter, {
          width: "abbreviated",
          context: "formatting",
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize.quarter(quarter, {
          width: "narrow",
          context: "formatting",
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize.quarter(quarter, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Stand-alone quarter
  q: function (date, token, localize) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize.quarter(quarter, {
          width: "abbreviated",
          context: "standalone",
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize.quarter(quarter, {
          width: "narrow",
          context: "standalone",
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize.quarter(quarter, {
          width: "wide",
          context: "standalone",
        });
    }
  },

  // Month
  M: function (date, token, localize) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize.month(month, {
          width: "abbreviated",
          context: "formatting",
        });
      // J, F, ..., D
      case "MMMMM":
        return localize.month(month, {
          width: "narrow",
          context: "formatting",
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize.month(month, { width: "wide", context: "formatting" });
    }
  },

  // Stand-alone month
  L: function (date, token, localize) {
    const month = date.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize.month(month, {
          width: "abbreviated",
          context: "standalone",
        });
      // J, F, ..., D
      case "LLLLL":
        return localize.month(month, {
          width: "narrow",
          context: "standalone",
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize.month(month, { width: "wide", context: "standalone" });
    }
  },

  // Local week of year
  w: function (date, token, localize, options) {
    const week = getWeek(date, options);

    if (token === "wo") {
      return localize.ordinalNumber(week, { unit: "week" });
    }

    return addLeadingZeros(week, token.length);
  },

  // ISO week of year
  I: function (date, token, localize) {
    const isoWeek = getISOWeek(date);

    if (token === "Io") {
      return localize.ordinalNumber(isoWeek, { unit: "week" });
    }

    return addLeadingZeros(isoWeek, token.length);
  },

  // Day of the month
  d: function (date, token, localize) {
    if (token === "do") {
      return localize.ordinalNumber(date.getDate(), { unit: "date" });
    }

    return lightFormatters.d(date, token);
  },

  // Day of year
  D: function (date, token, localize) {
    const dayOfYear = getDayOfYear(date);

    if (token === "Do") {
      return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }

    return addLeadingZeros(dayOfYear, token.length);
  },

  // Day of week
  E: function (date, token, localize) {
    const dayOfWeek = date.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "EEEEE":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "EEEEEE":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "EEEE":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Local day of week
  e: function (date, token, localize, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "eeeee":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "eeeeee":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "eeee":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Stand-alone local day of week
  c: function (date, token, localize, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone",
        });
      // T
      case "ccccc":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "standalone",
        });
      // Tu
      case "cccccc":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "standalone",
        });
      // Tuesday
      case "cccc":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "standalone",
        });
    }
  },

  // ISO day of week
  i: function (date, token, localize) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "iiiii":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "iiiiii":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "iiii":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // AM or PM
  a: function (date, token, localize) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";

    switch (token) {
      case "a":
      case "aa":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "aaa":
        return localize
          .dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          })
          .toLowerCase();
      case "aaaaa":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "aaaa":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // AM, PM, midnight, noon
  b: function (date, token, localize) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }

    switch (token) {
      case "b":
      case "bb":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "bbb":
        return localize
          .dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          })
          .toLowerCase();
      case "bbbbb":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "bbbb":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // in the morning, in the afternoon, in the evening, at night
  B: function (date, token, localize) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }

    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "BBBBB":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "BBBB":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Hour [1-12]
  h: function (date, token, localize) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return lightFormatters.h(date, token);
  },

  // Hour [0-23]
  H: function (date, token, localize) {
    if (token === "Ho") {
      return localize.ordinalNumber(date.getHours(), { unit: "hour" });
    }

    return lightFormatters.H(date, token);
  },

  // Hour [0-11]
  K: function (date, token, localize) {
    const hours = date.getHours() % 12;

    if (token === "Ko") {
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return addLeadingZeros(hours, token.length);
  },

  // Hour [1-24]
  k: function (date, token, localize) {
    let hours = date.getHours();
    if (hours === 0) hours = 24;

    if (token === "ko") {
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return addLeadingZeros(hours, token.length);
  },

  // Minute
  m: function (date, token, localize) {
    if (token === "mo") {
      return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }

    return lightFormatters.m(date, token);
  },

  // Second
  s: function (date, token, localize) {
    if (token === "so") {
      return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
    }

    return lightFormatters.s(date, token);
  },

  // Fraction of second
  S: function (date, token) {
    return lightFormatters.S(date, token);
  },

  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    if (timezoneOffset === 0) {
      return "Z";
    }

    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX": // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX": // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx": // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx": // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (GMT)
  O: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (specific non-location)
  z: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },

  // Seconds timestamp
  t: function (date, token, _localize) {
    const timestamp = Math.trunc(+date / 1000);
    return addLeadingZeros(timestamp, token.length);
  },

  // Milliseconds timestamp
  T: function (date, token, _localize) {
    return addLeadingZeros(+date, token.length);
  },
};

function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}

function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

;// ./node_modules/date-fns/_lib/format/longFormatters.js
const dateLongFormatter = (pattern, formatLong) => {
  switch (pattern) {
    case "P":
      return formatLong.date({ width: "short" });
    case "PP":
      return formatLong.date({ width: "medium" });
    case "PPP":
      return formatLong.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong.date({ width: "full" });
  }
};

const timeLongFormatter = (pattern, formatLong) => {
  switch (pattern) {
    case "p":
      return formatLong.time({ width: "short" });
    case "pp":
      return formatLong.time({ width: "medium" });
    case "ppp":
      return formatLong.time({ width: "long" });
    case "pppp":
    default:
      return formatLong.time({ width: "full" });
  }
};

const dateTimeLongFormatter = (pattern, formatLong) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];

  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }

  let dateTimeFormat;

  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong.dateTime({ width: "full" });
      break;
  }

  return dateTimeFormat
    .replace("{{date}}", dateLongFormatter(datePattern, formatLong))
    .replace("{{time}}", timeLongFormatter(timePattern, formatLong));
};

const longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter,
};

;// ./node_modules/date-fns/_lib/protectedTokens.js
const dayOfYearTokenRE = /^D+$/;
const weekYearTokenRE = /^Y+$/;

const throwTokens = ["D", "DD", "YY", "YYYY"];

function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}

function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}

function warnOrThrowProtectedError(token, format, input) {
  const _message = message(token, format, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}

function message(token, format, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

;// ./node_modules/date-fns/isDate.js
/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param value - The value to check
 *
 * @returns True if the given value is a date
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */
function isDate(value) {
  return (
    value instanceof Date ||
    (typeof value === "object" &&
      Object.prototype.toString.call(value) === "[object Date]")
  );
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_isDate = ((/* unused pure expression or super */ null && (isDate)));

;// ./node_modules/date-fns/isValid.js



/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param date - The date to check
 *
 * @returns The date is valid
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertible into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */
function isValid(date) {
  return !((!isDate(date) && typeof date !== "number") || isNaN(+toDate(date)));
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_isValid = ((/* unused pure expression or super */ null && (isValid)));

;// ./node_modules/date-fns/format.js








// Rexports of internal for libraries to use.
// See: https://github.com/date-fns/date-fns/issues/3638#issuecomment-1877082874


// This RegExp consists of three parts separated by `|`:
// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
const formattingTokensRegExp =
  /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

const escapedStringRegExp = /^'([^]*?)'?$/;
const doubleQuoteRegExp = /''/g;
const unescapedLatinCharacterRegExp = /[a-zA-Z]/;



/**
 * The {@link format} function options.
 */

/**
 * @name format
 * @alias formatDate
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
 *    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param date - The original date
 * @param format - The string of tokens
 * @param options - An object with options
 *
 * @returns The formatted date string
 *
 * @throws `date` must not be Invalid Date
 * @throws `options.locale` must contain `localize` property
 * @throws `options.locale` must contain `formatLong` property
 * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */
function format(date, formatStr, options) {
  const defaultOptions = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions.locale ?? enUS;

  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  const originalDate = toDate(date, options?.in);

  if (!isValid(originalDate)) {
    throw new RangeError("Invalid time value");
  }

  let parts = formatStr
    .match(longFormattingTokensRegExp)
    .map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    })
    .join("")
    .match(formattingTokensRegExp)
    .map((substring) => {
      // Replace two single quote characters with one single quote character
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }

      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }

      if (formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }

      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" +
            firstCharacter +
            "`",
        );
      }

      return { isToken: false, value: substring };
    });

  // invoke localize preprocessor (only for french locales at the moment)
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }

  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale,
  };

  return parts
    .map((part) => {
      if (!part.isToken) return part.value;

      const token = part.value;

      if (
        (!options?.useAdditionalWeekYearTokens &&
          isProtectedWeekYearToken(token)) ||
        (!options?.useAdditionalDayOfYearTokens &&
          isProtectedDayOfYearToken(token))
      ) {
        warnOrThrowProtectedError(token, formatStr, String(date));
      }

      const formatter = formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    })
    .join("");
}

function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);

  if (!matched) {
    return input;
  }

  return matched[1].replace(doubleQuoteRegExp, "'");
}

// Fallback for modularized imports:
/* harmony default export */ const date_fns_format = ((/* unused pure expression or super */ null && (format)));

;// ./src/todoTaskView.js







class TaskView {
    #task;
    #domElement;
    #listeners;
    #dataElements;

    constructor(task) {
        this.#task = task;
        this.#listeners = [];
        this.#dataElements = {};
        this.#domElement = this.#createDom();
        this.#task.addTaskChangedListener(this.#onTaskChanged);
    }

    get task() {
        return this.#task;
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {        
        this.#listeners.forEach((listener) => listener.dispose());
        this.#listeners = null;
        this.#domElement = null;
        this.#task.removeTaskChangedListener(this.#onTaskChanged);
        this.#task = null;
        this.#dataElements = null;
    }

    #createDom() {
        const taskView = document.createElement("div");
        taskView.classList.add("section-task");

        const completeButton = this.#createCompleteButtonMarkup();
        const taskContent = this.#createContentMarkup();
        const editButton = this.#createEditButtonMarkup();
        this.#setPriorityDataAttribute(taskView, this.#task);

        taskView.appendChild(completeButton);
        taskView.appendChild(taskContent);
        taskView.appendChild(editButton);

        return taskView;
    }

    #createContentMarkup() {
        const task = this.#task;

        const content = document.createElement("div");
        content.classList.add("task-content");

        const title = document.createElement("span");
        title.textContent = task.title;
        title.classList.add("task-title");
        this.#dataElements.title = title;
        content.appendChild(title);

        const description = document.createElement("span");
        description.textContent = task.description;
        description.classList.add("task-description");
        this.#dataElements.description = description;
        content.appendChild(description);

        const dateSpan = document.createElement("span");
        dateSpan.classList.add("task-date");
        const calendarIcon = createIconifyIcon(Icons.Calendar);
        const dateText = document.createElement("span");
        const hasDueDate = task.date != null;
        if (hasDueDate) {
            dateText.textContent = format(task.date, "d MMM");
        }
        else {
            dateText.textContent = "";
        }
        this.#dataElements.date = {};
        this.#dataElements.date.span = dateSpan;
        this.#dataElements.date.text = dateText;

        dateSpan.appendChild(calendarIcon);
        dateSpan.appendChild(dateText);
        dateSpan.classList.toggle("invisible", hasDueDate === false);

        content.appendChild(dateSpan);

        return content;
    }

    #createCompleteButtonMarkup() {
        const task = this.#task;

        const container = document.createElement("div");
        container.classList = ["task-complete-button-container"];

        const button = document.createElement("button");
        button.classList = ["task-complete-button"];
        button.type = "button";
        const circleIcon = createIconifyIcon(Icons.Circle);
        const checkIcon = createIconifyIcon(Icons.Check);
        checkIcon.classList.add("task-complete-check");
        checkIcon.classList.toggle("done", task.done);

        button.appendChild(circleIcon);
        button.appendChild(checkIcon);
        container.appendChild(button);

        const listener = function() {
            this.#task.done = !this.#task.done;

            todoAppData.saveChanges();
        }.bind(this);

        const onCompleteListener = domEventListener(button, "click", listener);
        this.#listeners.push(onCompleteListener);
        
        this.#dataElements.completeButton = {
            button : button,
            check : checkIcon
        };

        return container;
    }

    #createEditButtonMarkup() {
        const container = document.createElement("div");
        container.classList.add("task-edit-container");

        const editButton = createIconButton(Icons.Edit);
        editButton.classList.add("edit-button", "task");

        // Alternate way of binding callback this
        const onEditCb = function() {
            const editTaskModal = new EditTaskModal(this.#task);
            editTaskModal.taskEdited(({title, description, dueDate, priority}) => {
                this.#task.title = title;
                this.#task.description = description;
                this.#task.date = dueDate;
                this.#task.priority = priority;

                todoAppData.saveChanges();
            });
            editTaskModal.taskDeleted((task) => {
                task.deleteTask();
                
                todoAppData.saveChanges();
            });

            editTaskModal.show();
        }.bind(this);

        const onEditListener = domEventListener(editButton, "click", onEditCb);
        this.#listeners.push(onEditListener);

        container.appendChild(editButton);

        return container;
    }

    #onTaskChanged = (task) => {
        this.#dataElements.title.textContent = task.title;
        this.#dataElements.description.textContent = task.description;

        // Update date
        const hasDueDate = task.date != null;
        if (hasDueDate) {
            this.#dataElements.date.text.textContent = format(task.date, "d MMM");
        }
        else {
            this.#dataElements.date.text.textContent = "";
        }
        this.#dataElements.date.span.classList.toggle("invisible", hasDueDate === false);

        const completeCheck = this.#dataElements.completeButton.check;
        completeCheck.classList.toggle("done", task.done);

        this.#setPriorityDataAttribute(this.#domElement, task);
    };

    #setPriorityDataAttribute(domElement, task) {
        domElement.dataset.priority = task.priority.name;
    }
}

/* harmony default export */ const todoTaskView = (TaskView);
;// ./src/todoSectionView.js








class SectionView {
    #section;
    #domElement;
    #tasksDomContainer;
    #taskViews;
    #listeners;
    #dataDomElements;

    /**
     * 
     * @param {TodoSection} section 
     */
    constructor(section) {
        this.#section = section;
        this.#listeners = [];
        this.#taskViews = [];
        this.#dataDomElements = {};

        this.#domElement = this.#createDom(section);

        this.#section.addTaskAddedListener(this.#onTaskAdded);
        this.#section.addTaskRemovedListener(this.#onTaskRemoved);
        this.#section.addSectionChangedListener(this.#onSectionChanged);
    }

    get section() {
        return this.#section;
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {
        this.#section.removeTaskAddedListener(this.#onTaskAdded);
        this.#section.removeTaskRemovedListener(this.#onTaskRemoved);
        this.#section.removeSectionChangedListener(this.#onSectionChanged);

        this.#listeners.forEach((item) => item.dispose());
        this.#taskViews.forEach((view) => view.dispose());

        this.#taskViews = null;
        this.#listeners = null;
        this.#section = null;
        this.#domElement = null;
        this.#dataDomElements = null;
    }

    /**
     * 
     * @param {TodoSection} section 
     * @returns {HTMLElement}
     */
    #createDom(section) {
        const sectionView = document.createElement("section");
        sectionView.classList.add("project-section");
        const sectionHeader = this.#createSectionHeaderMarkup(section);

        const tasks = this.#createSectionTasksMarkup(section);

        const addTaskButton = createIconButton(Icons.Plus, "Add task");
        addTaskButton.classList.add("section-add-task");

        const listener = domEventListener(addTaskButton, "click", this.#addTaskCallback);
        this.#listeners.push(listener);

        sectionView.appendChild(sectionHeader);
        sectionView.appendChild(tasks);
        sectionView.appendChild(addTaskButton);

        this.#updateSectionDom(section);

        return sectionView;
    }

    #createSectionHeaderMarkup(section) {
        const header = document.createElement("header");
        header.classList = ["section-header"];

        const sectionTitle = document.createElement("h2");
        sectionTitle.classList = ["section-title"];
        this.#dataDomElements.title = sectionTitle;

        const taskCountSpan = document.createElement("span");
        taskCountSpan.classList = ["section-tasks-count"];
        this.#dataDomElements.taskCount = taskCountSpan;

        const editButton = createIconButton(Icons.Edit);
        editButton.classList.add("edit-button", "section");

        const listener = domEventListener(editButton, "click", this.#editSectionCallback);
        this.#listeners.push(listener);

        header.appendChild(sectionTitle);
        header.appendChild(taskCountSpan);
        header.appendChild(editButton);

        return header;
    }

    #createSectionTasksMarkup(section) {
        const tasks = document.createElement("div");
        tasks.classList.add("section-tasks");
        this.#tasksDomContainer = tasks;

        for (const task of section.tasks) {
            this.#addTaskView(task);
        }

        return tasks;
    }

    #addTaskView(task) {
        const taskView = new todoTaskView(task);

        this.#taskViews.push(taskView);
        this.#tasksDomContainer.appendChild(taskView.domElement);
    }

    #removeTaskView(task) {
        const taskViewIndex = this.#taskViews.findIndex((view) => view.task === task);
        if (taskViewIndex >= 0) {
            const taskView = this.#taskViews[taskViewIndex];

            this.#taskViews.splice(taskViewIndex, 1);
            this.#tasksDomContainer.removeChild(taskView.domElement);
            taskView.dispose();
        }
    }

    #addTaskCallback = () => {
        const createTaskModal = new CreateTaskModal();
        createTaskModal.taskCreated(this.#onTaskCreatedCallback);
        createTaskModal.show();
    };

    #editSectionCallback = () => {
        const editSectionModal = new EditSectionModal(this.#section);

        editSectionModal.sectionEdited(({title}) => {
            this.#section.title = title;

            todoAppData.saveChanges();
        });

        editSectionModal.sectionDeleted((section) => {
            section.deleteSection();
            todoAppData.saveChanges();
        });

        editSectionModal.show();
    };

    #onTaskCreatedCallback = ({ title, description, dueDate, priority }) => {
        this.#section.addTask(title, description, dueDate, priority);
        todoAppData.saveChanges();
    };

    /**
     * Called when a task was added to the section.
     * @param {TodoTask} task 
     */
    #onTaskAdded = (task) => {
        this.#addTaskView(task);
        // Update the section count dom element
        this.#updateSectionDom(this.#section);
    };

    /**
     * Called when a task was removed from the section.
     * @param {TodoTask} task 
     */
    #onTaskRemoved = (task) => {
        this.#removeTaskView(task);
        // Update the section count dom element
        this.#updateSectionDom(this.#section);
    };

    /**
     * Called when the section data has changed.
     * @param {TodoSection} section 
     */
    #onSectionChanged = (section) => {
        this.#updateSectionDom(section);
    };

    #updateSectionDom(section) {
        this.#dataDomElements.taskCount.textContent = section.tasksCount.toString();
        this.#dataDomElements.title.textContent = section.title;
    }
}

/* harmony default export */ const todoSectionView = (SectionView);
;// ./src/todoProjectView.js








class ProjectView {
    #project;
    #domElement;
    #sectionViews;
    #sectionsDomContainer;
    #listeners;

    constructor(project) {
        this.#project = project;
        this.#sectionViews = [];
        this.#listeners = [];
        this.#domElement = this.#createDom(project);

        this.#project.addProjectChangedListener(this.#onProjectChanged);
        this.#project.addSectionAddedListener(this.#onProjectSectionAdded);
        this.#project.addSectionRemovedListener(this.#onProjectSectionRemoved);
    }

    get project() {
        return this.#project;
    }

    get domElement() {
        return this.#domElement;
    }

    dispose() {
        this.#project.removeSectionAddedListener(this.#onProjectSectionAdded);
        this.#project.removeSectionRemovedListener(this.#onProjectSectionRemoved);
        this.#project.removeProjectChangedListener(this.#onProjectChanged);

        this.#sectionViews.forEach((sectionView) => sectionView.dispose());
        this.#listeners.forEach((listener) => listener.dispose());

        this.#listeners = null;
        this.#sectionViews = null;
        this.#project = null;
        this.#domElement = null;
        this.#sectionsDomContainer = null;
    }

    #createDom(project) {
        const container = document.createElement("div");
        container.classList = ["main-content-project"];
        const header = this.#createProjectHeaderMarkup();
        const content = this.#createProjectContentMarkup(project);
        container.appendChild(header);
        container.appendChild(content);

        return container;
    }

    #createProjectHeaderMarkup() {
        const header = document.createElement("header");
        header.classList = ["project-header"];

        const editProjectButton = createIconButton(Icons.Edit, "Edit");
        editProjectButton.id = "project-header-edit";
        editProjectButton.classList.add("edit-button");

        const listener = domEventListener(editProjectButton, "click", this.#editProjectCallback);
        this.#listeners.push(listener);

        header.appendChild(editProjectButton);

        return header;
    }

    #createProjectContentMarkup(project) {
        const contentElement = document.createElement("div");
        contentElement.classList = ["project-content"];

        const titleElement = this.#createProjectTitleMarkup(project);
        contentElement.appendChild(titleElement);

        const sectionsElement = this.#createProjectSections(project);
        contentElement.appendChild(sectionsElement);

        return contentElement;
    }

    #createProjectTitleMarkup(project) {
        const titleContainer = document.createElement("div");
        titleContainer.classList = ["project-title-container"];

        const titleEditDiv = document.createElement("div");
        const titleHeading = document.createElement("h1");
        titleHeading.classList = ["project-title"];
        titleHeading.textContent = project.title;
        titleEditDiv.classList = ["project-title-edit"];

        titleEditDiv.appendChild(titleHeading);
        titleContainer.appendChild(titleEditDiv);

        return titleContainer;
    }

    #createProjectSections(project) {
        const sectionsContainer = document.createElement("div");
        sectionsContainer.classList = ["project-sections-container"];

        const sections = document.createElement("div");
        sections.classList = ["project-sections"];
        this.#sectionsDomContainer = sections;

        for (const section of project.sections) {
            this.#addSectionView(section);
        }
        sectionsContainer.appendChild(sections);

        // "Add section" button
        const addSectionButtonContainer = document.createElement("div");
        addSectionButtonContainer.classList = ["project-add-section-container"];
        const addSectionButton = createIconButton(Icons.Plus, "Add section");
        addSectionButton.id = "project-add-section";

        const listener = domEventListener(addSectionButton, "click", this.#addSectionCallback);
        this.#listeners.push(listener);

        addSectionButtonContainer.appendChild(addSectionButton);
        sectionsContainer.appendChild(addSectionButtonContainer);

        return sectionsContainer;
    }

    #addSectionView(section) {
        const sectionView = new todoSectionView(section);

        this.#sectionViews.push(sectionView);
        this.#sectionsDomContainer.appendChild(sectionView.domElement);
    }

    #removeSectionView(section) {
        const sectionViewIndex = this.#sectionViews.findIndex((view) => view.section === section);
        if (sectionViewIndex >= 0) {
            const sectionView = this.#sectionViews[sectionViewIndex];

            this.#sectionViews.splice(sectionViewIndex, 1);
            this.#sectionsDomContainer.removeChild(sectionView.domElement);
            sectionView.dispose();
        }
    }

    #onProjectChanged = () => {
        const projectTitle = this.#domElement.querySelector(".project-title");
        if (projectTitle) {
            projectTitle.textContent = this.#project.title;
        }
    };

    /**
     * Called when a section was added to the project.
     * @param {TodoSection} section 
     */
    #onProjectSectionAdded = (section) => {
        this.#addSectionView(section);
    };

    /**
    * Called when a section was removed from the project.
    * @param {TodoSection} section 
    */
    #onProjectSectionRemoved = (section) => {
        this.#removeSectionView(section);
    };

    #editProjectCallback = () => {
        const project = this.#project;
        const editProjectModal = new EditProjectModal(project);
        editProjectModal.projectEdited(({ title }) => {
            project.title = title;

            todoAppData.saveChanges();
        });

        editProjectModal.projectDeleted((project) => {
            todoAppData.deleteProject(project);

            todoAppData.saveChanges();
        });
        editProjectModal.show();
    };

    #addSectionCallback = () => {
        const createSectionModal = new CreateSectionModal();
        createSectionModal.sectionCreated(({ title }) => {
            this.#project.addSection(title);

            todoAppData.saveChanges();
        });
        createSectionModal.show();
    };
}


;// ./src/todoApp.js





let currentContent = null;
let init = false;
const mainContent = document.querySelector("#main-content");

function initApp() {
    if(init) {
        throw new Error("Website already initialized !");
    }

    init = true;

    todoAppData.loadData();
    const projects = todoAppData.getProjects();
    todoSidebar.initSidebar(onSidebarAddProject, onSidebarProjectSelected);

    const initialProject = projects.length > 0 ? projects[0] : null;
    displayProject(initialProject);

    todoAppData.addProjectDeletedListener(todoApp_onProjectDeleted);
}

function displayProject(project) {
    if(project === null) {
        setEmptyContent();
        return;
    }

    const projectView = new ProjectView(project);
    setContent(projectView);
    todoSidebar.setActiveProject(project);
}

function setEmptyContent() {
    const emptyPage = document.createElement("div");
    setContent({domElement: emptyPage});
    todoSidebar.setActiveProject(null);
}

function setContent(contentToDisplay) {
    if(currentContent && currentContent.dispose) {
        currentContent.dispose();
    }

    if (mainContent) {
        // Clear main
        mainContent.innerHTML = "";
    }

    mainContent.appendChild(contentToDisplay.domElement);
    currentContent = contentToDisplay;
}

function onSidebarAddProject() {
    // Show add project modal
    const addProjectModal = new CreateProjectModal();
    addProjectModal.projectCreated(({ title }) => {
        const project = todoAppData.addProject(title);
        displayProject(project);

        todoAppData.saveChanges();
    });

    addProjectModal.show();
}

function onSidebarProjectSelected(project) {
    displayProject(project);
}

function todoApp_onProjectDeleted(project) {
    if(currentContent instanceof ProjectView && currentContent.project === project) {
        const projects = todoAppData.getProjects();
        if(projects.length > 0) {
            displayProject(projects[0]);
        }
        else {
            setEmptyContent();
        }
    }
}

const todoApp = {
    initApp
};

/* harmony default export */ const src_todoApp = (todoApp);
;// ./src/index.js




src_todoApp.initApp();
/******/ })()
;
//# sourceMappingURL=main.js.map