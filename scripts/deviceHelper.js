if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [],
    function() {
        var _orientation_event, _supports_orientation;
        var _screenWidth, _screenHeight;
        var that;

        function _handleOrientation() {
            var result = null;


            if (that.ios() && that.landscape()) {
                _screenWidth = screen.height;
                _screenHeight = screen.width;
            } else {
                _screenWidth = screen.width;
                _screenHeight = screen.height;
            }

            if (that.landscape()) {
                that._removeClass("portrait");
                result = that._addClass("landscape");
            } else {
                that._removeClass("landscape");
                result = that._addClass("portrait");
            }
            if (that._userOrientationHandler)
                that._userOrientationHandler();
            return result;
        }


        var Device = Class.extend({
            init: function(userAgent) {
                that = this;
                this._UserAgent = userAgent.toLowerCase();
                this._ClientMode = false;
                if (!(typeof module !== 'undefined' && module.exports)) {
                    this._ClientMode = true;
                    this._DocElement = window.document.documentElement;
                    this._setupOnClient();
                }
                this._userOrientationHandler = null;
            },
            setOrientationHandler: function(callback) {
                this._userOrientationHandler = callback;
            },

            ios: function() {
                return this.iphone() || this.ipod() || this.ipad();
            },

            iphone: function() {
                return this._find('iphone');
            },

            ipod: function() {
                return this._find('ipod');
            },

            ipad: function() {
                return this._find('ipad');
            },

            android: function() {
                return this._find('android');
            },
            androidPhone: function() {
                return this.android() && this._find('mobile');
            },

            androidTablet: function() {
                return this.android() && !this._find('mobile');
            },

            blackberry: function() {
                return this._find('blackberry') || this._find('bb10') || this._find('rim');
            },

            blackberryPhone: function() {
                return this.blackberry() && !this._find('tablet');
            },

            blackberryTablet: function() {
                return this.blackberry() && this._find('tablet');
            },

            windows: function() {
                return this._find('windows');
            },

            windowsPhone: function() {
                return this.windows() && this._find('phone');
            },

            windowsTablet: function() {
                return this.windows() && this._find('touch');
            },

            fxos: function() {
                return this._find('(mobile; rv:') ||this. _find('(tablet; rv:');
            },

            fxosPhone: function() {
                return this.fxos() && this._find('mobile');
            },

            fxosTablet: function() {
                return this.fxos() && this._find('tablet');
            },

            mobile: function() {
                return this.androidPhone() || this.iphone() || this.ipod() || this.windowsPhone() || this.blackberryPhone() || this.fxosPhone();
            },

            tablet: function() {
                return this.ipad() || this.androidTablet() || this.blackberryTablet() || this.windowsTablet() || this.fxosTablet();
            },

            portrait: function() {
                if (this._ClientMode)
                    return Math.abs(window.orientation) !== 90;
                else
                    throw ("Unsupported on the server");
            },

            landscape: function() {
                if (this._ClientMode)
                    return Math.abs(window.orientation) === 90;
                else
                    throw ("Unsupported on the server");
            },

            screenWidth: function () {
                return _screenWidth;
            },

            screenHeight: function () {
                return _screenHeight;
            },
            _find: function(needle) {
                return this._UserAgent.indexOf(needle) !== -1;
            },

            _hasClass: function(class_name) {
                var regex;
                regex = new RegExp(class_name, 'i');
                return this._DocElement.className.match(regex);
            },

            _addClass: function(class_name) {
                if (!this._hasClass(class_name)) {
                    return this._DocElement.className += " " + class_name;
                }
            },

            _removeClass: function(class_name) {
                if (this._hasClass(class_name)) {
                    return this._DocElement.className = this._DocElement.className.replace(class_name, "");
                }
            },

            _setupOnClient: function() {
                if (!this._ClientMode) return;
                if (this.ios()) {
                    if (this.ipad()) {
                        this._addClass("ios ipad tablet");
                    } else if (this.iphone()) {
                        this._addClass("ios iphone mobile");
                    } else if (this.ipod()) {
                        this._addClass("ios ipod mobile");
                    }
                } else if (this.android()) {
                    if (this.androidTablet()) {
                        this._addClass("android tablet");
                    } else {
                        this._addClass("android mobile");
                    }
                } else if (this.blackberry()) {
                    if (this.blackberryTablet()) {
                        this._addClass("blackberry tablet");
                    } else {
                        this._addClass("blackberry mobile");
                    }
                } else if (this.windows()) {
                    if (this.windowsTablet()) {
                        this._addClass("windows tablet");
                    } else if (this.windowsPhone()) {
                        this._addClass("windows mobile");
                    } else {
                        this._addClass("desktop");
                    }
                } else if (this.fxos()) {
                    if (this.fxosTablet()) {
                        this._addClass("fxos tablet");
                    } else {
                        this._addClass("fxos mobile");
                    }
                } else {
                    this._addClass("desktop");
                }

                _supports_orientation = "onorientationchange" in window;
                _orientation_event = "resize";

                if (window.addEventListener) {
                    window.addEventListener(_orientation_event, _handleOrientation, false);
                } else if (window.attachEvent) {
                    window.attachEvent(_orientation_event, _handleOrientation);
                } else {
                    window[_orientation_event] = _handleOrientation;
                }

                _handleOrientation();
            }
        });

        return Device;
    });
