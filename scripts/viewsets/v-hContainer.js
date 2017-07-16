define(
    ['text!./templates/hContainer.html', '/scripts/viewsets/v-container.js'],
    function(tpl, VContainer) {
        const vHContainer = class vHContainer extends VContainer {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var pItem = $(this._templates['container']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                // добавляем в парент
                var parent = component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer;
                //pItem.height($(parent).height());

                return pItem;
            }

            initItem(pItem, component) {
                var vSet = this;
                var item = $("#" + component.getLid());
                var that = component;

                if (component.separateChildren())
                    item.addClass("separate-children");
                else
                    item.removeClass("separate-children");

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
                // создаем врапперы для чайлдов
                var childs = component.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = component.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                        div.on("genetix:childPropChanged", function(event, data) {
                            vSet.handleChildChanged(component, event, data);
                            return false;
                        });
                        cont.append(div);

                        if (child.minWidth()) {
                            var u = "em";
                            var h = 0;
                            if ($.isNumeric(child.minWidth()))
                                h = child.minWidth();
                            else {
                                h = child.minWidth();
                                h = h.substr(0, h.length - 2);
                                u = h.substr(h.length - 2, 2);
                            }
                            div.genetixFlexMinDimention({
                                minSize: h,
                                sizeUnits: u,
                                dimension: 1
                            });
                        }
                    }
                    var width=child.width() || "auto";
                    var flex = "none";
                    if (width != "auto") {
                        if ($.isNumeric(width) || (width && width.indexOf("px") >= 0)) {
                            width = +(String(width).replace("px", ""));
                            var fSize = +(div.css("font-size").replace("px", ""));
                            width = (width/fSize) + "em";
                            div.css({width: width});
                        }
                        else if (width.length > 0 && width[width.length - 1] == "%") {
                            var perc = width.replace("%", "");
                            flex = perc + " 0 " + width;
                        }
                    }
                    div.css({flex: flex,  '-webkit-flex': flex, '-ms-flex': flex});

                    var chDiv = div.children();
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
                    if (child.minHeight())
                        div.css("min-height", child.minHeight());
                    else
                        div.css("min-height", "");

                    if (child.verticalAlign()) {
                        var vAl = child.verticalAlign().toUpperCase();
                        if (vAl == "CENTER") {
                            chDiv.css("float", "");
                            chDiv.css("display", "table");
                        }
                    }
                }

                // убираем удаленные объекты
                var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                for (var guid in del)
                    $('#ext_' + del[guid].getLid()).remove();

                this._setVisible(component);
                this._genEventsForParent(component);
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
                var child = data.control;
                if ("Width" in data.properties) {
                    var div = $(event.target);
                    var width = child.width() || "auto";
                    var flex = "none";
                    if (width != "auto") {
                        if ($.isNumeric(width))
                            width += "px";
                        else if (width.length > 0 && width[width.length - 1] == "%") {
                            var perc = width.replace("%", "");
                            width = "auto";
                            flex = perc + " 0 auto";
                        }
                    }
                    div.css({
                        "width": width,
                        "flex": flex,
                        "-webkit-flex": flex,
                        "-ms-flex": flex,
                        "min-width": 0
                    });
                }

                if ("Visible" in data.properties || "Width" in data.properties) {
                    var children = component.getCol('Children');
                    for(var i=0; i<children.count();i++) {
                        var ch= component.getControlMgr().get(children.get(i).getGuid());
                        if (!ch.left) continue;
                        var div = $('#ext_' + ch.getLid());
                        if (ch.getLid() == child.getLid()) continue;
                        $(window).trigger("genetix:triggerResize");
                    }
                }

            }


        }

        return vHContainer;
    }
);