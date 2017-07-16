/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/edit.html', '/scripts/viewsets/v-base.js'],
    function(tpl, ViewBase) {
        const vEdit = class vEdit extends ViewBase {
            static getTemplate() {
                return tpl
            }

            createItem(component) {
                var pItem = $(this._templates['edit']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control");
                item.attr('id', component.getLid());

                return pItem;
            }

            initItem(pItem, component) {
                var item = $("#" + component.getLid())
                item.css({top: this.top() + 'px', left: this.left() + 'px'}).val(this.value());
                this._setVisible(component);
                this._genEventsForParent(component);
            }


            _genEventsForParent(component) {
                var genEvent = false;
                var changedFields = {};
                if (component.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
                if (component.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
                if (component.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
                if (component.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
                if (component.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
                if (component.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
                if (component.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
                if (component.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
                if (component.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
                if (component.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
                if (component.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
                if (component.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }
                if (component.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }
                if (genEvent) {
                    $('#ch_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }


        }

        return vEdit;
    }
);