define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/dataGrid.html',
        '/scripts/viewsets/vbase.js', "wGrid", "/scripts/lib/iscroll.js"],
    function(template, tpl, Base) {
        var vDataGrid = {};
        for (var i in Base)
            vDataGrid[i] = Base[i];
        vDataGrid._templates = template.parseTemplate(tpl);


        /**
         * Рендер DOM грида
         * @param options
         */
        vDataGrid.render = function(options) {
            var that = this;
            var grid = $('#' + this.getLid());

            var hasStroll = true;
            if (this.scroll() !== undefined)
                hasStroll = this.scroll() ? true : false

            // если не создан грид
            if (grid.length == 0) {
                var pItem = $(vDataGrid._templates['grid']).attr('id', "mid_" + this.getLid());
                grid = pItem.children(".grid-b").attr('id', this.getLid());
                grid.css({width: "100%", height: ((this.height() && this.height()) == "auto" ? "auto" : "100%")});

                var parent = (this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer);
                $(parent).append(pItem);
                this._realyRendered = $(parent).length != 0;

                var gCols = vDataGrid._getColumns.call(that);

                var rowHeight = 24;
                if (!that.bigSize())
                    rowHeight = 30;

                this._grid = webix.ui({
                        container: grid[0],
                    view: "datatable",
                    columns: gCols,
                    fixedRowHeight: true,
                    headerRowHeight: 24,
                    rowHeight: rowHeight,
                    select: "row",
                    navigation: true,
                    hover: "row-hover",
                    autoheight: (this.height() && this.height() == "auto"),
                    scrollX: true,
                    on: {
                        onDataRequest: function (start, count, callback) {
                            var data = vDataGrid._getData.call(that, start, count);
                            that._idMap = {};
                            that._grid.clearAll();
                            for (var i = 0; i < data.length; i++) {
                                that._idMap[data[i]["$sysId"]] = data[i].id;
                            }
                            that._grid.parse(data, "json");
                            if (callback) callback();
                            return false;
                        },
                        onBeforeSelect: function(data) {
                            var item = this.getItem(data.id);
                            if (that.dataset() && that.dataset().cursor() != item["$sysId"]) {
                                that.getControlMgr().userEventHandler(that, function () {
                                    that.dataset().cursor(item["$sysId"]);
                                });
                            }
                            return true;
                        }
                    }
                });

                $(window).on("genetix:resize", function () {
                    that._grid.resize();
                });
                $(window).on("genetix:initResize", function () {
                    /*var g = $("#" + that.getLid());
                    g.children().css("width", "100%");
                    var hv = g.find(".webix_ss_header").width();
                    var scrollHeaderW = g.find(".webix_ss_vscroll_header").width();
                    var w = hv ? (hv - scrollHeaderW)*100/hv : 0;
                    g.find(".webix_hs_center").css("width", w + "%");
                    g.find(".webix_hs_center").find("table").css("width", "100%");

                    var allW = g.find(".webix_hs_center").width();
                    var widths = [];
                    g.find(".webix_hs_center").find("table").find("th").each(function() {
                        var w = $(this).width();
                        var perc = ((w/allW)*100);
                        $(this).css("width", perc + "%");
                        widths.push(perc);
                    });

                    g.find(".webix_ss_center").css("width", w + "%");
                    g.find(".webix_ss_center").find(".webix_ss_center_scroll").css("width", "100%");
                    g.find(".webix_ss_hscroll").css("width", "100%");
                    g.find(".webix_ss_hscroll").find(".webix_vscroll_body").css("width", "100%");
                    var bodyDiv = grid.find(".webix_ss_center").find(".webix_ss_center_scroll");
                    var left = 0;
                    var i = 0;
                    bodyDiv.children(".webix_column").each(function () {
                        var perc = widths[i++];
                        $(this).css("width", perc + "%");
                        $(this).css("left", left + "%");
                        left += perc;
                    });*/
                });



                grid.focus(function() {
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function () {
                            that.setFocused();
                        });
                    }
                });

            } else {
                pItem = $("#mid_" + this.getLid());
            }
            vDataGrid._forceLoad.call(that);

            if (this.bigSize())
                grid.removeClass("small-size standard-size").addClass("large-size");
            else
                grid.removeClass("large-size standard-size").addClass("small-size");



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

            // Отрендерим св-ва
            if (this.whiteHeader())
                grid.addClass("white-header");
            else
                grid.removeClass("white-header");

            if (this.verticalLines()) grid.addClass("vertical-lines");
            else grid.removeClass("vertical-lines");
            if (this.horizontalLines()) grid.addClass("horizontal-lines");
            else grid.removeClass("horizontal-lines");
            if (this.alternate()) grid.addClass("alternate-lines");
            else grid.removeClass("alternate-lines");


            var cssPos = (hasStroll ? "absolute" : "relative");
            grid.children().css({"position": cssPos});

            // выставляем фокус
            //if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
            //    pItem.find("tr[tabIndex=1]").focus();
            //else
            //    pItem.find("tr[tabIndex=1]").blur();

            //vDataGrid._setVisible.call(this);
            vDataGrid._genEventsForParent.call(this);
        }

        vDataGrid._forceLoad = function() {
            var that = this;
            var dataset = this.dataset();
            if (!dataset) return;
            var col = dataset.getDataCollection();
            var recCount = 1;
            if (col) recCount = col.count();

            this._grid.loadNext(recCount, 0, function () {
                if (dataset && dataset.cursor())
                    vDataGrid.renderCursor.call(that, dataset.cursor());
                if (that.height() && that.height() == "auto") {
                    var extCont = $("#ext_" + that.getLid());
                    var grdHeight = $("#" + that.getLid()).find(".webix_view.webix_dtable").css("height");
                    extCont.css("height", grdHeight);
                    $(window).trigger("genetix:resize");
                }
            });
        }

        vDataGrid.setFocus = function() {
            var pItem = $("#mid_" + this.getLid());
            pItem.find("tr[tabIndex=1]").focus();
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vDataGrid._genEventsForParent = function() {
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

            if (this._reloaded) { changedFields.Height = true; genEvent = true; }
            if (genEvent) {
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vDataGrid._getData = function(start, count) {
            var dataset = null;
            var datafields = [];
            var data = [];
            var col = null;

            if (this.dataset()) {
                dataset = this.dataset();
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

        vDataGrid._getColumns = function() {
            var gridColumns = [];
            var dataset = this.dataset();
            var columns = this.getCol('Columns');
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
                    gridCol.id = fieldsArr[column.get('Field').getGuid()];
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
        },


        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            if (!id || !(this._grid)) return false;
            var gridId = this._idMap[id];
            if (this._grid.exists(gridId)) {
                this._grid.select(gridId);
                this._grid.showItem(gridId);
            }
        }

        return vDataGrid;
    }
);