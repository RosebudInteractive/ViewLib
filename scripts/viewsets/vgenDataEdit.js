define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/dataEdit.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vGenDataEdit = {};
        for (var i in Base)
            vGenDataEdit[i] = Base[i];
        vGenDataEdit._templates = template.parseTemplate(tpl);
        vGenDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = null;
                if (this.multiline())
                    pItem = $(vGenDataEdit._templates['multiLineEdit']).attr('id', "mid_" + this.getLid());
                else
                    pItem = $(vGenDataEdit._templates['edit']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());

                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                $(parent).css("position", "relative");

                // сохранять при потере фокуса
                item.find("input, textarea").blur(function () {
                    if (that.isChanged && that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var dataset = that.dataset();
                            dataset.setField(that.dataField(), item.find("input, textarea").val());
                        });
                    }
                    that.isChanged = false;
                });
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
                // при изменении значения
                item.keydown(function (e) {
                    that.isChanged = true;
                });

                if (this.multiline()) {
                    item.children().autosize({
                        callback: function (el) {
                            var oldH = $(el).parent().height();
                            $(el).parent().css({height: ""});
                            $(el).parent().parent().css({height: ""});
                            $(el).parent().height($(el).css("height").replace("px", "")); //$(el).parent().height());
                            $(el).parent().parent().height($(el).parent().css("height").replace("px", ""));
                            if (oldH != $(el).parent().height())
                                $('#ch_' + that.getLid()).trigger("genetix:childPropChanged", {
                                    control: that,
                                    properties: {Height: true}
                                });
                        }
                    });
                }
            } else {
                pItem = $("#mid_" + this.getLid());
            }

            if (this.getForm().isFldModified("CurrentControl") && (this.getForm().currentControl() == this))
                item.find("input, textarea").focus();

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

            if (this.width() && this.horizontalAlign())
                item.css("width", this.width());
            else
                item.css("width", "");
            if (this.horizontalAlign()) {
                if (this.horizontalAlign().toUpperCase() == "CENTER")
                    item.css("margin", "0 auto")
            } else
                item.css("margin", "")



            if (!this.isChanged) {
                // устанавливаем значение
                if (this.dataset() && this.dataField()) {
                    //var dataset = that.getControlMgr().get(that.dataset());
                    var dataset = that.dataset();
                    var input = item.find("input, textarea");
                    input.val(dataset ? dataset.getField(this.dataField()) : '');
                    if (this.multiline())
                        input.trigger("autosize.resize");
                }
            }

            if (this.title()) {
                item.attr("title", this.title());
                item.tooltip({
                    position: { my: 'center top', at: 'center bottom', collision: 'none' },
                    tooltipClass: 'bottom'
                });
            } else
                item.removeAttr("title");

            item.height(item.height());

            vGenDataEdit._setVisible.call(this);
            vGenDataEdit._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vGenDataEdit._genEventsForParent = function() {
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
        return vGenDataEdit;
    }
);