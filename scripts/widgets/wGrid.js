define(
    'wGrid',
    ['/scripts/uccello/uses/template.js', 'text!./widgets/templates/grid.html'],
    function (template, tpl) {
        var templates = template.parseTemplate(tpl);

        $.widget("custom.grid", {

            // Здесь задается список настроек и их значений по умолчанию
            options: {
                width: 200,
                height: 300,
                pagesize: 10,
                pagesizeoptions: ['5', '10', '20'],
                editable: false,
                pageable: false,
                sortable: true,
                selectedrow: {},
                checkedColumn: false,
                hint: '',
                layout: 0,
                lineHeight: 0,
                sortdir: 'asc',
                scroll: true,
                columns: [], // {text: 'Текст', type: 'text', editable: false, datafield: 'ID', width: '30%'}
                source: {
                    datafields: [],
                    localdata: [],
                    id: 'id'
                },
                ds: null
            },

            // Функция, вызываемая при активации виджета на элементе
            _create: function () {
                var that = this;
                this.selectedrow = {}; // выбранная строчка
                this.sort = {el: null, datafield: null, dir: null}; // текущая сортировка
                this.layouts = ['is-striped-bg', 'is-horizontal-div', 'is-vertical-div'];
                this.lineHeights = ['is-normal', 'is-enlarged'];
                this.element.css({width: this.options.width, height: this.options.height});
                if (("top" in this.options) || "left" in this.options) {
                    this.element.css({position: "relative", left: this.options.left, top: this.options.top});
                }

                var grid = $(templates["grid"]);
                grid.attr('title', this.options.hint);
                this._headTable = grid.find('.header-bl .table-bl thead');
                this._bodyTable = grid.find('.scrollable-bl .table-bl tbody');
                this._grid = grid;
                this._rowHeight = 0;
                this.element.append(grid);
                this.fixHeight();
                this.clearPageCache();
                $(window).on("genetix:triggerResize", function () {
                    setTimeout(function () {
                        console.log("setTimeout wGrid");
                        var parent = that._headTable.parent();
                        //parent.width(that._bodyTable.width());
                        //parent.resizableColumns("syncHandleWidths");
                        that.fixHeight();
                    }, 350);
                });
            },

            fixHeight: function () {
                if (this.options.scroll) {
                    var pad = this._grid.children(".scrollable-bl").padding();
                    var h = this._grid.parent().parent().height() - pad.top - pad.bottom;
                    this._grid.parent().height(this._grid.parent().parent().height());
                    this._grid.height(this._grid.parent().parent().height());
                    this._grid.children(".scrollable-bl").height(h);
                    this.reloading(null, null);
                    this._trigger("sizechanged", null);
                } else {
                    this._grid.parent().css("height", "auto");
                    this._grid.css("height", "auto");
                    try {
                        this._trigger("sizechanged", null);
                    } catch (e) {
                        console.error(e)
                    }
                }
            },

            getVisiblePortion: function () {
                //return (Math.floor(this.options.height / this._rowHeight) + 1);
                if (!this.options.scroll)
                    return this.options.source.localdata.length;
                else if (this._rowHeight > 0)
                    return (Math.floor($(this)[0].element[0].children[0].children[1].clientHeight / this._rowHeight) + 1);
                else
                    return 100;
            },

            getVisibleRange: function () {
                if (this.options.scroll)
                    return (Math.min(this.getVisiblePortion(), this.options.source.localdata.length - this.firstDataRow));
                else
                    return this.options.source.localdata.length;
            },

            clearPageCache: function () {
                this._topDiv = null;
                this._bottomDiv = null;
                this.firstDataRow = 0;
                this.rowsCache = [];
            },

            reloading: function (columns, source) {

                if (columns != null)
                    this.options.columns = columns;
                if (source != null)
                    this.options.source = source;
                if (columns || !(this._fackeHeader)) {
                    this.renderHeader();
                    var headers = this._headTable.children('tr').children('th');
                    this._addeventsheaders(headers);
                }

                this._bodyTable.empty();
                this.clearPageCache();
                this.renderData();
                //$(window).trigger("genetix:resize");
            },

            renderHeader: function () {
                this._headTable.empty();
                var that = this;
                this._colCount = 0;
                var fakeHeader = $('<tr class="fake-header"></tr>');

                if (this.options.columns.length > 0) {
                    var tr = $('<tr></tr>');


                    // отступ
                    var th = $('<th class="grid-th-bh is-margin is-last"></th>');
                    var ftd = $('<td class="is-margin"/>');
                    th.data('GridHeaders', {data: {}, type: 'margin'});
                    tr.append(th);
                    fakeHeader.append(ftd);
                    // чекбокс
                    th = $('<th width="40" class="grid-th-bh is-checkedcolumn" style="width:40px"><div class="checkbox-b is-bordered th-checkbox-bh"><input type="checkbox"><div class="check-sign-e"></div></div></th>');
                    ftd = $('<td style="width:40px"/>');
                    th.data('GridHeaders', {data: {}, type: 'checkbox'});
                    if (!this.options.checkedColumn) {
                        th.hide();
                        ftd.hide();
                    }
                    tr.append(th);
                    // остальные столбцы
                    for (var i = 0; i < this.options.columns.length; i++) {
                        th = $('<th class="grid-th-bh is-clickable-eff ' + this.options.columns[i].text + '"></th>');
                        th.attr("role", this.options.columns[i].text);
                        if (i == (this.options.columns.length - 1))
                            th.addClass("is-last");
                        th.addClass("can-resize");
                        th.data('GridHeaders', {data: this.options.columns[i], type: 'item'});
                        var text = $('<div class="th-text-be text-ellipsis-gm"></div>').html(this.options.columns[i].text);
                        th.append(text);
                        if (this.options.columns[i].width)
                            th.css({width: this.options.columns[i].width});
                        tr.append(th);
                        th.data('idx', i);
                        ftd = $('<td class="' + this.options.columns[i].text + '"/>');
                        ftd.attr("role", this.options.columns[i].text);
                        if (this.options.columns[i].width)
                            ftd.css({width: this.options.columns[i].width});
                        fakeHeader.append(ftd);
                    }
                    // отступ
                    th = $('<th class="grid-th-bh is-margin" ></th>');
                    th.data('GridHeaders', {data: {}, type: 'margin'});
                    tr.append(th);
                    ftd = $('<td class="is-margin"/>');
                    fakeHeader.append(ftd);
                    this._colCount = this.options.columns.length + (this.options.checkedColumn ? 1 : 0);
                } else {
                    var tr = $('<tr tabindex="1"><th class="grid-th-bh"><div class="th-text-be text-ellipsis-gm">&nbsp;</div></th></tr>');
                }

                this._headTable.append(tr);
                this._fackeHeader = fakeHeader;
                var parent = this._headTable.parent();
                //parent.off("column:resize");
                //parent.resizableColumns("destroy");

                //parent.resizableColumns({selector: "tr th.can-resize"});
                /*parent.on("column:resize", function (event, sender, leftColumn, rightColumn, leftWidth, rightWidth) {
                 var lFieldName = leftColumn.attr("role");
                 var rFieldName = rightColumn.attr("role");
                 var bodyTable = sender.$table.parent().parent().find("div.scrollable-bl table.table-bl");
                 if (DEBUG)
                 console.log({sender: sender, l:leftColumn, r:rightColumn, wl:leftWidth, wr:rightWidth, bt: bodyTable});
                 bodyTable.find("tr.fake-header td[role='" + lFieldName + "']").width(leftWidth + "%");
                 bodyTable.find("tr.fake-header td[role='" + rFieldName + "']").width(rightWidth + "%");
                 });*/

                this._headTable.find("th.can-resize").each(function () {
                    var colName = $(this).attr("role");
                    // var t = parent.resizableColumns();
                    that._fackeHeader.find("td[role='" + colName + "']").css("width", this.style.width);
                });
            },
// добавляет пустую строку с пустыми клетками и расставляет ссылки кэша на колонки и клетки
            addEmptyRow: function () {
                var that = this;
                var tr = $('<tr class="grid-tr-bh"></tr>');
                tr.click(function () {
                    that._selectrow($(this), true);
                    $(this).focus();
                })/*.hover(function() {
                 $(this).next().find("td").css({
                 "box-shadow": "none",
                 "-webkit-box-shadow" : "none",
                 "-moz-box-shadow" : "none"
                 });
                 }).mouseleave(function() {
                 $(this).next().find("td").css({
                 "box-shadow": "",
                 "-webkit-box-shadow" : "",
                 "-moz-box-shadow" : ""
                 });
                 })*/;
                tr.colRef = [];
                tr.cells = [];
                // отступ
                var td = $('<td class="grid-body-td-bh is-margin is-last" style="width: 24px"></td>');
                tr.append(td);
                tr.cells[0] = td;
                tr.colRef[0] = -1;
                // чекбокс
                td = $('<td class="grid-body-td-bh is-checkbox is-checkedcolumn" style="width:40px"><div class="checkbox-b is-bordered"><input type="checkbox"><div class="check-sign-e"></div></div></td>');
                if (!this.options.checkedColumn)
                    td.hide();
                tr.append(td);
                tr.cells[1] = td;
                tr.colRef[1] = -1;
                // остальные поля
                for (var i = 0; i < this.options.columns.length; i++) {
                    td = $('<td class="grid-body-td-bh"><div class="content-bhl"></div></td>');
                    tr.append(td);
                    tr.cells[i + 2] = td;
                    tr.colRef[i + 2] = i;
                    if (i == (this.options.columns.length - 1))
                        td.addClass("is-last");
                }

                // отступ
                var td = $('<td class="grid-body-td-bh is-margin"></td>');
                tr.append(td);
                tr.cells[i + 3] = td;
                tr.colRef[i + 3] = -1;

                this._bodyTable.append(tr);
                if (this._rowHeight == 0) this._rowHeight = tr[0].clientHeight;
                return tr;
            },
// заполняет строку значениями из присоединенного свойства 'GridRows'
            fillVirtualRow: function (idx) {
                var tr = this.rowsCache[idx];
                var dataRow = tr.data('GridRows');
                if (!dataRow) return;
                for (var i = 0; i < tr.cells.length; i++) {
                    var td = tr.cells[i];
                    var datafield = undefined;
                    if (tr.colRef[i] >= 0)
                        datafield = this.options.columns[tr.colRef[i]].datafield;
                    if (dataRow[datafield] !== undefined)
                        td.children('.content-bhl').html(dataRow[datafield]);
                }
                ;
            },

            updateRenderedRow: function (idx) {
                var cachedRow = this.rowsCache[idx];
                if (!cachedRow) {
                    this.rowsCache[idx] = cachedRow = this.addEmptyRow();
                }
                ;
                var d = this.options.source.localdata[this.firstDataRow + idx];
                cachedRow.data('GridRows', d);
                this.fillVirtualRow(idx);
                cachedRow.show();
            },

            updatePosition: function (y) {
                this.firstDataRow = Math.floor(-y / this._rowHeight);
                if (this.firstDataRow < 0)
                    this.firstDataRow = 0;
                console.log(this.firstDataRow);
                this.renderData();
            },

            renderData: function (trigger) {
                //this._bodyTable.append(this._fackeHeader);
                if (!this._topDiv) {
                    this._topDiv = $(this._fackeHeader[0].outerHTML);//$('<tr><td class="is-margin"/><td colspan="' + this._colCount + '"/><td class="is-margin"/></tr>');//
                    this._bodyTable.append(this._topDiv);
                }
                ;
                if (this.options.columns.length == 0) {
                    this._bodyTable.empty();
                    return;
                }
                ;


                for (var j = 0; j < this.getVisibleRange(); j++) {
                    this.updateRenderedRow(j);
                }
                ;

                for (j = j; j < this.rowsCache.length; j++)
                    this.rowsCache[j].hide();

                if (!this._bottomDiv) {
                    this._bottomDiv = $('<tr style="height:0px"></tr>');
                    this._bodyTable.append(this._bottomDiv);
                }
                ;
                this._topDiv.height(this.firstDataRow * this._rowHeight);
                // отладка
                //$("#topDivH").html(this._topDiv.height());
                var rest = this.options.source.localdata.length - this.firstDataRow - this.getVisibleRange();
                if (rest > 0) rest *= this._rowHeight; else rest = 0;
                this._bottomDiv.height(rest);

                if (this.selectedrow.data || (('el' in this.selectedrow) && (this.selectedrow.el))) {
                    for (var j = 0; j < this.getVisibleRange(); j++) {
                        var r = this.rowsCache[j];
                        var d = r.data("GridRows");
                        if (d == this.selectedrow.data) {
                            r.attr('tabindex', 1);
                            r.addClass('is-check');
                            this.selectedrow = {data: d, el: r};
                            if (trigger || trigger === undefined)
                                this._trigger("selectrow", null, [d, r]);
                        } else {
                            if (r.hasClass('is-check')) {
                                r.removeClass('is-check');
                                r.attr('tabindex', null);
                                this._headTable.children('tr').attr('tabindex', null);
                            }
                        }
                    }
                    ;
                }
                ;

            },

            clear: function () {
                this._bodyTable.empty();
                this._headTable.empty();
                this.clearPageCache();
            },

            selectrow: function (id) {
                //if (this.selectedrow.data && id == this.selectedrow.data[this.options.source.id])
                //    return;
                var rows = this._bodyTable.find('tr');
                var found = false;
                for (var i = 0; i < rows.length; i++) {
                    var data = $(rows[i]).data('GridRows');
                    if (data && id == data[this.options.source.id]) {
                        this._selectrow($(rows[i]), false);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    for (var i = 0, len = this.options.source.localdata.length; i < len; i++) {
                        var item = this.options.source.localdata[i];
                        if (item[this.options.source.id] == id) {
                            this.selectedrow.data = item;
                            var visCount = this.getVisiblePortion();
                            var fRow = 0;
                            if (i + visCount >= this.options.source.localdata.length) {
                                fRow = this.options.source.localdata.length - visCount + 2;
                                if (fRow < 0) fRow = 0;
                            } else
                                fRow = i;
                            var newPos = this._rowHeight * fRow;
                            this._trigger("updateScroll", null, [-newPos]);
                            break;
                        }
                    }
                }
            },

            addrow: function (row, aftersel) {
                var that = this;
                var tr = $('<tr class="grid-tr-bh"></tr>');
                tr.click(function () {
                    that._selectrow($(this), true);
                });
                // чекбокс
                var td = $('<td class="grid-body-td-bh is-checkbox is-checkedcolumn" style="width:40px"><div class="checkbox-b is-bordered"><input type="checkbox"><div class="check-sign-e"></div></div></td>');
                if (!this.options.checkedColumn)
                    td.hide();
                tr.append(td);

                for (var i = 0; i < this.options.columns.length; i++) {
                    td = $('<td class="grid-body-td-bh"><div class="content-bhl"></div></td>');
                    var datafield = this.options.columns[i].datafield;
                    tr.data('GridRows', row);
                    if (row[datafield] !== undefined)
                        td.children('.content-bhl').html(row[datafield]);
                    tr.append(td);
                }

                if (aftersel && ('el' in this.selectedrow)) {
                    var rows = this._bodyTable.find('tr');
                    for (var i = 0; i < rows.length; i++) {
                        var data = $(rows[i]).data('GridRows');
                        if (this.selectedrow.data[this.options.source.id] == data[this.options.source.id]) {
                            this.options.source.localdata.splice(i + 1, 0, row);
                            break;
                        }
                    }
                    this.selectedrow.el.after(tr);
                } else
                    this._bodyTable.append(tr);

                return tr;
            },

            delrow: function (id) {
                for (var i = 0; i < this.options.source.localdata.length; i++) {
                    // уберем элемент с заданным id из датасета, дальше рендер разберется
                    if (id == data[this.options.source.id]) {
                        this.options.source.localdata.splice(i, 1);
                        this.renderData();
                        break;
                    }
                }
                // var rows = this._bodyTable.find('tr');
                // for(var i=0;i<rows.length;i++){
                // var data = $(rows[i]).data('GridRows');
                // if (id == data[this.options.source.id]){
                // $(rows[i]).remove();
                // this.options.source.localdata.splice(i, 1);
                // break;
                // }
                // }
            },

            refreshrow: function (row) {
                var rows = this._bodyTable.find('tr');
                for (var i = 0; i < rows.length; i++) {
                    var tr = $(rows[i]);
                    var data = tr.data('GridRows');
                    if (row[this.options.source.id] == data[this.options.source.id]) {
                        var tds = tr.find("td");
                        for (var j = 0; j < this.options.columns.length; j++) {
                            var td = tds.eq(j + 1);
                            var datafield = this.options.columns[j].datafield;
                            if (row[datafield])
                                td.children('.content-bhl').html(row[datafield]);
                        }
                        this.options.source.localdata[i] = row;
                        tr.data('GridRows', row);
                        break;
                    }
                }
            },

            getcolumn: function (datafield) {
                var column = null;
                if (this.options.columns) {
                    $.each(this.options.columns, function () {
                        if (this.datafield == datafield) {
                            column = this;
                            return false;
                        }
                    });
                }
                return column;
            },

            getcolumnEl: function (datafield) {
                var column = null;
                var th = this._headTable.children('th');
                $.each(th, function () {
                    var data = $(this).data('GridHeaders');
                    if (data.type == 'item' && data.data.datafield == datafield) {
                        column = this;
                        return false;
                    }
                });
                return column;
            },
            // метод не изменился, но стал немного опаснее: валидность выделенного элемента верна только до следующего рендера, то есть - недолго
            getselectedrow: function () {
                if ('el' in this.selectedrow) {
                    return this.selectedrow;
                }
                return null;
            },

            getheadrow: function () {
                return this._headTable.children('tr');
            },

            _addeventsheaders: function (headers) {
                var that = this;
                headers.click(function (event) {
                    var data = $(this).data('GridHeaders');
                    if (data.type == 'item') // если не чекбокс
                        that._sort($(this));
                });
            },

            _sort: function (obj) {
                var data = obj.data('GridHeaders').data;
                if (data.datafield == this.sort.datafield) // если тот же датафилд
                    this._sortBy(obj, data.datafield, this.sort.dir == 'asc' ? 'desc' : 'asc');
                else
                    this._sortBy(obj, data.datafield, this.options.sortdir)
            },

            _sortBy: function (obj, datafield, dir) {
                // убираем сортировку
                if (this.sort.el)
                    this.sort.el.removeClass('is-checked is-arrow-down is-arrow-up');

                // выставляем сортировку
                if (dir == 'asc')
                    obj.addClass('is-checked is-arrow-up');
                else
                    obj.addClass('is-checked is-arrow-down');

                // сохраняем данные
                this.sort = {el: obj, datafield: datafield, dir: dir};

                // сообщаем сервису об необходимости сортировки
                //this._trigger("sort", null, [datafield, dir]);
            },

            _selectrow: function (obj, trigger) {
                var data = obj.data('GridRows');
                // просто устанавливаем новую выделенную строку, присваивая ее data в selectedrow
                this.selectedrow = {data: data, el: obj};
                // полный рендер сам разберется, где убрать выделение, где поставить
                this.renderData(trigger);
                if (trigger || (trigger === undefined))
                    this._trigger("selectrow", null, [data, obj]);
            },

            _setcolumnproperty: function (datafield, propertyname, value) {
                if (datafield == null || propertyname == null || value == null)
                    return null;

                var column = this.getcolumn(datafield);
                if (column == null)da
                    return false;

                column[propertyname] = value;

                switch (propertyname) {
                    case "text":
                        var columnEl = this.getcolumnEl(datafield);
                        $(columnEl).children('.th-text-be').html(value);
                        break;
                }
                return true;
            },

            setcolumnproperty: function (datafield, propertyname, value) {
                this._setcolumnproperty(datafield, propertyname, value);
            },

            setPageable: function (value) {
                var paginator = this._grid.children('.grid-paginator-b');
                this.options.pageable = value;
                if (value) {
                    this._grid.addClass('is-footer');
                    paginator.show();
                }
                else {
                    this._grid.removeClass('is-footer');
                    paginator.hide();
                }
            },

            setCheckedColumn: function (ok) {
                this.options.checkedColumn = ok;
                if (ok)
                    this.element.find('.is-checkedcolumn').show();
                else
                    this.element.find('.is-checkedcolumn').hide();
            },

            setLayout: function (layout) {
                this.options.layout = layout;
                this._grid.removeClass(this.layouts.join(' ')).addClass(this.layouts[layout]);
            },

            setLineHeight: function (value) {
                this.options.lineHeight = value;
                this._grid.removeClass(this.lineHeights.join(' ')).addClass(this.lineHeights[value]);
            },

            setDataset: function (value) {
                this.options.ds = value;
            },

            setHint: function (value) {
                this._grid.attr('title', value);
            },

            // Этот метод вызывается для изменения настроек плагина
            _setOption: function (key, value) {
                switch (key) {
                    // предпринимаем действия по изменению свойства
                    //break;
                    case "pageable":
                        this.setPageable(value);
                        break;
                    case "checkedColumn":
                        this.setCheckedColumn(value);
                        break;
                    case "layout":
                        this.setLayout(value);
                        break;
                    case "lineHeight":
                        this.setLineHeight(value);
                        break;
                    case "dataset":
                        this.setDataset(value);
                        break;
                    case "hint":
                        this.setHint(value);
                        break;
                }

                // UI 1.9 для этого достаточно вызвать метод _super
                this._super("_setOption", key, value);
            },

            // деструктор - метод, который будет вызван при удалении плагина с элемента.
            destroy: function () {

            }
        });
    });