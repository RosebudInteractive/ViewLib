define(
    ['text!./templates/vContainer.html', '/scripts/viewsets/v-vContainer.js'],
    function(tpl, VVContainer) {
        const vGenVContainer = class vGenVContainer extends VVContainer {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var that = component;
                var vSet = this;

                var pItem = $(this._templates['container']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                var c = item.children(".c-content");
                var scrollPos = null;
                var scrollRemembered = false;

                component._onGenetixInitResize = (function (c, component) {
                    return function () {
                        if (!scrollRemembered) {
                            scrollPos = c.scrollTop();
                            c.css("overflow", "none");
                        }
                    }
                })(c, component);

                $(window).on("genetix:initResize", component._onGenetixInitResize);

                this._bindScrollingHeader(component);

                return pItem;
            }

            initItem(pItem, component) {
                var vSet = this;
                var item = $("#" + component.getLid())
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

                var cont = item.children(".c-content");
                cont.css({"background-color" : (component.background() ? component.background() : "") });

                if ("isCentered" in component.getParentComp() && component.getParentComp().isCentered())
                    cont.css({"border-radius" : "0.25em"});

                if (component.getParentComp() && !component.getParentComp().getParentComp()) {
                    if (!(component.getParentComp().isCentered) ||
                        component.getParentComp().isCentered() === undefined ||
                        !component.getParentComp().isCentered())
                        cont.css("padding", "0");
                    item.addClass("m-container")
                } else if (!component.hasPadding()) {
                    cont.css("padding", "0");
                }

                if (component.height() == "auto")
                    item.css({height: "auto"});

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
                    }

                    this._setChildCSS(child);
                }

                // убираем удаленные объекты
                var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                for (var guid in del)
                    $('#ext_' + del[guid].getLid()).remove();

                this._setVisible(component);
                this._genEventsForParent(component);
            }

            _bindScrollingHeader(component) {
                var item = $('#' + component.getLid());
                var cont = item.children(".c-content");

                var t, l = (new Date()).getTime();
                item.children(".scroll-header").hide();

                cont.scroll(function(){
                    var now = (new Date()).getTime();

                    if(now - l > 400){
                        $(this).trigger('scrollStart');
                        l = now;
                    }

                    clearTimeout(t);
                    t = setTimeout(function(){
                        console.log("setTimeout vcontainer 1");
                        cont.trigger('scrollEnd');
                    }, 300);
                });

                cont.bind('scrollStart', function(){
                    console.log('scrollStart');
                    item.children(".scroll-header").show();
                    return false;
                });

                cont.bind('scrollEnd', function(){
                    console.log('scrollEnd');
                    item.children(".scroll-header").hide();
                    return false;
                });
            }

            _setChildCSS(child) {
                var div = $("#ext_" + child.getLid());
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
                    setTimeout(function() {
                        div.css({width: "100%"});
                    }, 0);
                    var height = child.height() || "auto";
                    var flex = "none";
                    if (height != "auto") {
                        if ($.isNumeric(height) || (height && height.indexOf("px") >= 0)) {
                            height = +(String(height).replace("px", ""));
                            var fSize = +(div.css("font-size").replace("px", ""));
                            height = (height/fSize) + "em";
                            //height += "px";
                        } else if (height.length > 0 && height[height.length - 1] == "%") {
                            var perc = height.replace("%", "");
                            height = "auto";
                            flex = perc + " 0 auto";
                        }
                        div.css({
                            "height": height,
                            "min-height": (flex == "" ? height : "0px")
                        });
                    } else {
                        var chEDiv = $("#" + child.getLid());
                        div.css({
                            "min-height" : chEDiv.height(),
                            "height": chEDiv.height()
                        });
                    }
                    div.css({
                        "flex": flex,
                        "-webkit-flex": flex,
                        "-ms-flex": flex
                    });
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

            }

            _refreshScroll(component) {
                /*if (component._iscroll) {
                 component._iscroll.destroy();
                 component._iscroll = null;
                 }
                 var children = component.getCol('Children');
                 if (children.count() == 0) return;

                 var parentDivSel = "#" + component.getLid();
                 parentDivSel = $(parentDivSel).children()[0];
                 var _iscroll = new IScroll(parentDivSel, {
                 snapStepY: 23,
                 scrollX: false,
                 scrollY: true,
                 bottomPadding: 0,
                 topPadding: 0,
                 resize: true,
                 scrollbars: true,
                 mouseWheel: true,
                 disableMouse: true,
                 interactiveScrollbars: true,
                 keyBindings: false,
                 click: true,
                 probeType: 3,
                 rightPadding: 0
                 });
                 //_iscroll.on('scroll', function () {
                 //    //gr.data("grid").updatePosition(component.y);
                 //    if (component._grid)
                 //        component._grid.grid("updatePosition", component.y);
                 //});
                 _iscroll.on('scrollStart', function() {
                 $(component.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: 1});
                 });
                 _iscroll.on('scrollEnd', function() {
                 $(component.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: ""});
                 });
                 component._iscroll = _iscroll;    */
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
                if ("Height" in data.properties) {
                    this._setChildCSS(child);
                }

                if ("Visible" in data.properties || "Width" in data.properties) {
                    $(window).trigger("genetix:triggerResize");
                }

            }
        }

        return vGenVContainer;
    }
);
