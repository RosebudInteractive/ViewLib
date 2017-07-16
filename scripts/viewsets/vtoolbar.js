/**
 * User: kiknadze
 * Date: 13.08.2015
 * Time: 8:32
 */
define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/toolbar.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vToolbar = {};
        for (var i in Base)
            vToolbar[i] = Base[i];
        vToolbar._templates = template.parseTemplate(tpl);

        vToolbar.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vToolbar._templates['toolbar']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                pItem.height($(parent).height());
                $(window).on("genetix:resize", function () {
                    vToolbar._handleResize.call(that);
                });
                vToolbar._renderPopup.call(this);
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            var tStyle = this.toolbarSize() || "big";
            tStyle = tStyle.toUpperCase();

            if (tStyle  == "BIG") {
                item.addClass("is-big");
                item.removeClass("is-small");
            } else {
                item.removeClass("is-big");
                item.addClass("is-small");
            }
            var tColor = this.toolbarColor() || "blue";
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
            if (this.spacing()) {
                space = this.spacing();
                if ($.isNumeric(space))
                    space += "px";
            }
            cont.css({"padding-left": space, "padding-right": space});
            //dots.css({"padding-right" : space});

            var contAlign = this.contentAlign() || "left";
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

            var tCaptionStyle = this.captionStyle() || "none";
            tCaptionStyle = tCaptionStyle.toUpperCase();
            var elWrapper = cont.children(".c-caption-wrapper");
            elWrapper.css("padding-right", space);
            if (tCaptionStyle == "NONE") {
                elWrapper.css("display", "none");
            } else {
                var imgWrapper = elWrapper.find(".t-caption-icon-wrapper");
                imgWrapper.empty();
                if (this.image()) {
                    var imgTmpl = vToolbar._templates['svg'];
                    imgTmpl = imgTmpl.replace("###IMAGE###", this.image());
                    var tStyle = this.toolbarSize() || "big";
                    tStyle = tStyle.toUpperCase();
                    var imgSize = "16";
                    if (tStyle  == "BIG") imgSize = "22";
                    while (imgTmpl.indexOf("###SIZE###") != -1)
                        imgTmpl = imgTmpl.replace("###SIZE###", imgSize);
                    imgWrapper.append($(imgTmpl));
                }
                elWrapper.find(".t-caption-text").text(this.caption());

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
            var children = this.getCol('Children');
            var minIdx = 0;
            var maxIdx = children.count() - 1;
            if (contAlign == "RIGHT") {
                minIdx = maxIdx;
                maxIdx = 0;
            }
            var i = minIdx;
            for(var j=0; j < children.count(); j++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vToolbar.handleChildChanged.call(that, event, data);
                        return false;
                    });
                    div.on("genetix:pressedChanged", function(event, data) {
                        var btn = data.control;
                        vToolbar._setChildPressed.call(that, btn);

                        var bKind = btn.buttonKind() || "normal";
                        bKind = bKind.toUpperCase();

                        if (bKind == "RADIO" && btn.tabNumber() !== undefined && that.layersContainer()) {
                            var lc = that.layersContainer();
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
                vToolbar._setChildCSS(child);

                if (contAlign == "RIGHT") i--;
                else i++;
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            vToolbar._setVisible.call(this);
            vToolbar._genEventsForParent.call(this);
            vToolbar._handleResize.call(this);
        }

        vToolbar._handleResize = function() {
            var item = $('#' + this.getLid());
            var dots = item.children(".c-content").children(".c-toolbar-dots");
            var cont = item.children(".c-content");
            var space = "";
            if (this.spacing()) {
                space = this.spacing();
                if ($.isNumeric(space))
                    space += "px";
            }
            cont.css({"padding-left": space, "padding-right": space});
            //dots.css({"padding-right" : space});
            dots.hide();
            vToolbar._restoreVisibility.call(this);
            var hasHiddenItems = vToolbar._hasHiddenItems.call(this);

            if (hasHiddenItems) {
                dots.show();
                //var padVal = dots.outerWidth();
                //var cssObj = {};
                //var alParam = "padding-right";
                //cssObj[alParam] = padVal;
                //cont.css(cssObj);
                vToolbar._correctHiddenItems.call(this);
            }
        }

        vToolbar._restoreVisibility = function() {
            var children = this.getCol('Children');
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                var chDiv = $('#ext_'+child.getLid());
                chDiv.css("display", "");
            }
        }

        vToolbar._correctHiddenItems = function() {
            var contAlign = this.contentAlign() || "left";
            contAlign = contAlign.toUpperCase();
            var hasHiddenItems = vToolbar._hasHiddenItems.call(this);
            if (!hasHiddenItems) return;
            vToolbar._restoreVisibility.call(this);
            var hiddenItems = vToolbar._getHiddenItems.call(this);
            var children = this.getCol('Children');
            if (contAlign != "LEFT") {
                var j = children.count() - 1;
                for (var i = 0; i < hiddenItems.length; i++) {
                    var child = this.getControlMgr().get(children.get(j).getGuid());
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
            var item = $('#' + this.getLid());
            var cont = item.children(".c-content")
            var height = cont.height();
            var dots = cont.children(".c-toolbar-dots");
            var pos = dots.position();
            // Если не поместилось троеточие, скроем еще одну кнопку
            if (pos && height <= pos.top) {
                for (var i = children.count() - 1; i >= 0 ; i--) {
                    var child = this.getControlMgr().get(children.get(i).getGuid());
                    var chDiv = $('#ext_' + child.getLid());
                    if (chDiv.css("display") != "none") {
                        chDiv.css("display", "none");
                        break;
                    }
                }
            }
        }

        vToolbar._hasHiddenItems = function() {
            var hiddenItems = vToolbar._getHiddenItems.call(this);
            return (hiddenItems.length > 0);
        };

        vToolbar._getHiddenItems = function() {
            var hiddenChildren = [];
            var item = $('#' + this.getLid());
            var cont = item.children(".c-content");
            var children = this.getCol('Children');
            var height = cont.height();
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                var chDiv = $('#ext_'+child.getLid());
                var pos = chDiv.position();
                if (!pos || height <= pos.top || chDiv.css("display") == "none")
                    hiddenChildren.push(child);
            }

            return hiddenChildren;
        }

        vToolbar._setChildCSS = function(child) {
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
        vToolbar._genEventsForParent = function() {
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
            if (this.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

            if (genEvent) {
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vToolbar.handleChildChanged = function(event, data) {
            if (!("Height" in data.properties) && !("Pressed" in data.properties)) return;

            var child = data.control;
            if ("Height" in data.properties)
                vToolbar._setChildCSS.call(this, child);
        }

        vToolbar._setChildPressed = function(changedChild) {
            var bKind = changedChild.buttonKind() || "normal";
            bKind = bKind.toUpperCase();
            if (bKind != "RADIO") return;

            var children = this.getCol('Children');
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                if (!child.buttonKind) continue;
                bKind = child.buttonKind() || "normal";
                bKind = bKind.toUpperCase();
                if (bKind != "RADIO") continue;
                if (child.getLid() == changedChild.getLid()) continue;
                child.pressed(false);
            }

        }

        vToolbar._renderPopup = function() {
            var that = this;
            var item = $('#' + this.getLid());
            var dots = item.children(".c-content").children(".c-toolbar-dots");

            var tStyle = this.toolbarSize() || "big";
            tStyle = tStyle.toUpperCase();

            var popupDiv = $("<div></div>");
            $("body").append(popupDiv);
            this._popupDiv = popupDiv.genetixPopup({
                buttonControl: dots,
                leftIcons: true,
                rightIcons: false,
                leftViewBoxSize: 16,
                offsetX: -5,
                offsetY: (tStyle == "BIG" ? -20 : -10),
                bigArrowInterval: false
            });


            dots.click(function () {
                var popupData = vToolbar._preparePopupData.call(that);
                that._popupDiv.genetixPopup("show", popupData);
            });

        }

        vToolbar._preparePopupData = function() {
            var hiddenChildren = vToolbar._getHiddenItems.call(this);
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

        return vToolbar;
    });
