define(
    ['./viewset', 'text!./templates/dataCombo.html', '../uccello/metadata/meta-defs'],
    function(Viewset, tpl, Meta) {
        const vLookupCombo = class vLookupCombo extends Viewset {
            static getTemplate() {
                return tpl
            }

            createItem(component) {
                // объект контейнера
                var pItem = $(this._templates['combo']).attr('data-id', "mid_" + component.getLid());
                var item = pItem.children(".control").attr('id', component.getLid());

                item.click(function () {
                    component._isOpen = true;
                    item.find(".lookup-arrow-wrapper").addClass("is-open")
                    component._popup.genetixPopup("show",
                        component._popupData
                    );
                });

                item.focus(function () {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(() => {
                            component.setFocused();
                        });
                    }
                });

                component._isOpen = false;
                var popupDiv = $("<div></div>");
                $("body").append(popupDiv);
                component._popup = popupDiv.genetixPopup({
                    buttonControl: item.find(".lookup-arrow-wrapper"),
                    offsetX: -26,
                    offsetY: 10,
                    leftIcons: false,
                    rightIcons: false,
                    click: function (event, data) {
                        component.getControlMgr().run(() => {
                            if (component.lookupDataset() && component.displayField()) {
                                component.lookupDataset().cursor(data.custom.valueGuid);
                            }

                            if (component.dataset() && component.dataField() && component.lookupDataset()) {
                                component.dataset().setField(component.dataField(), component.lookupDataset().getField(component.valueField()));
                                component._isRendered(false);
                            }

                        });
                    },
                    hide: function () {
                        component._isOpen = false;
                        item.find(".lookup-arrow-wrapper").removeClass("is-open")
                    }
                });

                return pItem
            }

            initItem(pItem, component) {
                var item = pItem.children(".control");
                var _dataset = component.lookupDataset();
                var _dataField = component.dataField();

                var data = [];
                if (_dataset && component.displayField() && component.valueField()) {
                    var _col = _dataset.getDataCollection();
                    if (_col) {
                        for (var i = 0, len = _col.count(); i < len; i++) {
                            var obj = _col.get(i);
                            var text = this.getLookupField(component, obj, component.displayField());
                            var value = this.getLookupField(component, obj, component.valueField());

                            var dataItem = {
                                id: component.getLid() + "-" + obj.getGuid().replace("@", "_"),
                                title: text,
                                subTree: [],
                                custom: {
                                    valueGuid: obj.getGuid(),
                                    value: value
                                }
                            };

                            data.push(dataItem);
                        }
                    }
                }
                component._popupData = data;

                // устанавливаем значение
                if (component.dataset() && _dataField)
                    item.find(".lookup-text").text(
                        component.dataset().getField(_dataField)
                    );
                else if (component.lookupDataset() && component.displayField())
                    item.find(".lookup-text").text(
                        component.lookupDataset().getField(component.displayField())
                    );
            }

            getLookupField(component, obj, fieldName) {
                var funcName = "";
                if (fieldName) {
                    funcName = fieldName;
                    funcName = funcName[0].toLowerCase() + funcName.slice(1);
                }
                var text = (typeof obj[funcName] == "function") ? obj[funcName]() : "Field not found";
                return text;
            }
        };

        return vLookupCombo;
    }
);

