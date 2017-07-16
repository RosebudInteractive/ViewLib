define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/gContainer.html'
        , '/scripts/viewsets/vbase.js'],
    function(template, tpl, Base) {
        var vGContainer = {};
        for (var i in Base)
            vGContainer[i] = Base[i];
        vGContainer._templates = template.parseTemplate(tpl);
        vGContainer.render = function(options) {
            var lid = this.getLid();
            var item = $('#' + lid);
            if (item.length == 0) {
                var cm = this.getControlMgr();

                // объект контейнера
                var pItem = $(vGContainer._templates['container']).attr('id', "mid_" + lid);
                item = pItem.children(".control").attr('id', this.getLid());
                var cont = item.children(".c-content");

                var columns = this.getCol('Columns');
                var rows = this.getCol('Rows');
                var cells = this.getCol('Cells');

                // получаем инфоданные из столбцов и строк
                var rowsComps = [], columnComps = [];
                for(var i=0; i<rows.count();i++) {
                    var row = cm.get(rows.get(i).getGuid());
                    var height = row.height();
                    if ($.isNumeric(height)) height+='px';
                    rowsComps.push({height: height});
                }
                for(var i=0; i<columns.count();i++) {
                    var column = cm.get(columns.get(i).getGuid());
                    var width = column.width();
                    if ($.isNumeric(width)) width+='px';
                    columnComps.push({width: width, IsSeparator: column.isSeparator()});
                }

                // создаем объект грида
                var tableEl = $('<table></table>');

                // Заголовок
                if (this.title()) {
                    var title = $(vGContainer._templates['title']);
                    title.find(".cont-title-text").append($("<h2>" + this.title() +"</h2>"));
                    if (columns.count() > 2)
                        title.find(".g-container-title-fill").attr("colspan", columns.count() - 1);
                    tableEl.append(title);
                }

                for(var i=0; i<rowsComps.length;i++) {
                    var columnEl = $('<tr></tr>');
                    for(var j=0; j<columnComps.length;j++) {
                        var rowEl = $('<td><div class="c-content"></div></td>').attr('id', 'td_'+lid+'_'+j+'_'+i).css({height: rowsComps[i].height, width: columnComps[j].width});
                        columnEl.append(rowEl);
                        if (columnComps[j].IsSeparator)
                            rowEl.addClass("col-separator");
                    }
                    tableEl.append(columnEl);
                }

                // объеденяем ячейки
                for(var i=0; i<cells.count();i++) {
                    var column = cm.get(cells.get(i).getGuid());
                    var left = column.left(), top = column.top(), width = column.width(), height = column.height();
                    if (width || height) {
                        var cell = tableEl.find('#td_'+lid+'_'+left+'_'+top);
                        if (width) {
                            cell.attr('colspan', width);
                            for(var cellRight=left+1; cellRight<left+width; cellRight++)
                                tableEl.find('#td_'+lid+'_'+cellRight+'_'+top).addClass('splittcell');
                        }
                        if (height){
                            cell.attr('rowspan', height);
                            for(var rowBottom=top+1; rowBottom<top+height; rowBottom++)
                                tableEl.find('#td_'+lid+'_'+left+'_'+rowBottom).addClass('splittcell');
                        }
                    }
                }
                tableEl.find('.splittcell').remove();

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = cm.get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_'+child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    var cell = tableEl.find('#td_'+lid+'_'+child.left()+'_'+child.top());
                    cell.children('.c-content').append(div);
                }

                // добавляем табличку
                cont.append(tableEl);

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + lid: options.rootContainer;
                $(parent).append(pItem);

                item.find(".cont-title-icon").click(function () {
                    var table = $(this).parent().parent().parent().parent().parent();
                    if (table.hasClass("collapsed"))
                        table.children().children("tr").not(".container-title").show();
                    else
                        table.children().children("tr").not(".container-title").hide();
                    table.toggleClass("collapsed");
                });

                setTimeout(function() {
                    console.log("setTimeout GContainer");
                    item.find("tr.container-title").children().each(function () {
                        $(this).width($(this).width());
                    });
                }, 100);

            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            $(window).on("genetix:resize", function () {
                var childs = that.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = that.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('#ext_' + child.getLid());
                    div.children().css("height", div.height());
                }
            });

            vGContainer._setVisible.call(this);
            vGContainer._genEventsForParent.call(this);
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vGContainer._genEventsForParent = function() {
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
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        return vGContainer;
    }
);