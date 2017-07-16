define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/form.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vForm = {};
        for (var i in Base)
            vForm[i] = Base[i];
        vForm._templates = template.parseTemplate(tpl);
        vForm.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vForm._templates['form']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                var parent = (this.getParentComp()? '#ch_' + this.getParentComp().getLid(): options.rootContainer);
                var p = $(parent);
                p.append(pItem);

                //item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});
                //$(window).resize(function (e, obj) {
                //    item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});
                //});
            }

            var cont = item.children(".c-content");
            // ������� �������� ��� �������
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_'+child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vForm.handleChildChanged.call(that, event, data);
                        return false;
                    });
                }
                var width=child.width(), height=child.height();

                if (this.isCentered()) {
                    item.addClass("is-centered");
                    div.css({
                        margin: "0",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        /*"box-shadow": "1px 1px 0.75em 1px #3c4251",
                         "-webkit-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                         "-moz-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                         "border-radius": "0.25em",*/
                        "width": width,
                        "height": height
                    });

                } else {
                    div.css({width: "100%"});
                    var height = child.height() || "auto";
                    var flex = "";
                    if (height != "auto") {
                        if ($.isNumeric(height))
                            height += "px";
                        else if (height.length > 0 && height[height.length - 1] == "%") {
                            if (childs.count() == 1) {
                                height = "100%";
                            } else {
                                var perc = height.replace("%", "");
                                height = "auto";
                                flex = perc + " 0 auto";
                            }
                        }
                    }
                    div.css({"height": height, "flex": flex, "-webkit-flex": flex, "-ms-flex": flex, "min-height": 0});
                }
            }

            // ������� ��������� �������
            //var del = this.getObj().getLogCol('Children').del;
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
                var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
                var pp = $("#mid_" + that.getLid());
                pp.height($(p).height());
                var childs = that.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = that.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_' + child.getLid());
                    div.children().css("height", div.height());
                }
            });
            vForm._setVisible.call(this);
            vForm._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vForm._genEventsForParent = function() {
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

        vForm.handleChildChanged = function(event, data) {
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
            }
            div.css({
                "height": height,
                "flex": flex,
                "-webkit-flex": flex,
                "-ms-flex": flex,
                "min-height": 0
            });

        };

        return vForm;
    }
);