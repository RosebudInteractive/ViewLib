/**
 * User: kiknadze
 * Date: 13.08.2015
 * Time: 12:59
 */
define(
    ['/scripts/uccello/uses/template.js'
        , 'text!./templates/toolbarButton.html'
        , '/scripts/viewsets/vbase.js'
    ], function(template, tpl, Base) {
        var vButton = {};
        for (var i in Base)
            vButton[i] = Base[i];
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var item = $('#' + this.getLid());
            var that = this;
            if (item.length == 0) {
                var pItem = $(vButton._templates['button']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = '#' + (this.getParentComp()? "ch_"+this.getLid():options.rootContainer);
                $(parent).append(pItem);
                $(parent).css("position", "relative");

                var toolbar = this.getParentComp();
                var tStyle = toolbar.toolbarSize() || "big";
                tStyle = tStyle.toUpperCase();
                var tColor = toolbar.toolbarColor() || "blue";
                tColor = tColor.toUpperCase();
                var bKind = this.buttonKind() || "normal";
                bKind = bKind.toUpperCase();
                if (tColor  == "BLUE" && tStyle == "BIG" && bKind == "RADIO") {
                    pItem.append($(vButton._templates['leftCorner1']))
                    pItem.append($(vButton._templates['leftCorner2']))
                    pItem.append($(vButton._templates['rightCorner1']))
                    pItem.append($(vButton._templates['rightCorner2']))
                }

                pItem.click(function() {
                    vButton._togglePressed.call(that);

                    if ("onClick" in that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.onClick.apply(that);
                        });
                    }
                    if (that.tabStop())
                        item.focus();
                });
                item.focus(function() {
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function () {
                            that.setFocused();
                        });
                    }
                });
            } else {
                pItem = $("#mid_" + this.getLid());

            }

            var cStyle = this.captionStyle() || "text";
            cStyle = cStyle.toUpperCase();
            item.removeClass("has-caption has-image has-both");
            if (cStyle == "TEXT")
                item.addClass("has-caption");
            else if (cStyle == "IMAGE")
                item.addClass("has-image");
            else
                item.addClass("has-both");

            vButton._setPressedState.call(this);

            var imgWrapper = item.find(".t-button-icon-wrapper");
            if (!this.image())
                imgWrapper.empty();
            else if ((this.image() && imgWrapper.children().length == 0) || this.isFldModified("Image")) {
                imgWrapper.empty();
                var imgTmpl = vButton._templates['svg'];
                var toolbar = this.getParentComp();
                var tStyle = toolbar.toolbarSize() || "big";
                tStyle = tStyle.toUpperCase();
                var imgSize = "16";
                var imgName = this.image();
                if (tStyle  == "BIG") imgSize = "22";
                else imgName += "_16";
                while (imgTmpl.indexOf("###SIZE###") != -1)
                    imgTmpl = imgTmpl.replace("###SIZE###", imgSize);
                imgTmpl = imgTmpl.replace("###IMAGE###", imgName);
                imgWrapper.append($(imgTmpl));
            }

            var captionWrapper = item.find(".t-button-caption");
            if (this.caption())
                captionWrapper.text(this.caption());
            else
                captionWrapper.text("");

            var enabled = (this.enabled() === undefined ? true : this.enabled());
            if (enabled) item.removeClass("is-disabled");
            else item.addClass("is-disabled");

            var currentControl = this.getForm().currentControl();
            if (this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this) {
                item.addClass("has-focus");
                item.focus();
            } else
                item.removeClass("has-focus");

            vButton._setVisible.call(this);
            vButton._genEventsForParent.call(this);

        }

        vButton._togglePressed = function() {
            console.log("_togglePressed begin");
            var that = this;
            var bKind = that.buttonKind() || "normal";
            bKind = bKind.toUpperCase();

            if (bKind == "NORMAL") return;
            else if (bKind == "RADIO") {




                //var curPressed = that.pressed() || false;
                //if (curPressed) return;
                this.getControlMgr().userEventHandler(this, function () {
                    console.log("Begin user event handler and set button's pressed property");
                    that.pressed(true);
                    vButton._genPressedChanged.call(that);
                    console.log("End user event handler");
                });
            } else {
                this.getControlMgr().userEventHandler(this, function(){
                    that.pressed(!that.pressed());
                    vButton._genPressedChanged.call(that);
                });
            }
        }

        vButton._genPressedChanged = function() {
            $('#ch_' + this.getLid()).trigger("genetix:pressedChanged", {
                control: this
            });
        }

        vButton._setPressedState = function() {
            var item = $('#' + this.getLid());
            var bKind = this.buttonKind() || "normal";
            bKind = bKind.toUpperCase();
            var isPressed = this.pressed() || false;
            var cornersVis = "none";
            if (bKind == "NORMAL") {
                item.removeClass("is-pressed");

            } else {
                if (isPressed) { item.addClass("is-pressed"); cornersVis = "" }
                else item.removeClass("is-pressed");
            }

            var pItem = $("#mid_" + this.getLid());
            pItem.children("span").css("display", cornersVis);

            if (bKind == "NORMAL") {
                item.removeClass("is-toggle is-radio");
                item.addClass("is-normal");
            } else if (bKind == "RADIO") {
                item.removeClass("is-toggle is-normal");
                item.addClass("is-radio");
            } else {
                item.removeClass("is-radio is-normal");
                item.addClass("is-toggle");
            }
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vButton._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (this.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
            if (this.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
            if (this.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
            if (this.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
            if (this.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
            if (this.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
            if (this.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
            if (this.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
            if (this.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
            if (this.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }
            //if (this.isFldModified("Pressed")) { changedFields.Pressed = true; genEvent = true; }
            if (this.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

            if (genEvent) {
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }
        return vButton;
    }
);