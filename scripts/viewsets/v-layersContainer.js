define(
    ['text!./templates/lContainer.html', '/scripts/viewsets/v-container.js'
        , "flex-container"],
    function(tpl, VContainer) {
        const vFlexContainer = class vFlexContainer extends VContainer {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var vSet = this;
                var pItem = $(this._templates['container']).attr('id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                // добавляем в парент
                var parent = component.getParentComp()? '#ch_' + thcomponentis.getLid(): options.rootContainer;
                pItem.height($(parent).height());

                component._onGenetixResize = function () {
                    vSet._handleResize(component, options);
                }

                $(window).on("genetix:resize", component._onGenetixResize);

                return pItem;
            }

            initItem(pItem, component, options) {
                var item = $("#" + component.getLid());
                var vSet = this;

                if (component.verticalAlign()) {
                    pItem.css("display", "table-cell");
                    var vAl = component.verticalAlign().toUpperCase();
                    if (vAl == "TOP")
                        pItem.css("vertical-align", "top");
                    else if (vAl == "BOTTOM")
                        pItem.css("vertical-align", "bottom");
                    else
                        pItem.css("vertical-align", "middle");
                }
                else {
                    pItem.css("display", "");
                    pItem.css("vertical-align", "");
                }

                var cont = item.children(".c-content");

                if ("isCentered" in component.getParentComp() && component.getParentComp().isCentered())
                    cont.css({"border-radius" : "0.25em"});

                if (component.getParentComp() && !component.getParentComp().getParentComp()) {
                    if (component.getParentComp().isCentered() === undefined || !component.getParentComp().isCentered())
                        cont.css("padding", "0");
                    item.addClass("m-container")
                } else if (component.hasPadding && !component.hasPadding()) {
                    cont.css("padding", "0");
                }

                var height = component.height() || "auto";
                if (component.height() == "auto")
                    item.css({height: "auto"});
                else {
                    if ($.isNumeric(height))
                        height += "px";
                    item.css({
                        "height": height,
                    });
                    pItem.css({
                        "height": height,
                    });
                }

                // создаем врапперы для чайлдов
                var children = component.getCol('Children');
                for(var i=0; i<children.count();i++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        div.children().attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                        div.on("genetix:childPropChanged", function(event, data) {
                            vSet.handleChildChanged(component, event, data);
                            return false;
                        });
                        cont.append(div);
                        div.css({"width": "100%", "height": "100%"});
                    }
                    this._setChildCSS(component, child);
                }

                this._setVisibleTab(component);

                // убираем удаленные объекты
                var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                for (var guid in del)
                    $('#ext_' + del[guid].getLid()).remove();

                this._setVisible(component);
                this._genEventsForParent(component);
                setTimeout(function() {
                    console.log("setTimeout layersContainer");
                    vSet._handleResize(component, options);
                    $(window).trigger("genetix:triggerResize");
                }, 100);

            }

            destroyUI(item, component) {
                $(window).off("genetix:resize", component._onGenetixResize);
            }

            _setVisibleTab(component) {
                var tabNum = component.tabNumber() || 0;
                var children = component.getCol('Children');
                for(var i=0; i<children.count();i++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_'+child.getLid());
                    if (i == tabNum)
                        div.show();
                    else
                        div.hide();
                }
            }

            _handleResize(component, options) {
                var vSet = this;
                var pp = $("#mid_" + component.getLid());
                var p = component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer;
                $(p).css("height", "auto");
                pp.css("height", "auto");
                var childs = component.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = component.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    vSet._setChildCSS(component, child);
                }
            }

            _setChildCSS(component, child) {
                var div = $("#ext_" + child.getLid())
                var chDiv = div.children();
                if ("position" in child && child.position() == "center") {
                    div.css({
                        margin: "0",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    });

                } else {
                    div.css({width: "100%"});
                    var height = child.height() || "auto";
                    if (height != "auto") {
                        if ($.isNumeric(height))
                            height += "px";
                        div.css({
                            "height": height,
                        });
                    } else {
                        var chEDiv = $("#" + child.getLid());
                        div.css({
                            "min-height" : "",
                            "height": ""
                        });
                        div.css({
                            "min-height" : chEDiv.height(),
                            "height": chEDiv.height()
                        });
                    }
                }

                if (child.minHeight()) {
                    var u = "em";
                    var h = 0;
                    if ($.isNumeric(child.minHeight()))
                        h = child.minHeight();
                    else {
                        h = child.minHeight();
                        h = h.substr(0, h.length - 2);
                        u = h.substr(h.length - 2, 2);
                    }
                    div.genetixFlexMinDimention({
                        minSize: h,
                        sizeUnits: u,
                        dimension: 0
                    });
                    div.genetixFlexMinDimention("executeResize");
                }

                if (child.padLeft())
                    chDiv.css("padding-left", child.padLeft());
                else
                    chDiv.css("padding-left", "");
                if (child.padRight())
                    chDiv.css("padding-right", child.padRight());
                else
                    chDiv.css("padding-right", "");
                if (child.padTop())
                    chDiv.css("padding-top", child.padTop());
                else
                    chDiv.css("padding-top", "");
                if (child.padBottom())
                    chDiv.css("padding-bottom", child.padBottom());
                else
                    chDiv.css("padding-bottom", "");
                if (child.minWidth())
                    div.css("min-width", child.minWidth());
                else
                    div.css("min-width", "");

                if (child.verticalAlign()) {
                    var vAl = child.verticalAlign().toUpperCase();
                    if (vAl == "CENTER") {
                        chDiv.css("float", "");
                        chDiv.css("display", "table");
                        chDiv.css("height", div.height());
                    }
                } else {
                    chDiv.css("float", "");
                    chDiv.css("display", "");
                }

                this._setVisibleTab(component);
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
                if (component.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

                if (genEvent) {
                    $('#ext_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }

            handleChildChanged(component, event, data) {
            }

        }
    }
);