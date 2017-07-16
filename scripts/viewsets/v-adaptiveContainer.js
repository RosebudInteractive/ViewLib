define(
    ['text!./templates/adaptiveContainer.html', '/scripts/viewsets/v-container.js'],
    function(tpl, VContainer) {
        const vAdaptiveContainer = class vAdaptiveContainer extends VContainer {
            static getTemplate() {
                return tpl
            }
            createItem(component, options) {
                var vSet = this;
                var pItem = $(this._templates['aContainer']).attr('data-id', "mid_" + component.getLid());
                pItem.children(".control").attr('id', component.getLid());

                // добавляем в парент
                var parent = component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer;
                //pItem.height($(parent).height());

                component._onGenetixResize = function () {
                    var stDate = new Date();

                    var layout = vSet._getCurrentLayout(component);
                    if (component._currentLayout != layout) {
                        if (component._currentLayout)
                            $('#lay_' + component._currentLayout.getLid()).hide();
                        if (layout)
                            $('#lay_' + layout.getLid()).show();
                        component._currentLayout = layout;
                        vSet._switchLayout(component, layout, layout);
                    }
                    vSet._handleResize(component, layout);

                    var enDate = new Date();
                    console.log("adaptive container render time: ", enDate - stDate);
                }

                $(window).on("genetix:resize", component._onGenetixResize);
                return pItem
            }

            initItem(pItem, component) {
                var item = $("#" + component.getLid())
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

                if (component.height() == "auto")
                    item.css({height: "auto"});

                var cont = item.children(".c-content");
                if (component.getParentComp() && !component.getParentComp().getParentComp()) {
                    if (component.getParentComp().isCentered() === undefined ||
                        !component.getParentComp().isCentered())
                        cont.css("padding", "0");
                    item.addClass("m-container")
                } else {
                    cont.css("padding", "0");
                }

                // создаем врапперы для разметок
                var curLayout = this._getCurrentLayout(component);
                component._currentLayout = curLayout;
                var children = component.getCol('Layouts');
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    var div = $('#lay_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>')
                            .attr({'id': 'lay_' + child.getLid(), 'data-debug': child.resElemName()});
                        div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                    }
                    if (child == curLayout) div.show();
                    else div.hide();
                    this._renderLayout(component, child, child == curLayout, child);
                }

                this._setVisible(component);
                this._genEventsForParent(component);
                var layout = this._getCurrentLayout(component);

                this._handleResize(component, layout);
            }

            destroyUI(item, component) {
                $(window).off("genetix:resize", component._onGenetixResize);
            }

            _switchLayout(component, layout, rootLayout) {
                var vSet = this;
                if (!layout || !rootLayout) return;
                var child = layout.control();
                if (child) {
                    var targetCont = $("#cont_" + rootLayout.getLid() + "_" + child.getLid());
                    var chDiv = $("#ext_" + child.getLid());

                    if (chDiv.length == 0) {
                        chDiv = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        chDiv.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                        chDiv.css({width: "100%", height: "100%"});
                        chDiv.on("genetix:childPropChanged", function(event, data) {
                            vSet.handleChildChanged(component, event, data);
                            return false;
                        });
                        targetCont.append(chDiv);
                        (function (ch) {
                            component.getControlMgr().run(() => {
                                ch._isRendered(false);
                            });
                        })(child);
                    } else
                        targetCont.append(chDiv);

                } else {
                    var children = layout.getCol('Layouts');
                    for (var i = 0; i < children.count(); i++) {
                        var child = children.get(i);
                        this._switchLayout(component, child, rootLayout);
                    }
                }

                this._handleLayoutContentResized(component, layout);
            }

            _handleResize(component, layout) {
                if (!layout) return;
                //var p = '#ch_' + layout.getLid();
                //$(p).css("height", "");
                //$(p).css("height", $(p).parent().height());
                //var pp = $(p).find("[data-id='mid_" + layout.getLid() + "']");
                //pp.css("height", "");
                //pp.css("height", $(p).height());

                var children = layout.getCol("Layouts");
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    this._handleResize(component, child);
                }
            }

            _getCurrentLayout(component) {
                var minSizes = this._getRootsByMinSize(component);
                var result = null;
                var item = $('#' + component.getLid());
                var currWidth = item.width();
                for(var i=0; i<minSizes.length;i++) {
                    if (!minSizes[i]) continue;
                    var child = minSizes[i];
                    if (currWidth < +child.maxTargetWidth() || !child.maxTargetWidth()) {
                        result = child;
                        break;
                    }
                }
                return result;
            }

            _getRootsByMinSize(component) {
                var col = component.getCol("Layouts");
                var lCount = col.count();
                var minSizes = [];
                var undefL = null;
                for(var i = 0; i < lCount; i++) {
                    var l = col.get(i);
                    if (l.maxTargetWidth() == null || l.maxTargetWidth() === undefined)
                        undefL = l;
                    else
                        minSizes[l.maxTargetWidth()] = l;
                }
                if (undefL) {
                    minSizes[minSizes.length + 1000] = undefL;
                }

                return minSizes;

            }

            _renderLayout(component, layout, isCurrent, rootLayout) {
                var vSet = this;
                var item = $("#" + layout.getLid());
                var pItem = null;
                if (item.length == 0) {
                    var template = "vContainer";
                    if (layout.direction() == "horizontal") template = "hContainer";
                    else if (layout.direction() == "layer") template = "lContainer";
                    pItem = $(this._templates[template]).attr('data-id', "mid_" + layout.getLid());
                    item = pItem.children(".control").attr('id', layout.getLid());
                    item.attr("data-debug", layout.resElemName())
                    $("#ch_" + layout.getLid()).append(pItem);
                }

                this._setLayoutCSS(component, layout);

                var cont = item.children(".c-content");
                var children = layout.getCol('Layouts');
                child = layout.control();
                if (child) {
                    cont.attr("id", "cont_" + rootLayout.getLid() + "_" + child.getLid());
                }

                if (child && isCurrent) {
                    var div = $('#ext_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                        div.css({width: "100%", height: "100%"});
                        cont.append(div);
                        div.on("genetix:childPropChanged", function(event, data) {
                            vSet.handleChildChanged(component, event, data);
                            return false;
                        });
                    }
                } else if (!child) {
                    for (var i = 0; i < children.count(); i++) {
                        var child = children.get(i);
                        var div = $('#lay_' + child.getLid());
                        if (div.length == 0) {
                            div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>')
                                .attr({'id': 'lay_' + child.getLid(), 'data-debug': child.resElemName()});
                            div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                            cont.append(div);
                            if (layout.direction() == "layer") {
                                div.css({"width": "100%", "height": "100%"});
                            }
                        }
                        this._renderLayout(component, child, isCurrent, rootLayout)
                    }
                }

                if (layout.direction() == "layer") {
                    this._setVisibleTab(component, layout);
                    setTimeout(function() {
                        var tabNum = layout.tabNumber() || 0;
                        var children = layout.getCol('Layouts');
                        if (children.get(tabNum))
                            vSet._handleLayoutContentResized(component, children.get(tabNum));
                        $(window).trigger("genetix:triggerResize");
                    }, 100);
                }
            }

            _setVisibleTab(component, layout) {
                if (layout.direction() != "layer") return;

                var tabNum = layout.tabNumber() || 0;
                var children = layout.getCol('Layouts');
                for(var i=0; i<children.count();i++) {
                    var child = children.get(i);
                    if (!child.direction) continue;
                    var div = $('#lay_'+child.getLid());
                    if (i == tabNum)
                        div.show();
                    else
                        div.hide();
                }
            }

            _handleLayoutContentResized(component, layout) {
                var height = layout.height() || "auto";
                if (height == "auto") {
                    var chDiv = $("#ch_" + layout.getLid());
                    chDiv.find("[data-id='mid_" + layout.getLid() + "']").css("height", "");
                    chDiv.css("height", "");
                    var cont = $("#" + layout.getLid()).children();
                    cont.css("height", "auto");
                    var h = 0;
                    cont.children().each(function() {
                        h += ($(this).css("display") == "none" ? 0 : $(this).height());
                    });
                    cont.css("height", "");
                    $("#lay_" + layout.getLid()).css({"height": h, "min-height": h});

                    var parent = layout.getParentComp();
                    if (parent.className == "Layout") {
                        this._handleLayoutContentResized(component, parent);
                    }
                }
            }

            _setLayoutCSS(component, child) {
                var parent = child.getParentComp();
                var div = $("#lay_" + child.getLid());
                var chDiv = div.children();

                if (!parent.direction || parent.direction() == "layer") {
                    div.css({width: "100%", height: "100%"});
                    if (parent.direction && parent.direction() == "layer") {
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
                } else {
                    var dimName = parent.direction() == "horizontal" ? "width" :
                        (parent.direction() == "vertical" ? "height" : "");
                    var dim = child[dimName]() || "auto";
                    var flex = "none";
                    if (dim != "auto") {
                        if ($.isNumeric(dim) || (dim && dim.indexOf("px") >= 0)) {
                            dim = +(String(dim).replace("px", ""));
                            var fSize = +(div.css("font-size").replace("px", ""));
                            dim = (dim/fSize) + "em";
                        } else if (dim.length > 0 && dim[dim.length - 1] == "%") {
                            var perc = dim.replace("%", "");
                            dim = "auto";
                            flex = perc + " 0 auto";
                        }
                        div.css(dimName, dim);
                        div.css("min-"+dimName, (flex == "" ? dim : "0px"));
                    } else {
                        var chEDiv = $("#" + child.getLid());
                        div.css("min-"+dimName, chEDiv.height());
                        div.css(dimName, chEDiv.height());
                    }
                    div.css({
                        "flex": flex,
                        "-webkit-flex": flex,
                        "-ms-flex": flex
                    });
                }

            }

            /**
             * Оповещение парента об изменениях пропертей
             * @private
             */
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
                console.log(event);
                if (!("Height" in data.properties)) return;
                var child = data.control;
                var div = $(event.target);
                var height = child.height() || "auto";
                var flex = "";
                if (height != "auto") {
                    if ($.isNumeric(height))
                        height += "px";
                    else if (height.length > 0 && height[height.length - 1] == "%") {
                        var perc = height.replace("%", "");
                        //height = "auto";
                        flex = perc + " 0 " + height;
                    }
                    div.css({
                        "height": height,
                        "flex": flex,
                        "-webkit-flex": flex,
                        "-ms-flex": flex,
                        "min-height": 0
                    });
                } else {
                    var chEDiv = $("#" + child.getLid());
                    div.css({
                        "min-height" : chEDiv.height(),
                        "height": chEDiv.height()
                    });
                    div.css({
                        "flex": flex,
                        "-webkit-flex": flex,
                        "-ms-flex": flex
                    });
                }

                var currLayout = this._getCurrentLayout(component);
                var layout = component._getLayoutByControl(currLayout, child.getGuid());
                this._handleLayoutContentResized(component, layout);
            }
        }

        return vAdaptiveContainer;
    }
);