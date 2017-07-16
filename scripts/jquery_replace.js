/**
 * Created by levan.kiknadze on 03/03/2017.
 */

define(
    [],
    function() {
        const NODE_TYPE_EL = 1;
        const NODE_TYPE_ATTR = 2;
        const NODE_TYPE_TEXT = 3;
        const NODE_TYPE_COMMENT = 8;

        const JQueryUtils = class {
            getFirstChild(element) {
                if (element) {
                    return element.firstElementChild
                }
                return null;
            }

            getChildren(element, selector) {
                var result = [];
                for (var i = 0, l = element.childNodes.length; i < l; i++) {
                    var n = element.childNodes[i];
                    if (n.nodeType == NODE_TYPE_EL && this.isMatchToSelector(n, selector)) result.push(n);
                }

                return result;
            }

            height(element, value) {
                if (value !== undefined) {
                    if (this.isNumeric(value)) value = value + "px";
                    element.style.height = value;
                } else {
                    return element.clientHeight;
                }
            }

            width(element, value) {
                if (value !== undefined) {
                    if (this.isNumeric(value)) value = value + "px";
                    element.style.width = value;
                } else {
                    return element.clientWidth;
                }
            }

            isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }

            isMatchToSelector(el, selector) {
                if (!selector) return true;
                var classes = selector.split(".");
                for (var i = 0, l = classes.length; i < l; i++) {
                    if (classes[i] && !this.checkClass(el, classes[i])) return false;
                }

                return true;
            }

            checkClass(el, className) {
                var r = new RegExp("(?:^|\s)" + className + "(?!\S)");
                return el.className.match(r);
            }

            css(el, name, value) {
                if (value === undefined) {
                    return el.style[name];
                } else {
                    el.style[name] = value;
                }
            }
        }

        return JQueryUtils;
    }
);