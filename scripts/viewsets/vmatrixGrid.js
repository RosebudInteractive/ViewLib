define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/matrixGrid.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vMatrixGrid = {};
        for (var i in Base)
            vButton[i] = Base[i];
        for (var i in Base)
            vMatrixGrid[i] = Base[i];
        vMatrixGrid._templates = template.parseTemplate(tpl);
        vMatrixGrid.render = function(options) {
            var table = $('#' + this.getLid());
            if (table.length == 0) {
                table = $(vMatrixGrid._templates['matrixGrid']).attr('id', this.getLid());
                var parent = (this.getParentComp()? '#' + this.getParentComp().getLid(): options.rootContainer);
                $(parent).append(table);
            } else {
                table.empty();
            }
            var x = this.horCells();
            var y = this.verCells();
            for (var i = 0; i < y; i++) {
                var row = $(vMatrixGrid._templates['row']);
                for (var j = 0; j < x; j++) {
                    var cell = $(vMatrixGrid._templates['cell']);
                    row.append(cell);
                }
                table.append(row);
            }
            table.css({top: this.top() + 'px', left: this.left() + 'px'});
            vMatrixGrid._setVisible.call(this);
            vMatrixGrid._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vMatrixGrid._genEventsForParent = function() {
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
        return vMatrixGrid;
    }
);