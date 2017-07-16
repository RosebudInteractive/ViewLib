define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/form.html', 'text!./templates/genetix.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, tplMain, Base) {
        var vForm = {};
        for (var i in Base)
            vForm[i] = Base[i];
        vForm._templates = template.parseTemplate(tpl);
        vForm._mainTemplates = template.parseTemplate(tplMain);
        vForm.render = function(options) {
            var that = this;
            var isMain = this.getParentComp() == null && options.rootContainer != "#testDiv";
            var item = $('#' + this.getLid());

            var mItem = $("[data-id=mid_" + this.getLid() + "]");
            if (mItem.length == 0) {
                var pItem = null;
                var parent = null;
                if (isMain) {
                    pItem = $(vForm._mainTemplates['form']).attr('data-id', "mid_" + this.getLid());
                    parent = "#mainContent";
                } else {
                    pItem = $(vForm._templates['form']).attr('data-id', "mid_" + this.getLid());
                    parent = options.rootContainer == "#testDiv" ? parent = "#root-form-container" : '#ch_' + this.getParentComp().getLid();
                }

                var p = $(parent);
                p.append(pItem);

                if (!isMain) {
                    item = pItem.children(".control").attr('id', this.getLid());
                    item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});

                }
            }

            if (!isMain) {
                var cont = item.children(".c-content");
                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_'+child.getLid());
                    if (div.length == 0) {
                        div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                        div.children().attr('id', 'ch_' + child.getLid());
                        cont.append(div);
                        div.on("genetix:childPropChanged", function(event, data) {
                            vForm.handleChildChanged.call(that, event, data);
                        });
                    }
                    var width=child.width(), height=child.height();

                    if ("position" in child && child.position() == "center") {
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

                // убираем удаленные объекты
                // TODO восстановить убийство верстки удаленных объектов
                //var del = this.getLogCol('Children').del;
                //for (var guid in del)
                //    $('#ext_' + del[guid].getLid()).remove();

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
            } else {
                vForm.setSystemToolbarEvents.call(this);
                console.log(this);
            }
        }

        vForm.setSystemToolbarEvents = function () {
            $("#documents-menu-item").click(function () {
                //'test form 1',
                $("root-form-container").empty();
                uccelloClt.addServerContext('1515779e-070b-4239-a3ec-a86878678468');
            });
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

        }
        return vForm;
    }
);