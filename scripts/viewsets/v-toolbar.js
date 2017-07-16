define(
    ['text!./templates/toolbar.html', '/scripts/viewsets/v-base.js', "/scripts/jquery_replace.js"],
    function(tpl, ViewBase, JQueryUtils) {
        var jReplace = new JQueryUtils();

        const vToolbar = class vToolbar extends ViewBase {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var vSet = this;
                var pItem = $(this._templates['toolbar']).attr('data-id', "mid_" + component.getLid());
                pItem.children(".control").attr('id', component.getLid());

                // добавляем в парент
                var parent = component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer;
                pItem.height($(parent).height());
                component._onGenetixResize = function () {
                    vSet._handleResize(component);
                }
                $(window).on("genetix:resize", component._onGenetixResize);
                component._popupDiv = null;

                return pItem;
            }

            initItem(pItem, component) {
                this._renderPopup(component);
                var vSet = this;
                var item = $("#" + component.getLid());

                var tStyle = component.toolbarSize() || "big";
                tStyle = tStyle.toUpperCase();

                if (tStyle  == "BIG") {
                    item.addClass("is-big");
                    item.removeClass("is-small");
                } else {
                    item.removeClass("is-big");
                    item.addClass("is-small");
                }
                var tColor = component.toolbarColor() || "blue";
                tColor = tColor.toUpperCase();
                if (tColor  == "BLUE") {
                    item.addClass("is-blue");
                    item.removeClass("is-white");
                } else {
                    item.removeClass("is-blue");
                    item.addClass("is-white");
                }

                var cont = item.children(".c-content");
                var dots = item.children(".c-content").children(".c-toolbar-dots");
                var space = "";
                if (component.spacing()) {
                    space = component.spacing();
                    if ($.isNumeric(space))
                        space += "px";
                }
                cont.css({"padding-left": space, "padding-right": space});
                //dots.css({"padding-right" : space});

                var contAlign = component.contentAlign() || "left";
                contAlign = contAlign.toUpperCase();
                if (contAlign == "LEFT") {
                    item.addClass("is-left");
                    item.removeClass("is-right");
                    dots.css("float", "left");
                } else {
                    item.removeClass("is-left");
                    item.addClass("is-right");
                    dots.css("float", "right");
                }

                var tCaptionStyle = component.captionStyle() || "none";
                tCaptionStyle = tCaptionStyle.toUpperCase();
                var elWrapper = cont.children(".c-caption-wrapper");
                elWrapper.css("padding-right", space);
                if (tCaptionStyle == "NONE") {
                    elWrapper.css("display", "none");
                } else {
                    var imgWrapper = elWrapper.find(".t-caption-icon-wrapper");
                    imgWrapper.empty();
                    if (component.image()) {
                        var imgTmpl = this._templates['svg'];
                        imgTmpl = imgTmpl.replace("###IMAGE###", component.image());
                        var tStyle = component.toolbarSize() || "big";
                        tStyle = tStyle.toUpperCase();
                        var imgSize = "16";
                        if (tStyle  == "BIG") imgSize = "22";
                        while (imgTmpl.indexOf("###SIZE###") != -1)
                            imgTmpl = imgTmpl.replace("###SIZE###", imgSize);
                        imgWrapper.append($(imgTmpl));
                    }
                    elWrapper.find(".t-caption-text").text(component.caption());

                    cont.children(".c-caption-wrapper").css("display", "");
                    if (tCaptionStyle == "TEXT") {
                        elWrapper.find(".t-caption-icon-wrapper").css("display", "none");
                        elWrapper.find(".t-caption-title-wrapper").css("display", "");
                    } else if (tCaptionStyle == "IMAGE") {
                        elWrapper.find(".t-caption-icon-wrapper").css("display", "");
                        elWrapper.find(".t-caption-title-wrapper").css("display", "none");
                    } else {
                        elWrapper.find(".t-caption-icon-wrapper").css("display", "");
                        elWrapper.find(".t-caption-title-wrapper").css("display", "");
                    }


                }

                // создаем врапперы для чайлдов
                var children = component.getCol('Children');
                var minIdx = 0;
                var maxIdx = children.count() - 1;
                if (contAlign == "RIGHT") {
                    minIdx = maxIdx;
                    maxIdx = 0;
                }
                var i = minIdx;
                for(var j=0; j < children.count(); j++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        div.children().attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                        div.on("genetix:childPropChanged", function(event, data) {
                            this.handleChildChanged(component, event, data);
                            return false;
                        });
                        div.on("genetix:pressedChanged", function(event, data) {
                            var btn = data.control;
                            vSet._setChildPressed(component, btn);

                            var bKind = btn.buttonKind() || "normal";
                            bKind = bKind.toUpperCase();

                            if (bKind == "RADIO" && btn.tabNumber() !== undefined && component.layersContainer()) {
                                var lc = component.layersContainer();
                                console.log("Layers set tab number");
                                lc.tabNumber(btn.tabNumber());
                                //lc._isRendered(false);
                            }


                            return false;
                        });

                        //if (contAlign == "LEFT")
                        //    cont.children(".c-toolbar-dots").before(div);
                        //else
                        cont.append(div);

                    }
                    this._setChildCSS(child);

                    if (contAlign == "RIGHT") i--;
                    else i++;
                }

                // убираем удаленные объекты
                var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                for (var guid in del)
                    $('#ext_' + del[guid].getLid()).remove();

                this._setVisible(component);
                this._genEventsForParent(component);
                this._handleResize(component);
            }

            destroyUI(item, component) {
                $(window).off("genetix:resize", component._onGenetixResize);
            }

            _handleResize(component) {
                var start = new Date();
                var item = $('#' + component.getLid());
                var dots = item.children(".c-content").children(".c-toolbar-dots");
                var cont = item.children(".c-content");
                var space = "";
                if (component.spacing()) {
                    space = component.spacing();
                    if ($.isNumeric(space))
                        space += "px";
                }
                cont.css({"padding-left": space, "padding-right": space});
                //dots.css({"padding-right" : space});
                dots.hide();
                this._restoreVisibility(component);
                var hasHiddenItems = this._hasHiddenItems(component);

                if (hasHiddenItems) {
                    dots.show();
                    //var padVal = dots.outerWidth();
                    //var cssObj = {};
                    //var alParam = "padding-right";
                    //cssObj[alParam] = padVal;
                    //cont.css(cssObj);
                    this._correctHiddenItems(component);
                }

                var end = new Date();
                console.log("Toolbar resize:", end - start);
            }

            _restoreVisibility(component) {
                var children = component.getCol('Children');
                for(var i=0; i<children.count();i++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    var chDiv = $('#ext_'+child.getLid());
                    chDiv.css("display", "");
                }
            }

            _correctHiddenItems(component) {
                var contAlign = component.contentAlign() || "left";
                contAlign = contAlign.toUpperCase();
                var hasHiddenItems = this._hasHiddenItems(component);
                if (!hasHiddenItems) return;
                this._restoreVisibility(component);
                var hiddenItems = this._getHiddenItems(component);
                var children = component.getCol('Children');
                if (contAlign != "LEFT") {
                    var j = children.count() - 1;
                    for (var i = 0; i < hiddenItems.length; i++) {
                        var child = component.getControlMgr().get(children.get(j).getGuid());
                        var chDiv = $('#ext_' + child.getLid());
                        chDiv.css("display", "none");
                        j--;
                    }
                } else {
                    for (var i = 0 ; i < hiddenItems.length; i++) {
                        var child = hiddenItems[i]; //this.getControlMgr().get(children.get(i).getGuid());
                        var chDiv = $('#ext_' + child.getLid());
                        chDiv.css("display", "none");
                    }
                }
                var item = $('#' + component.getLid());
                var cont = item.children(".c-content")
                var height = cont.height();
                var dots = cont.children(".c-toolbar-dots");
                var pos = dots.position();
                // Если не поместилось троеточие, скроем еще одну кнопку
                if (pos && height <= pos.top) {
                    for (var i = children.count() - 1; i >= 0 ; i--) {
                        var child = component.getControlMgr().get(children.get(i).getGuid());
                        var chDiv = $('#ext_' + child.getLid());
                        if (chDiv.css("display") != "none") {
                            chDiv.css("display", "none");
                            break;
                        }
                    }
                }
            }

            _hasHiddenItems(component) {
                var hiddenItems = this._getHiddenItems(component);
                return (hiddenItems.length > 0);
            };

            _getHiddenItems(component) {
                var hiddenChildren = [];
                var item = $('#' + component.getLid());
                //var cont = item.children(".c-content");
                //var height = cont.height();
                var cont = jReplace.getFirstChild(item[0]);
                var height = jReplace.height(cont);

                var children = component.getCol('Children');
                for(var i=0; i<children.count();i++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    var chDiv = $('#ext_'+child.getLid());
                    var pos = chDiv.position();
                    //if (!pos || height <= pos.top || chDiv.css("display") == "none")
                    //    hiddenChildren.push(child);
                    if (!pos || height <= pos.top || jReplace.css(chDiv[0], "display") == "none")
                        hiddenChildren.push(child);
                }

                return hiddenChildren;
            }

            _setChildCSS(child) {
                var div = $("#ext_" + child.getLid())
                var width=child.width() || "auto";
                if ($.isNumeric(width))
                    width += "px";
                div.css({width: width});

                if (child.minWidth())
                    div.css("min-width", child.minWidth());
                else
                    div.css("min-width", "");
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
                if (!("Height" in data.properties) && !("Pressed" in data.properties)) return;

                var child = data.control;
                if ("Height" in data.properties)
                    this._setChildCSS(child);
            }

            _setChildPressed(component, changedChild) {
                var bKind = changedChild.buttonKind() || "normal";
                bKind = bKind.toUpperCase();
                if (bKind != "RADIO") return;

                var children = component.getCol('Children');
                for(var i=0; i<children.count();i++) {
                    var child = component.getControlMgr().get(children.get(i).getGuid());
                    if (!child.buttonKind) continue;
                    bKind = child.buttonKind() || "normal";
                    bKind = bKind.toUpperCase();
                    if (bKind != "RADIO") continue;
                    if (child.getLid() == changedChild.getLid()) continue;
                    child.pressed(false);
                }
            }

            _renderPopup(component) {
                if (component._popupDiv) return;
                var vSet = this;
                var item = $('#' + component.getLid());
                var dots = item.children(".c-content").children(".c-toolbar-dots");

                var tStyle = component.toolbarSize() || "big";
                tStyle = tStyle.toUpperCase();

                var popupDiv = $("<div></div>");
                $("body").append(popupDiv);
                component._popupDiv = popupDiv.genetixPopup({
                    buttonControl: dots,
                    leftIcons: true,
                    rightIcons: false,
                    leftViewBoxSize: 16,
                    offsetX: -5,
                    offsetY: (tStyle == "BIG" ? -20 : -10),
                    bigArrowInterval: false
                });


                dots.click(function () {
                    var popupData = vSet._preparePopupData(component);
                    component._popupDiv.genetixPopup("show", popupData);
                });
            }

            _preparePopupData(component) {
                var hiddenChildren = this._getHiddenItems(component);
                var popupData = [];

                for (var i = 0; i < hiddenChildren.length; i++) {
                    var child = hiddenChildren[i];
                    if (!child.left) continue;

                    if (!child.caption){
                        if (popupData.length != 0)
                            popupData.push({
                                type: "separator"
                            });
                    } else {
                        var cnt = {
                            id: ("tPopupId-" + child.getLid()),
                            title: child.caption(),
                            subTree: [],
                            leftIcon: (child.image() ? "/images/" + child.image() + "_16" : null)
                        };
                        popupData.push(cnt);
                    }
                }

                return popupData;
            }
        }

        return vToolbar;
    }
);