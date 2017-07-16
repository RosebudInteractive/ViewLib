define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/cContainer.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vCContainer = {};
        for (var i in Base)
            vCContainer[i] = Base[i];
        vCContainer._templates = template.parseTemplate(tpl);
        vCContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var pItem = $(vCContainer._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control");
                item.attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
            }

            var cont = item.children(".c-content");
            // создаем врапперы для чайлдов
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    var div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    cont.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vCContainer.handleChildChanged.call(that, event, data);
                    });
                }
                var left=child.left(), top=child.top(), width=child.width(), height=child.height();
                if ($.isNumeric(left)) left += 'px';
                if ($.isNumeric(top)) top += 'px';
                if ($.isNumeric(width)) width += 'px';
                if ($.isNumeric(height)) height += 'px';
                div.css({top:top, left:left, width:width, height:height, position: "absolute"});
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
                var childs = that.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = that.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_' + child.getLid());
                    div.children().css("height", div.height());
                }
            });

            vCContainer._setVisible.call(this);
            vCContainer._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vCContainer._genEventsForParent = function() {
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

        vCContainer.handleChildChanged = function(event, data) {
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

        return vCContainer;
    }
);