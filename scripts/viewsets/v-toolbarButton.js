/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/toolbarButton.html', '/scripts/viewsets/v-base.js'],
    function(tpl, ViewBase) {
        const vToolbarButton = class vToolbarButton extends ViewBase {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var vSet = this;
                var pItem = $(this._templates['button']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());
                var parent = '#' + (component.getParentComp()? "ch_"+component.getLid():options.rootContainer);
                $(parent).css("position", "relative");

                var toolbar = component.getParentComp();
                var tStyle = toolbar.toolbarSize() || "big";
                tStyle = tStyle.toUpperCase();
                var tColor = toolbar.toolbarColor() || "blue";
                tColor = tColor.toUpperCase();
                var bKind = component.buttonKind() || "normal";
                bKind = bKind.toUpperCase();
                if (tColor  == "BLUE" && tStyle == "BIG" && bKind == "RADIO") {
                    pItem.append($(this._templates['leftCorner1']))
                    pItem.append($(this._templates['leftCorner2']))
                    pItem.append($(this._templates['rightCorner1']))
                    pItem.append($(this._templates['rightCorner2']))
                }

                pItem.click(function() {
                    vSet._togglePressed(component);

                    if ("onClick" in component) {
                        component.getControlMgr().run(() => {
                            component.onClick();
                        });
                    }
                    if (component.tabStop())
                        item.focus();
                });
                item.focus(function() {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(() => {
                            component.setFocused();
                        });
                    }
                });

                return pItem;
            }

            initItem(pItem, component) {
                var vSet = this;
                var item = $("#" + component.getLid())
                var cStyle = component.captionStyle() || "text";
                cStyle = cStyle.toUpperCase();
                item.removeClass("has-caption has-image has-both");
                if (cStyle == "TEXT")
                    item.addClass("has-caption");
                else if (cStyle == "IMAGE")
                    item.addClass("has-image");
                else
                    item.addClass("has-both");

                this._setPressedState(pItem, component);

                var imgWrapper = item.find(".t-button-icon-wrapper");
                if (!component.image())
                    imgWrapper.empty();
                else if ((component.image() && imgWrapper.children().length == 0) ||
                    component.isFldModified("Image")) {
                    imgWrapper.empty();
                    var imgTmpl = this._templates['svg'];
                    var toolbar = component.getParentComp();
                    var tStyle = toolbar.toolbarSize() || "big";
                    tStyle = tStyle.toUpperCase();
                    var imgSize = "16";
                    var imgName = component.image();
                    if (tStyle  == "BIG") imgSize = "22";
                    else imgName += "_16";
                    while (imgTmpl.indexOf("###SIZE###") != -1)
                        imgTmpl = imgTmpl.replace("###SIZE###", imgSize);
                    imgTmpl = imgTmpl.replace("###IMAGE###", imgName);
                    imgWrapper.append($(imgTmpl));
                }

                var captionWrapper = item.find(".t-button-caption");
                if (component.caption())
                    captionWrapper.text(component.caption());
                else
                    captionWrapper.text("");

                var enabled = (component.enabled() === undefined ? true : component.enabled());
                if (enabled) item.removeClass("is-disabled");
                else item.addClass("is-disabled");

                var currentControl = component.getForm().currentControl();
                if (component.getForm().isFldModified("CurrentControl") &&
                    component.getForm().currentControl() == component) {
                    item.addClass("has-focus");
                    item.focus();
                } else
                    item.removeClass("has-focus");

                vSet._setVisible(component);
                vSet._genEventsForParent(component);
            }

            _togglePressed(component) {
                var vSet = this;
                console.log("_togglePressed begin");
                var bKind = component.buttonKind() || "normal";
                bKind = bKind.toUpperCase();

                if (bKind == "NORMAL") return;
                else if (bKind == "RADIO") {
                    //var curPressed = component.pressed() || false;
                    //if (curPressed) return;
                    component.getControlMgr().run(() => {
                        console.log("Begin user event handler and set button's pressed property");
                        component.pressed(true);
                        vSet._genPressedChanged(component);
                        console.log("End user event handler");
                    });
                } else {
                    component.getControlMgr().run(() => {
                        component.pressed(!component.pressed());
                        vSet._genPressedChanged(component);
                    });
                }
            }

            _genPressedChanged(component) {
                $('#ch_' + component.getLid()).trigger("genetix:pressedChanged", {
                    control: component
                });
            }

            _setPressedState(pItem, component) {
                var item = $('#' + component.getLid());
                var bKind = component.buttonKind() || "normal";
                bKind = bKind.toUpperCase();
                var isPressed = component.pressed() || false;
                var cornersVis = "none";
                if (bKind == "NORMAL") {
                    item.removeClass("is-pressed");

                } else {
                    if (isPressed) { item.addClass("is-pressed"); cornersVis = "" }
                    else item.removeClass("is-pressed");
                }

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

            _genEventsForParent(component) {
                var genEvent = false;
                var changedFields = {};
                if (component.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
                if (component.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
                if (component.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
                if (component.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
                if (component.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
                if (component.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
                if (component.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
                if (component.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
                if (component.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
                if (component.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
                if (component.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
                if (component.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }
                //if (this.isFldModified("Pressed")) { changedFields.Pressed = true; genEvent = true; }
                if (component.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

                if (genEvent) {
                    $('#ch_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }


        }

        return vToolbarButton;
    }
);