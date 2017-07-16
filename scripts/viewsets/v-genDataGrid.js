define(
    ['/scripts/viewsets/v-dataGrid.js', "wGrid", "/scripts/lib/iscroll.js"],
    function(VDataGrid) {
        const vGenDataGrid = class vGenDataGrid extends VDataGrid {
            createItem(component, options) {
                component._isDataRefreshed = true;
                var vSet = this;

                var pItem = $(this._templates['grid']).attr('data-id', "mid_" + component.getLid());
                var grid = pItem.children(".grid-b").attr('id', component.getLid());
                grid.css({width: "100%", height: ((component.height() && component.height()) == "auto" ? "auto" : "100%")});

                var parent = (component.getParentComp()? '#ch_' + component.getLid(): options.rootContainer);
                component._realyRendered = $(parent).length != 0;

                var gCols = this._getColumns(component);

                var rowHeight = 24;
                if (!component.bigSize())
                    rowHeight = 30;

                component._moveCursorStruct = {
                    cursor: component.dataset() ? component.dataset().cursor() : null
                };

                component._grid = webix.ui({
                    container: grid[0],
                    view: "datatable",
                    columns: gCols,
                    fixedRowHeight: true,
                    headerRowHeight: 24,
                    rowHeight: rowHeight,
                    select: "row",
                    navigation: true,
                    hover: "row-hover",
                    autoheight: (component.height() && component.height() == "auto"),
                    scrollX: true,
                    on: {
                        onDataRequest: function (start, count, callback) {
                            var data = vSet._getData(component, start, count);
                            component._idMap = {};
                            component._grid.clearAll();
                            for (var i = 0; i < data.length; i++) {
                                component._idMap[data[i]["$sysId"]] = data[i].id;
                            }
                            component._grid.parse(data, "json");
                            if (callback) callback();
                            return false;
                        },
                        onBeforeSelect: function(data) {
                            return vSet.moveCursor(component, data, this);
                        }
                    }
                });

                component._onGenetixResize = function () {
                    component._grid.resize();
                }

                $(window).on("genetix:resize", component._onGenetixResize);

                grid.focus(function() {
                    if (component.getForm().currentControl() != component) {
                        component.getControlMgr().run(() => {
                            component.setFocused();
                        });
                    }
                });

                return pItem;
            }

            destroyUI(item, component) {
                $(window).off("genetix:resize", component._onGenetixResize);
            }

            initItem(pItem, component) {
                var vSet = this;
                var dataset = component.dataset();
                var hasScroll = this.hasScroll(component);
                if (component._moveCursorStruct && component._moveCursorStruct.timeId) {
                    clearTimeout(component._moveCursorStruct.timeId);
                    component._moveCursorStruct.timeId = null;
                } else if (component.dataset() && component.dataset().cursor())
                    component._moveCursorStruct.cursor = component.dataset().cursor()

                var grid = $("#" + component.getLid());

                this._forceLoad(component);

                if (component.bigSize())
                    grid.removeClass("small-size standard-size").addClass("large-size");
                else
                    grid.removeClass("large-size standard-size").addClass("small-size");

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

                // Отрендерим св-ва
                if (component.whiteHeader())
                    grid.addClass("white-header");
                else
                    grid.removeClass("white-header");

                if (component.verticalLines()) grid.addClass("vertical-lines");
                else grid.removeClass("vertical-lines");
                if (component.horizontalLines()) grid.addClass("horizontal-lines");
                else grid.removeClass("horizontal-lines");
                if (component.alternate()) grid.addClass("alternate-lines");
                else grid.removeClass("alternate-lines");


                var cssPos = (hasScroll ? "absolute" : "relative");
                grid.children().css({"position": cssPos});


                this._genEventsForParent(component);

            }

            moveCursor(component, data, grid) {
                var item = grid.getItem(data.id);
                if (component.dataset() && component.dataset().cursor() != item["$sysId"]) {
                    if (component._moveCursorStruct.timeId)
                        clearTimeout(component._moveCursorStruct.timeId);
                    component._moveCursorStruct.cursor = item["$sysId"];

                    component._moveCursorStruct.timeId = setTimeout(() => {
                        component._moveCursorStruct.timeId = null;
                        component.getControlMgr().run(() => {
                            console.log("MOVE CURSOR");
                            component.dataset().cursor(
                                component._moveCursorStruct.cursor
                            );
                        });
                    }, 300);
                }
                return true;
            }

            hasScroll(component) {
                var hasStroll = true;
                if (component.scroll() !== undefined)
                    hasStroll = component.scroll() ? true : false

            }

            _forceLoad(component) {
                var vSet = this;
                var that = component;
                var dataset = component.dataset();
                if (!dataset) return;
                var col = dataset.getDataCollection();
                var recCount = 1;
                if (col) recCount = col.count();

                console.log("FORCELOAD!", col);

                component._grid.loadNext(recCount, 0, function () {
                    if (that.height() && that.height() == "auto") {
                        var extCont = $("#ext_" + that.getLid());
                        var grdHeight = $("#" + that.getLid()).find(".webix_view.webix_dtable").css("height");
                        extCont.css("height", grdHeight);
                        $(window).trigger("genetix:triggerResize");
                    }
                    component._grid.resize();
                    if (dataset && dataset.cursor())
                        vSet.constructor.renderCursor(that, component._moveCursorStruct.cursor);
                });
            }

            /**
             * Рендер курсора
             * @param id
             */
            static renderCursor(component, id) {
                if (!(component._grid)) return false;
                // ignore cursor value if we have pending cursor movement
                if (component._moveCursorStruct.timeId)
                    id = component._moveCursorStruct.cursor;

                var gridId = component._idMap[id];
                if (component._grid.exists(gridId)) {
                    component._grid.select(gridId);
                    component._grid.showItem(gridId);
                }
            }

            _getColumns(component) {
                var gridColumns = [];
                var dataset = component.dataset();
                var columns = component.getCol('Columns');
                var fieldsArr = {};

                if (dataset) {
                    var fields = dataset.getCol('Fields');
                    for (var i = 0, len = fields.count(); i < len; i++) {
                        var field = fields.get(i);
                        fieldsArr[field.getGuid()] = (field.get('Name') == "Id" ? "id" : field.get('Name'));
                        if (columns.count() == 0) {
                            var gridCol = {};
                            gridCol.id = (field.get('Name') == "Id" ? "id" : field.get('Name'));
                            gridCol.header = field.get('Name');
                            gridColumns.push(gridCol);
                        }
                    }
                }

                if (columns.count() > 0) {
                    for (var i = 0, len = columns.count(); i < len; i++) {
                        var column = columns.get(i);
                        var gridCol = {};
                        gridCol.id = fieldsArr[column.field().getGuid()];
                        gridCol.header = column.get('Label');
                        if (column.get('Width')) {
                            if ($.isNumeric(column.get('Width'))) {
                                gridCol.fillspace = column.get('Width');
                            } else if (column.get('Width').endsWith("px")) {
                                gridCol.width = +(column.get('Width').replace("px", ""));
                            } else
                                gridCol.fillspace = column.get('Width');
                        }
                        gridColumns.push(gridCol);
                    }
                }

                return gridColumns;
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

                //if (component._reloaded) { changedFields.Height = true; genEvent = true; }
                if (genEvent) {
                    $('#ch_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }

            _getData(component, start, count) {
                var dataset = null;
                var datafields = [];
                var data = [];
                var col = null;

                if (component.dataset()) {
                    dataset = component.dataset();
                    if (dataset)
                        col = dataset.getDataCollection()
                }

                if (col) {
                    var idIndex = null;
                    var fieldsArr = {};
                    var fields = dataset.getCol('Fields');
                    for (var i = 0, len = fields.count(); i < len; i++) {
                        var field = fields.get(i);
                        fieldsArr[field.getGuid()] = field.get('Name');
                        if (field.get('Name') == 'Id')
                            idIndex = field.getGuid();
                        datafields.push({name: field.get('Name')});
                    }

                    var recCount = col.count();
                    if (start < 0) start = 0;
                    for (var i = start; i < recCount && i < start + count; i++) {
                        var obj = col.get(i);
                        var id = null;
                        var dataRow = {};
                        // добавляем ячейка
                        for (var j in fieldsArr) {
                            var text = obj.get(fieldsArr[j]);
                            if (idIndex == j) {
                                dataRow["id"] = text;
                                id = text;
                            } else
                                dataRow[fieldsArr[j]] = text;
                        }

                        if (dataset.getTypeGuid() === UCCELLO_CONFIG.classGuids.Dataset)
                            id = obj.getGuid();
                        dataRow["$sysId"] = id;
                        data.push(dataRow);
                    }
                }
                return data;
            }

            static setFocus(component) {

            }

            static renderWidth(component, options) {
                var dataset = component.dataset();
                component._grid.resize();
                if (dataset && component._moveCursorStruct.cursor)
                    this.constructor.renderCursor(component, component._moveCursorStruct.cursor);
            }

        }

        return vGenDataGrid;
    }
);
