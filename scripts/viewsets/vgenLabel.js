define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/label.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vLabel = {};
        for (var i in Base)
            vLabel[i] = Base[i];
        vLabel._templates = template.parseTemplate(tpl);
        vLabel.render = function(options) {
            var item = $('#' + this.getLid());
            var that = this;
            if (item.length == 0) {
                var pItem = $(vLabel._templates['label']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = (this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer);
                $(parent).append(pItem);
                item.click(function(){
                    if (that.tabStop() === undefined || that.tabStop())
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                }).focus(function() {
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function () {
                            that.setFocused();
                        });
                    }
                });
            } else {
                pItem = $("#mid_" + this.getLid());
            }

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

            if (this.tabStop() === undefined || this.tabStop())
                item.attr("tabIndex", "0");
            else
                item.attr("tabIndex", "");

            var currentControl = this.getForm().currentControl();
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                item.focus();

            if (this.horizontalAlign() && this.horizontalAlign().toUpperCase() == "LEFT")
                item.css({"text-align": "left"});
            else
                item.css({"text-align": "right"});

            item.css({width: "100%"/*, height: "100%"*/ }).html(this.label());
            if (this.fontSize( ))
                item.css({"font-size": this.fontSize()});
            if (this.color())
                item.css({"color": this.color()});
            // фонт
            if (this.fontFamily())
                item.css({"font-family": this.fontFamily()});
            if (this.fontWeight())
                item.css({"font-weight": this.fontWeight()});

            vLabel._setVisible.call(this);
            vLabel._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vLabel._genEventsForParent = function() {
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
        return vLabel;
    }
);