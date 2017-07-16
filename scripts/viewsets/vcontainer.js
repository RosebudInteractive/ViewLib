define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/container.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vContainer = {};
        for (var i in Base)
            vContainer[i] = Base[i];
        vContainer._templates = template.parseTemplate(tpl);
        vContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control");
                item.attr('id', this.getLid());
                var cont = item.children(".c-content");
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;

                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    div.css({position: "absolute"});
                    if (child.width())
                        div.css({width: child.width()});
                    if (child.height())
                        div.css({height: child.height()});

                    if ("position" in child && child.position() == "center") {
                        div.css({
                            margin: "0",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            "box-shadow": "1px 1px 0.75em 1px #3c4251",
                            "-webkit-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                            "-moz-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                            "border-radius": "0.25em"
                        });

                    } else {
                        if (child.left())
                            div.css({left: this.left()});
                        if (child.top())
                            div.css({top: this.top()});
                        if (!(child.left()) && !(child.top()) && !(child.width()) && !(child.height()))
                            div.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: cont.height() + 'px'});
                    }

                    cont.append(div);
                }

                $(parent).append(pItem);


            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

            vContainer._setVisible.call(this);
            vContainer._genEventsForParent.call(this);
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
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }
        return vContainer;
    }
);