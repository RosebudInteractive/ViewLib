/**
 * User: kiknadze
 * Date: 27.08.2015
 * Time: 13:32
 */
define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/lContainer.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var lContainer = {};
        for (var i in Base)
            lContainer[i] = Base[i];
        lContainer._templates = template.parseTemplate(tpl);

        lContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(lContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                pItem.height($(parent).height());
                $(window).on("genetix:resize", function () {
                    lContainer._handleResize.call(that);
                });
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            var cont = item.children(".c-content");


            if (this.verticalAlign()) {
                pItem.css("display", "table-cell");
                var vAl = this.verticalAlign().toUpperCase();
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

            if ("isCentered" in this.getParentComp() && this.getParentComp().isCentered())
                cont.css({"border-radius" : "0.25em"});

            if (this.getParentComp() && !this.getParentComp().getParentComp()) {
                if (this.getParentComp().isCentered() === undefined || !this.getParentComp().isCentered())
                    cont.css("padding", "0");
                item.addClass("m-container")
            } else if (this.hasPadding && !this.hasPadding()) {
                cont.css("padding", "0");
            }

            var height = this.height() || "auto";
            if (this.height() == "auto")
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
            var children = this.getCol('Children');
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        lContainer.handleChildChanged.call(that, event, data);
                        return false;
                    });
                    cont.append(div);
                    div.css({"width": "100%", "height": "100%"});
                }
                lContainer._setChildCSS.call(this, child);
            }

            lContainer._setVisibleTab.call(this);

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            lContainer._setVisible.call(this);
            lContainer._genEventsForParent.call(this);
            setTimeout(function() {
                console.log("setTimeout layersContainer");
                lContainer._handleResize.call(that);
                $(window).trigger("genetix:resize");
            }, 100);
        }

        lContainer._setVisibleTab = function() {
            var tabNum = this.tabNumber() || 0;
            var children = this.getCol('Children');
            for(var i=0; i<children.count();i++) {
                var child = this.getControlMgr().get(children.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (i == tabNum)
                    div.show();
                else
                    div.hide();
            }
        }

        lContainer._handleResize = function() {
            var that = this;
            var pp = $("#mid_" + that.getLid());
            var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
            $(p).css("height", "auto");
            pp.css("height", "auto");
            var childs = that.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = that.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                lContainer._setChildCSS.call(this, child);
            }
            //$(p).css("height", $(p).parent().height());
            //pp.css("height", $(p).height());
        }

        lContainer._setChildCSS = function(child) {
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

            lContainer._setVisibleTab.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        lContainer._genEventsForParent = function() {
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

        lContainer.handleChildChanged = function(event, data) {
        }

        return lContainer;
    });
