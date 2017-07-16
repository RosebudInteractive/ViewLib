/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['/scripts/viewsets/v-button.js'],
    function(VButton) {
        const vGenButton = class vGenButton extends VButton {
            createItem(component, options) {
                var pItem = $(this._templates['button']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                var parent = '#' + (component.getParentComp()? "ch_"+component.getLid():options.rootContainer);
                $(parent).css("position", "relative");
                item.click(function(){
                    if (component.enabled()) {
                        component.getControlMgr().run(function(){
                            component.setFocused();
                            component.onClick();
                        });
                    }
                }).focus(function() {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(function () {
                            component.setFocused();
                        });
                    }
                });

                return pItem;
            }

            initItem(pItem, component) {
                var item = $("#" + component.getLid())
                // выставляем фокус
                if ($(':focus').attr('id') != component.getLid() && component.getForm().isFldModified("CurrentControl") &&
                    component.getForm().currentControl() == component)
                    $('#ch_'+component.getLid()).find('input').focus();

                if (component.verticalAlign()) {
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

                if (component.horizontalAlign()) {
                    if (component.horizontalAlign().toUpperCase() == "CENTER")
                        item.css("margin", "0 auto")
                } else
                    item.css("margin", "");

                item.find("input").val(component.caption());
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
                        control: this,
                        properties: changedFields
                    });
                }
            }


        }

        return vGenButton
    }
);