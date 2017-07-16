define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/container.html',
        '/scripts/viewsets/vbase.js', "flex-min-dimension"],
    function(template, tpl, Base) {
        var vContainer = {};
        for (var i in Base)
            vContainer[i] = Base[i];
        vContainer._templates = template.parseTemplate(tpl);
        vContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            var pItem = null;
            if (item.length == 0) {
                var pItem = $(vContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                var c = item.children(".c-content");
                var scrollPos = null;
                var scrollRemembered = false;
                $(window).on("genetix:initResize", function() {
                    if (!scrollRemembered) {
                        scrollPos = c.scrollTop();
                        c.css("overflow", "none");
                    }
                });

                vContainer._bindScrollingHeader.call(this);

                $(window).on("genetix:resize", function () {
                    var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
                    $(p).css("height", "");
                    $(p).css("height", $(p).parent().height());
                    var pp = $("#mid_" + that.getLid());
                    pp.css("height", "");
                    pp.css("height", $(p).height());
                    var childs = that.getCol('Children');
                    for(var i=0; i<childs.count();i++) {
                        var child = that.getControlMgr().get(childs.get(i).getGuid());
                        if (!child.left) continue;
                        vContainer._setChildCSS.call(this, child);
                    }
                    vContainer._refreshScroll.call(that);
                    setTimeout(function () {
                        console.log("setTimeout vcontainer 1");
                        if (scrollPos != null) {
                            c.css("overflow", "");
                            c.scrollTop(scrollPos);
                        }
                        scrollRemembered = false;
                    }, 0);
                });

            } else {
                pItem = $("#mid_" + this.getLid());
            }

            if (this.separateChildren())
                item.addClass("separate-children");
            else
                item.removeClass("separate-children");

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
            cont.css({"background-color" : (this.background() ? this.background() : "") });

            if ("isCentered" in this.getParentComp() && this.getParentComp().isCentered())
                cont.css({"border-radius" : "0.25em"});

            if (this.getParentComp() && !this.getParentComp().getParentComp()) {
                if (this.getParentComp().isCentered() === undefined || !this.getParentComp().isCentered())
                    cont.css("padding", "0");
                item.addClass("m-container")
            } else if (!this.hasPadding()) {
                cont.css("padding", "0");
            }

            if (this.height() == "auto")
                item.css({height: "auto"});

            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vContainer.handleChildChanged.call(that, event, data);
                        return false;
                    });
                }

                vContainer._setChildCSS.call(this, child);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            vContainer._setVisible.call(this);
            vContainer._genEventsForParent.call(this);
        }

        vContainer._bindScrollingHeader = function() {
            var item = $('#' + this.getLid());
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

        vContainer._setChildCSS = function(child) {
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

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vContainer._genEventsForParent = function() {
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

        vContainer.handleChildChanged = function(event, data) {
            var child = data.control;
            if ("Height" in data.properties) {
                vContainer._setChildCSS.call(this, child);
            }

            if ("Visible" in data.properties || "Width" in data.properties) {
                $(window).trigger("genetix:resize");
            }

        }


        vContainer._refreshScroll = function() {
            /*if (this._iscroll) {
                this._iscroll.destroy();
                this._iscroll = null;
            }
            var children = this.getCol('Children');
            if (children.count() == 0) return;

            var parentDivSel = "#" + this.getLid();
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
            //    //gr.data("grid").updatePosition(this.y);
            //    if (this._grid)
            //        this._grid.grid("updatePosition", this.y);
            //});
            _iscroll.on('scrollStart', function() {
                $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: 1});
            });
            _iscroll.on('scrollEnd', function() {
                $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: ""});
            });
            this._iscroll = _iscroll;    */
        }
        return vContainer;
    }
);