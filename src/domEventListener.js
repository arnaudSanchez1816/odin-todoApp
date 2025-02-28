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

export default createDomEventListener;