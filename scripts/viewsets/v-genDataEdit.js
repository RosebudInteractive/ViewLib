/**
 * Created by levankiknadze on 25/01/2017.
 */

define(
    ['/scripts/viewsets/v-dataEdit.js',
        '/scripts/uccello/metadata/meta-defs.js'],
    function(VEdit, Meta) {
        var IGNORE_KEYS = {
            37: "LEFT_KEY",
            38: "UP_KEY",
            39: "RIGHT_KEY",
            40: "DOWN_KEY",
            9: "TAB_KEY"
        }


        const vGenDataEdit = class vGenDataEdit extends VEdit {
            createItem(component, options) {
                var pItem = null;
                var vSet = this;
                if (component.multiline())
                    pItem = $(this._templates['multiLineEdit']).attr('data-id', "mid_" + component.getLid());
                else
                    pItem = $(this._templates['edit']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                var parent = component.getParentComp() ? '#ch_' + component.getLid() : options.rootContainer;
                $(parent).css("position", "relative");

                // сохранять при потере фокуса
                item.find("input, textarea").blur(function () {
                    var dataset = component.dataset();
                    if (component.isChanged && dataset && component.dataField()) {
                        component.getControlMgr().run(() => {
                            dataset.setField(component.dataField(), item.find("input, textarea").val());
                        });
                    }
                    component.isChanged = false;
                });
                item.click(function () {
                    component.getControlMgr().run(() => {
                        component.setFocused();
                    });
                }).focus(function () {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(() => {
                            component.setFocused();
                        });
                    }
                });
                // при изменении значения
                item.keydown(function (e) {
                    if (e.keyCode in IGNORE_KEYS) return;
                    component.isChanged = true;
                });

                if (component.multiline()) {
                    item.children().autosize({
                        callback: function (el) {
                            var oldH = $(el).parent().height();
                            $(el).parent().css({height: ""});
                            $(el).parent().parent().css({height: ""});
                            $(el).parent().height($(el).css("height").replace("px", "")); //$(el).parent().height());
                            $(el).parent().parent().height($(el).parent().css("height").replace("px", ""));
                            if (oldH != $(el).parent().height())
                                $('#ch_' + component.getLid()).trigger("genetix:childPropChanged", {
                                    control: component,
                                    properties: {Height: true}
                                });
                        }
                    });
                }

                return pItem;
            }

            initItem(pItem, component) {
                var item = $("#" + component.getLid())
                if (component.getForm().isFldModified("CurrentControl") && (component.getForm().currentControl() == component))
                    item.find("input, textarea").focus();

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

                if (component.width() && component.horizontalAlign())
                    item.css("width", component.width());
                else
                    item.css("width", "");
                if (component.horizontalAlign()) {
                    if (component.horizontalAlign().toUpperCase() == "CENTER")
                        item.css("margin", "0 auto")
                } else
                    item.css("margin", "")


                var ds = component.dataset();
                if (!component.isChanged) {
                    // устанавливаем значение
                    if (ds && component.dataField()) {
                        //var dataset = that.getControlMgr().get(that.dataset());
                        var input = item.find("input, textarea");
                        input.val(ds ? ds.getField(component.dataField()) : '');
                        if (component.multiline())
                            input.trigger("autosize.resize");
                    }
                }

                if (component.title()) {
                    item.attr("title", component.title());
                    item.tooltip({
                        position: {my: 'center top', at: 'center bottom', collision: 'none'},
                        tooltipClass: 'bottom'
                    });
                } else
                    item.removeAttr("title");

                item.height(item.height());

                var inpt = item.find("input");
                var enabled = component.enabled();
                enabled = enabled && ds && ds.cursor() &&
                    (ds.getState() === Meta.State.Insert || ds.getState() === Meta.State.Edit);
                if (enabled) {
                    inpt.removeAttr("disabled");
                    item.removeClass("is-disabled")
                } else {
                    inpt.attr("disabled", true);
                    item.addClass("is-disabled")
                }
                this._setVisible(component);
                this._genEventsForParent(component);
            }

            _genEventsForParent(component) {
                var genEvent = false;
                var changedFields = {};
                if (component.isFldModified("Width")) {
                    changedFields.Width = true;
                    genEvent = true;
                }
                if (component.isFldModified("Height")) {
                    changedFields.Height = true;
                    genEvent = true;
                }
                if (component.isFldModified("HorizontalAlign")) {
                    changedFields.HorizontalAlign = true;
                    genEvent = true;
                }
                if (component.isFldModified("VerticalAlign")) {
                    changedFields.VerticalAlign = true;
                    genEvent = true;
                }
                if (component.isFldModified("MinWidth")) {
                    changedFields.MinWidth = true;
                    genEvent = true;
                }
                if (component.isFldModified("MinHeight")) {
                    changedFields.MinHeight = true;
                    genEvent = true;
                }
                if (component.isFldModified("MaxWidth")) {
                    changedFields.MaxWidth = true;
                    genEvent = true;
                }
                if (component.isFldModified("MaxHeight")) {
                    changedFields.MaxHeight = true;
                    genEvent = true;
                }
                if (component.isFldModified("PadLeft")) {
                    changedFields.PadLeft = true;
                    genEvent = true;
                }
                if (component.isFldModified("PadRight")) {
                    changedFields.PadRight = true;
                    genEvent = true;
                }
                if (component.isFldModified("PadTop")) {
                    changedFields.PadTop = true;
                    genEvent = true;
                }
                if (component.isFldModified("PadBottom")) {
                    changedFields.PadBottom = true;
                    genEvent = true;
                }
                if (component.isFldModified("Visible")) {
                    changedFields.Visible = true;
                    genEvent = true;
                }

                if (genEvent) {
                    $('#ch_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }
        }

        return vGenDataEdit;
    }
);
