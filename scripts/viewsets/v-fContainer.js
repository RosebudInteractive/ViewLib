/**
 * Created by levankiknadze on 12/02/2017.
 */

define(
    ['text!./templates/fContainer.html', '/scripts/viewsets/v-container.js'
        , "flex-container"],
    function(tpl, VContainer) {
        const vFlexContainer = class vFlexContainer extends VContainer {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                var vSet = this;
                // объект контейнера
                var allItems = $(this._templates['container']);
                allItems.attr('data-id', "mid_" + component.getLid());
                // добавляем в парент
                var parent = component.getParentComp() ? '#ch_' + component.getLid() : options.rootContainer;
                $(parent).append(allItems);

                var item = allItems.children(".control").attr('id', component.getLid())

                var isRoot = component.hasGrid();
                component._isRoot = isRoot;

                if (isRoot) {
                    component._rows = [];
                    component._childrenGenerators = [];
                } else
                    component._rows = null;

                // верхний отступ
                var hRow = this.getRow(component, item);
                var hEl = $(this._templates['HEADER']).attr("id", "top-margin-" + component.getLid());
                var hObj = this.getObj(component, "true,", hRow, hEl);

                // Заголовок контейнера
                if (component.title()) {
                    var tRow = this.getRow(component, item);
                    var lbEl = $(this._templates['CONT_LABEL']).attr("id", "cont-label-" + component.getLid());
                    var tObj = this.getObj(component, "true,", tRow, lbEl);
                    tObj.label = component.title();
                    tObj.element.find(".control.label").text(component.title());
                    tObj.isVisible = true;
                }

                var row = this.getRow(component, item);

                // создаем врапперы для чайлдов
                var childs = component.getCol('Children');
                for (var i = 0; i < childs.count(); i++) {
                    var child = component.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var curStr = child.layoutProp();

                    // если конец строки, то добавляем новый row
                    var curStrParts = curStr.trim().split(",");

                    var div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children().attr('id', 'ch_' + child.getLid());
                    var ch = this.getObj(component, curStr, row, div);
                    ch.width = child.width();
                    ch.isLabel = child.className == "GenLabel";
                    ch.lid = child.getLid();
                    ch.isVisible = (child.visible() === undefined ? true : child.visible());

                    if (curStrParts[curStrParts.length - 1].length >= 2 &&
                        curStrParts[curStrParts.length - 1].toUpperCase().trim().substr(0, 2) == "BR") {
                        var brSign = curStrParts[curStrParts.length - 1];
                        row.grow = brSign.toUpperCase().indexOf("(TRUE)") >= 0
                        row = this.getRow(component, item);
                        row.grow = false;
                    }

                    div.on("genetix:childPropChanged", function (event, data) {
                        vSet.handleChildChanged(component, event, data);
                        return false;
                    });
                }

                // нижний отступ
                var fRow = this.getRow(component, item);
                var fEl = $(this._templates['HEADER']).attr("id", "bottom-margin-" + component.getLid());
                var fObj = this.getObj(component, "true,", fRow, fEl);

                var wOptions = {};
                wOptions._rows = component._rows;
                wOptions._childrenGenerators = component._childrenGenerators;
                wOptions._isRoot = component._isRoot;
                wOptions._isRootFlex = this.isRootFlex(component);
                wOptions._maxColWidth = component.maxColWidth();
                wOptions._minColWidth = component.minColWidth();
                wOptions._columnsCount = component.columnsCount();
                wOptions._padding = component.padding();
                wOptions._parentFlex = this.getParentFlex(component);
                wOptions._templates = this._templates;
                wOptions._lid = component.getLid();
                wOptions.recalculated = function () {
                    component._recalculated = true;
                    vSet._genEventsForParent(component);
                }
                component._containerWidget = item.genetixFlexContainer(wOptions);

                component._recalculated = true;
                var serOptions = this.serializeOptions(component, wOptions);
                console.log(serOptions);
                console.log(JSON.stringify(serOptions));

                component._onGenetixResize = function () {
                    var childs = component.getCol('Children');
                    for(var i=0; i<childs.count();i++) {
                        var child = component.getControlMgr().get(childs.get(i).getGuid());
                        if (!child.left) continue;
                        var div = $('#ext_' + child.getLid());
                        div.children().css("height", div.height());
                    }
                }

                $(window).on("genetix:resize", component._onGenetixResize);

                return allItems;

            }

            initItem(pItem, component) {
                // убираем удаленные объекты
                var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                for (var guid in del)
                    $('#ext_' + del[guid].getLid()).remove();
                //component._recalculated = true;
                this._setVisible(component);
                this._genEventsForParent(component);
            }

            destroyUI(item, component) {
                $(window).off("genetix:resize", component._onGenetixResize);
            }

            /**
             * Оповещение парента об изменениях пропертей
             * @private
             */
            _genEventsForParent(component) {
                var genEvent = false;
                var changedFields = {};
                if (component._recalculated) { changedFields.Height = true; genEvent = true; }
                component._recalculated = false;
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
                    $('#ext_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }

            serializeOptions(component, options) {
                var serOptions = {
                    _rows: options._rows == null ? null : [],
                    _childrenGenerators: [],
                    _isRoot: options._isRoot,
                    _isRootFlex: options._isRootFlex,
                    _maxColWidth: options._maxColWidth,
                    _minColWidth: options._minColWidth,
                    _columnsCount: options._columnsCount,
                    _padding: options._padding,
                    _parentFlex: null,
                    _parentFlexId: (options._parentFlex ? options._parentFlex.attr("id") : null),
                    _templates: options._templates,
                    _lid: options._lid
                };

                if (options._rows) {
                    for (var i = 0; i < options._rows.length; i++) {
                        var row = options._rows[i];
                        var newRow = {
                            element: null,
                            children: [],
                            grow: row.grow,
                            container: row.container,
                            id: row.id
                        }
                        serOptions._rows.push(newRow);

                        for (var j = 0; j < row.children.length; j++) {
                            var child = row.children[j];
                            var newChild = {
                                element: null,
                                width: child.width,
                                doNotBreak: child.doNotBreak,
                                grow: child.grow,
                                isEmpty: child.isEmpty,
                                isPadding: child.isPadding,
                                isMultyLine: child.isMultyLine,
                                isLabel: child.isLabel,
                                id: child.id
                            };

                            newRow.children.push(newChild);
                        }
                    }
                }
                return serOptions;
            }

            getObj(component, curStr, rowObj, el, pos) {
                var elObj = null;
                if (curStr != "EMPTY" && curStr != "PADDING") {
                    var srcStr = curStr.trim();
                    //var tCurStr = srcStr.toUpperCase();
                    var parts = srcStr.split(",");
                    var stretch = parts[0];
                    rowObj.element.append(el);
                    elObj = {
                        element: el,
                        width: 0,
                        //minColumns: minCols,
                        doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
                        grow: (stretch === "true" ? true : (stretch == "" ? null : false)),
                        isEmpty: false,
                        isMultyLine: false,
                        isLabel: false,
                        id: (el.attr("id") ? el.attr("id") : null)
                    };
                    rowObj.children.push(elObj);
                } else if (curStr == "EMPTY") {
                    el = $(this._templates[curStr]);
                    if (pos == -1)
                        rowObj.element.prepend(el);
                    else
                        el.insertAfter(rowObj.children[pos].element);

                    elObj = {
                        element: el,
                        width: 0,
                        doNotBreak: false,
                        grow: true,
                        isEmpty: true,
                        isPadding: (curStr == "PADDING"),
                        isMultyLine: false
                    };
                    rowObj.children.push(elObj);
                } else {
                    el = $(this._templates[curStr]);
                    if (pos == -1)
                        rowObj.element.parent().parent().prepend(el);
                    else
                        rowObj.element.parent().parent().append(el);

                    elObj = {
                        element: el,
                        width: 0,
                        doNotBreak: false,
                        grow: true,
                        isEmpty: true,
                        isPadding: (curStr == "PADDING"),
                        isMultyLine: false
                    };
                }
                return elObj;
            }

            isRootFlex(component) {
                var result = true;
                var parent = component.getParentComp();
                while (parent && result) {
                    if (parent.className != "FContainer") {
                        result = true;
                        break;
                    }
                    else if (parent.hasGrid()) result = false;
                    parent = parent.getParentComp();
                }

                return result;
            }

            getParentFlex(component) {
                var result = component;
                var parent = component.getParentComp();
                while (parent) {
                    if (parent.className != "FContainer") {
                        break;
                    }
                    else if (parent.hasGrid()) {
                        result = parent;
                        break;
                    }
                    parent = parent.getParentComp();
                }

                return this.getWidget(result);
            }

            getWidget(component) {
                return component._containerWidget;
            }

            getContainerWithGrid(component) {
                var result = null;
                if (component.hasGrid()) result = component;
                else {
                    var parent = component.getParentComp();
                    while (parent && !result) {
                        if (parent.className != "FContainer") break;
                        else if (parent.hasGrid()) result = parent;
                        else parent = parent.getParentComp();
                    }
                }

                return result;
            }

            getRow(component, parent) {
                var row = $(this._templates["row"]);
                var contEl = parent.children(".c-content")
                contEl.append(row);

                var rowObj = {
                    element: row,
                    children: [],
                    grow: false,
                    container: {}
                };
                var fCont = this.getContainerWithGrid(component);

                var rowId = "f-row" + component.getLid() + "-" + fCont._rows.length;
                row.attr("id", rowId);
                rowObj.id = rowId;

                fCont._rows.push(rowObj);
                return rowObj;
            }

            handleChildChanged(component, event, data) {
                if (!("Visible" in data.properties) && !("Height" in data.properties)) return;
                var child = data.control;
                if ("Height" in data.properties) {
                    var height = child.height() || "auto";
                    var div = $("#ext_" + child.getLid())
                    var chDiv = div.children();
                    chDiv.css("height", "");
                    if (height != "auto") {
                        if ($.isNumeric(height))
                            height += "px";
                        else if (height.length > 0 && height[height.length - 1] == "%") {
                            height = "auto";
                        }
                        div.css({
                            "height": height
                        });
                    } else {
                        var chEDiv = $("#" + child.getLid());
                        div.css({
                            "min-height" : "",
                            "height": ""
                        });
                        div.css({
                            "min-height" : chEDiv.height(),
                            "height": chEDiv.height()
                        });
                    }
                }
                if ("Visible" in data.properties) {
                    var fWidg = this.getWidget(component);
                    var vis = (child.visible() === undefined ? true : child.visible());
                    fWidg.genetixFlexContainer("visible", child.getLid(), vis);
                }
                this.getParentFlex(component).trigger("genetix:flexRecalculate");
            }

        }
        return vFlexContainer;
    }
);