/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/toolbarSeparator.html', '/scripts/viewsets/v-base.js'],
    function(tpl, ViewBase) {
        const vToolbarSeparator = class vToolbarSeparator extends ViewBase {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var pItem = $(this._templates['separator']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());
                var parent = (component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer);
                $(parent).css("position", "relative");

                return pItem;
            }

            initItem(pItem, component) {
                var vSet = this;
                var item = $("#" + component.getLid())
                var toolbar = component.getParentComp();
                var space = "";
                if (toolbar.spacing()) {
                    space = toolbar.spacing();
                    if ($.isNumeric(space))
                        space += "px";
                }
                item.width(space);

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

        return vToolbarSeparator;
    }
);