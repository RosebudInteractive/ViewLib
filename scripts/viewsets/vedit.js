define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/edit.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vEdit = {};
        for (var i in Base)
            vEdit[i] = Base[i];
        vEdit._templates = template.parseTemplate(tpl);
        vEdit.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                var pItem = $(vEdit._templates['edit']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control");
                item.attr('id', this.getLid());
                var parent = (this.getParentComp()? '#' + this.getParentComp().getLid(): options.rootContainer);
                $(parent).append(pItem);
            }
            item.css({top: this.top() + 'px', left: this.left() + 'px'}).val(this.value());
            vEdit._setVisible.call(this);
            vEdit._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vEdit._genEventsForParent = function() {
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
        return vEdit;
    }
);