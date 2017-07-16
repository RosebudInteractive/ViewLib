/**
 * User: kiknadze
 * Date: 02.07.2015
 * Time: 15:21
 */
define(
    'flex-min-dimension',
    function() {
        $.widget( "custom.genetixFlexMinDimention", {
            options: {
                minSize: 0,
                sizeUnits: "px",
                dimension: 0, // 0 - ������, 1 - ������
                realMinSize: 0
            },

            _create: function () {
                var that = this;

                this._oldFlex = this.element.css("flex");
                if (this._oldFlex == "0 1 auto")
                    this._oldFlex = "";
                if (this.options.sizeUnits == "em") {
                    var fontSize = this.element.css("font-size");
                    fontSize = fontSize.replace("px", "");
                    console.log(fontSize);
                    this.options.realMinSize = fontSize * this.options.minSize;
                } else
                    this.options.realMinSize = this.options.minSize;

                $(window).on("genetix:resize", function () {
                    that._resizeHandler();
                });

                setTimeout(function() {
                    console.log("setTimeout flex-min-dimention");
                    that._resizeHandler();
                }, 0);
            },
            _resizeHandler: function() {
                var newSize = 0;
                this.element.css("flex", this._oldFlex);
                this.element.css("min-height", "0px");
                if (this.options.dimension == 0) {
                    this.element.css("height", "");
                    newSize = this.element.height();
                }
                else {
                    this.element.css("width", "");
                    newSize = this.element.width();
                }

                if (newSize <= this.options.realMinSize) {
                    if (this.options.dimension == 0) {
                        this.element.height(this.options.realMinSize);
                        this.element.css("min-height", this.options.realMinSize + "px");
                    } else {
                        this.element.width(this.options.realMinSize);
                        this.element.css("min-width", this.options.realMinSize + "px");
                    }
                    this.element.css("flex", "");
                }
            },

            executeResize: function() {
                this._resizeHandler();
            }
        });
    }
);
