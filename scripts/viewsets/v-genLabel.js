/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['text!./templates/label.html', '/scripts/viewsets/v-label.js'],
    function(tpl, VLabel) {
        const vGenLabel = class vGenLabel extends VLabel {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var pItem = $(this._templates['label']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());
                var parent = (component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer);
                item.click(function(){
                    if (component.tabStop() === undefined || component.tabStop())
                        component.getControlMgr().run(() =>{
                            component.setFocused();
                        });
                }).focus(function() {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(() => {
                            component.setFocused();
                        });
                    }
                });

                return pItem;
            }

            initItem(pItem, component) {
                var item = $('#' + component.getLid());
                if (component.verticalAlign()) {
                    pItem.css("display", "table-cell");
                    var vAl = component.verticalAlign().toUpperCase();
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

                if (component.tabStop() === undefined || component.tabStop())
                    item.attr("tabIndex", "0");
                else
                    item.attr("tabIndex", "");

                var currentControl = component.getForm().currentControl();
                if ($(':focus').attr('id') != component.getLid() &&
                    component.getForm().isFldModified("CurrentControl") &&
                    component.getForm().currentControl() == component)
                    item.focus();

                if (component.horizontalAlign() && component.horizontalAlign().toUpperCase() == "LEFT")
                    item.css({"text-align": "left"});
                else
                    item.css({"text-align": "right"});

                item.css({width: "100%"/*, height: "100%"*/ }).html(component.label());
                if (component.fontSize( ))
                    item.css({"font-size": component.fontSize()});
                if (component.color())
                    item.css({"color": component.color()});
                // фонт
                if (component.fontFamily())
                    item.css({"font-family": component.fontFamily()});
                if (component.fontWeight())
                    item.css({"font-weight": component.fontWeight()});

                this._setVisible(component);
                this._genEventsForParent(component);
            }

            /**
             * Оповещение парента об изменениях пропертей
             * @private
             */
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

        return vGenLabel
    }
);
