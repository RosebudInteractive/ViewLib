define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/button.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vButton = {};
        for (var i in Base)
            vButton[i] = Base[i];
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vButton._templates['button']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                var parent = '#' + (this.getParentComp()? "ch_"+this.getLid():options.rootContainer);
                $(parent).append(pItem);
                $(parent).css("position", "relative");
                item.click(function(){
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

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $('#ch_'+this.getLid()).find('input').focus();

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

            if (this.horizontalAlign()) {
                if (this.horizontalAlign().toUpperCase() == "CENTER")
                    item.css("margin", "0 auto")
            } else
                item.css("margin", "");

            item.find("input").val(this.caption());
            if (this.background())
                item.find("input").css({"background-color" : this.background()});
            if (this.color())
                item.find("input").css({"color" : this.color()});
            if (this.borderColor())
                item.find("input").css({"border-color" : this.borderColor()});


            if (this.extendedClass())
                item.addClass(this.extendedClass());
            else
                item.addClass("is-white");
            vButton._setVisible.call(this);
            vButton._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vButton._genEventsForParent = function() {
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
        return vButton;
    }
);