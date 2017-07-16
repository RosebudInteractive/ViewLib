/**
 * Created by kiknadze on 14.03.2016.
 */

define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/formDesigner.html'
        , '/scripts/viewsets/vbase.js', './propEditors/propEditorManager'],
    function(template, tpl, Base, PropEditManager) {
        var KEYCODE_ESC = 27;
        var KEYCODE_DEL = 46;
        var KEYCODE_INS = 45;
        var KEYCODE_C = 67;
        var KEYCODE_V = 86;
        var KEYCODE_X = 88;
        var vDesigner = {};
        var ToolbarModes = { pointer: 0, vertical: 1, horizontal: 2, layer: 3, control: 4, existingControl: 5, layout: 6, changeLayout: 7};
        var DesignerModes = {both: 0, designer: 1, form: 2};
        var MARGIN_TOP = 18;
        var MARGIN_BUT = 6;
        var MARGIN_LEFT = 9;
        var MARGIN_RIGHT = 0;
        var MIN_CTRL_H = 10;
        var MIN_CTRL_W = 0;
        var MIN_LAYOUT_HEIGHT = 54;
        var MIN_LAYOUT_W = 0;
        var FIXED_SCALE = 3;
        var START_COLOR1 = 0x36;
        var START_COLOR2 = 0x42;
        var START_COLOR3 = 0x57;
        var COLOR_INC1 = 5;
        var COLOR_INC2 = 9;
        var COLOR_INC3 = 23;
        var CELL_SPACING = 6;
        var FIXED_COEF = 2;

        var autoHeight = 150;
        for (var i in Base)
            vDesigner[i] = Base[i];

        vDesigner._templates = template.parseTemplate(tpl);
        vDesigner.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            var cont = null;
            if (item.length == 0) {
                that._toolbarMode = ToolbarModes.pointer;
                this._renderInfo = {};
                this._mode = DesignerModes.both;
                this._controlToolbarVisible = true;
                // обйъект контенера
                var pItem = $(vDesigner._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                cont = item.children(".c-content");
                cont.attr("tabIndex", "1");

                pItem.height($(parent).height());
                this._snap = Snap(cont.find(".designer-content").find("svg")[0]);
                this._global = this._snap.group();
                cont.bind("keydown", function(e) {
                    vDesigner._onKeyPress.call(that, e);
                });
                this._dragElGroup = this._snap.group();
                this._dragEl = this._snap.rect(0, 0, 20, 20);
                this._dragElGroup.add(this._dragEl);
                this._dragEl.addClass("invisible");
                this._dragElGroup.attr("display", "none");

                var pComp = that.getParentComp();
                var children = pComp.getCol("Children");

                item.find(".designer-left").children(".v-container").height(item.find(".designer-left").height());
                var svg = item.find(".designer-content").find("svg");
                svg.height(svg.parent().parent().height() - 5);

                $(window).on("genetix:resize", function () {
                    var stDate = new Date();
                    var cont = item.find(".gen-form").children(".v-container").children(".c-content");
                    var fContent =  cont.children(".control-wrapper");
                    fContent.width(0);
                    cont.width(0);
                    cont.width(item.find(".designer-right").width());
                    fContent.width(that._widthPointer + "px");

                    var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
                    $(p).css("height", "");
                    $(p).css("height", $(p).parent().height());
                    var pp = $("#mid_" + that.getLid());
                    pp.css("height", "");
                    pp.css("height", $(p).height());

                    item.find(".designer-left").children(".v-container").height(item.find(".designer-left").height());
                    item.find(".designer-right").children(".v-container").height(item.find(".designer-right").height());
                    item.find(".gen-form").children(".v-container").css("height", "");
                    setTimeout(function() {
                        item.find(".gen-form").children(".v-container").height(item.find(".gen-form").height());
                    }, 0);

                    var left = item.find(".designer-left");
                    var hide = left.width() != 0;
                    if (hide) {
                        var curLayout = that.currentLayout();
                        vDesigner._recalcLayoutMinDimensions.call(that, curLayout);
                        vDesigner._renderLayout.call(that, that.currentLayout());
                    }
                    var bb = that._global.getBBox();
                    var svg = item.find(".designer-content").find("svg");
                    svg.height(bb.height);

                    vDesigner._refreshScroll.call(that);

                    vDesigner._renderTabsToolbar.call(that);
                    vDesigner._renderToolbar.call(that);

                    var enDate = new Date();
                    console.log("form designer render time: ", enDate - stDate);
                });

                setTimeout(function() {
                    vDesigner._initSource.call(that);
                }, 0);

            } else {
                pItem = $("#mid_" + this.getLid());
                cont = item.children(".c-content");
            }

            if (this.getForm().currentControl() == this) cont.focus();

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

            if (this.height() == "auto")
                item.css({height: "auto"});

            if (this.getParentComp() && !this.getParentComp().getParentComp()) {
                if (this.getParentComp().isCentered() === undefined || !this.getParentComp().isCentered()) {
                    var cont2 = item.children(".c-content");
                    cont2.css("padding", "0");
                }
                item.addClass("m-container")
            }

            item.find(".designer-left").children(".v-container").height(item.find(".designer-left").height());
            item.find(".designer-right").children(".v-container").height(item.find(".designer-right").height());
            item.find(".gen-form").children(".v-container").css("height", null);
            setTimeout(function() {
                item.find(".gen-form").children(".v-container").height(item.find(".gen-form").height());
            }, 0);

            var ctrlsDiv = item.find(".designer-toolbar.controls");
            if (this.getCol("Layouts").count() <= 1) ctrlsDiv.hide();
            else ctrlsDiv.show();

            // создаем врапперы для разметок
            var left = item.find(".designer-left");
            var hide = left.width() != 0;
            if (hide) {
                var curLayout = this.currentLayout();
                vDesigner._recalcLayoutMinDimensions.call(this, curLayout);
                vDesigner._renderLayout.call(this, curLayout);
            }
            var bb = that._global.getBBox();
            var svg = item.find(".designer-content").find("svg");
            svg.height(bb.height);

            vDesigner._setVisible.call(this);
            vDesigner._genEventsForParent.call(this);
            var layout = this.currentLayout();
            vDesigner._handleResize.call(this, layout);
            vDesigner._renderPropEditor.call(this);
            vDesigner._renderModel.call(this);
            vDesigner._renderToolbar.call(this);
            vDesigner._setToolbarEvents.call(this);
            vDesigner._renderTabsToolbar.call(this);


            for (var i in this._renderInfo) {
                var info = this._renderInfo[i];
                if (!vDesigner._isInCurrentLayout.call(this, info.control ? info.control : info.layout)) {
                    info.group.remove();
                    delete this._renderInfo[i];
                }
            }

            var cont2 = item.children(".c-content").find(".gen-form").children(".control.v-container.container").children(".c-content");
            cont2.width(cont2.parent().width());
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                    cont2.append(div);
                }

                div.css({width: this._widthPointer ? this._widthPointer : "100%", height: "100%"});
            }

            if (this.hasChanges()) item.find(".refresh-button").show();
            else item.find(".refresh-button").hide();

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();

            vDesigner._refreshScroll.call(this);
        };

        vDesigner._initSource = function() {
            var col = this.getCol("PropertySources");
            var that = this;
            this.getControlMgr().userEventHandler(that, function () {
                that._initPropertiesDataSource();
                PropEditManager.setPropSource(that._PropDM);
            });
        }

        vDesigner._renderModel = function() {
            var item = $("#" + this.getLid());
            var model = this.getModel();
            var div = item.find(".model-content");
            /*div.empty();
            if (model) {
                div.append("<h2>" + model.resElemName() + "</h2>");
                var ul = $("<ul/>");
                var col = model.getCol("Datasets");
                for (var i = 0; i < col.count(); i++)
                    ul.append("<li>" + col.get(i).resElemName() + "</li>");
                div.append(ul);
            }*/
        };

        vDesigner._renderTabsToolbar = function() {
            var that = this;
            var item = $("#" + this.getLid());
            var ctrlsDiv = item.find(".designer-toolbar.controls").children();
            var mainToolbar = item.find(".designer-toolbar.tabs");
            var toolContent = mainToolbar.children(".system-panel-section-left.layouts");
            var btnContent = mainToolbar.children(".system-panel-section-left.buttons");
            var allSize = mainToolbar.width();// - btnContent.width();
            if (Math.floor(allSize) == allSize) allSize--;
            var col = this.getCol("Layouts");
            var lCount = col.count();
            var minSizes = vDesigner._getRootsByMinSize.call(that);
            var coeff = allSize/minSizes.length;

            var infin = String.fromCharCode(0x221E);
            var prevT = null;
            var prevRootL = null;
            var takedSize = 0;
            for (var i in minSizes) {
                var l = minSizes[i];
                var t = $("#tab_" + l.getLid());
                if (t.length == 0) {
                    var str = vDesigner._templates["tab"];
                    var t = $(str);
                    t.attr("id", "tab_" + l.getLid());
                    t.attr("guid", l.getGuid());
                    if (!prevT)
                        toolContent.prepend(t);
                    else
                        prevT.after(t);

                    t.click(function () {
                        var g = $(this).attr("guid");
                        var c = that.getCol("Layouts");
                        var toSetL = c.get(c.indexOfGuid(g));
                        that.getControlMgr().userEventHandler(that, function () {
                            that.currentLayout(toSetL);
                            if (that.getForm().currentControl() != that)
                                that.setFocused();
                        });
                    });

                    t.find("div[role='delete']").click(function() {
                        var p = $(this).parent().parent().parent();
                        var guid = p.attr("guid");
                        vDesigner._deleteRootLayout.call(that, guid);
                        that.getControlMgr().userEventHandler(that, function () {
                            if (that.getForm().currentControl() != that)
                                that.setFocused();
                        });
                    });

                    var toVal = t.find("div.to-value");
                    toVal.find("input").change(function (e) {
                        var p = $(this).parent().parent().parent();
                        var guid = p.attr("guid");
                        var val = $(this).val();
                        var role = $(this).attr("role");
                        var res = vDesigner._setDimension.call(that, guid, val, role);
                        var tv = $(this).parent().parent();
                        tv.removeClass("edit-mode");
                        tv.find(".value-l").text($(this).val() + "px");
                        if (!res) e.preventDefault = true;
                    }).keydown(function (e) {
                        if(e.which == 13)
                            $(this).change();
                    });

                    toVal.draggable({
                        axis: "x",
                        containment: toolContent,
                        drag: function(e) {
                            if (that._draggable) {
                                if (!coeff) coeff = 1;

                                var p = that._draggable.target.parent().parent();
                                var next = p.next();
                                var offX = e.screenX - that._draggable.ex;
                                if ((offX > 0 && next.width() - 35 > offX) ||
                                    (offX < 0 && p.width() - 35 > offX)) {
                                    next.width(that._draggable.nw - offX);
                                    p.width(that._draggable.w + offX);
                                }
                                if (Math.abs(offX) > 2) {
                                    that._dragEnd = true;
                                    that._draggable.delta = offX;

                                    var guid = p.attr("guid");
                                    var col = that.getCol("Layouts");
                                    var tab = col.get(col.indexOfGuid(guid));
                                    that._draggable.target.text((+tab.maxTargetWidth() + Math.floor(that._draggable.delta/coeff)) + "px");
                                }
                            }
                        },
                        start: function(e) {
                            var p = $(e.target).parent();
                            var next = p.next();
                            that._draggable = { target: $(e.target).find(".value-l"), w: p.width(), nw: next.width(),  ex: e.screenX, ey: e.screenY, delta: 0 };
                        },
                        stop: function(e) {
                            if (that._draggable) {
                                var p = that._draggable.target.parent().parent();
                                var next = p.next();
                                var offX = e.screenX - that._draggable.ex;
                                if ((offX > 0 && next.width() - 35 > offX) ||
                                    (offX < 0 && p.width() - 35 > offX)) {
                                    next.width(that._draggable.nw - offX);
                                    p.width(that._draggable.w + offX);
                                }
                                if (Math.abs(offX) > 2) {
                                    that._dragEnd = true;
                                    that._draggable.delta = offX;

                                    var guid = p.attr("guid");
                                    var col = that.getCol("Layouts");
                                    var tab = col.get(col.indexOfGuid(guid));
                                    that._draggable.target.text((+tab.maxTargetWidth() + Math.floor(that._draggable.delta/coeff)) + "px");
                                    that.getControlMgr().userEventHandler(that, function () {
                                        tab.maxTargetWidth(+tab.maxTargetWidth() + Math.floor(that._draggable.delta/coeff));
                                    });

                                }
                            }
                        }
                    });

                    toVal.find(".value-l").click(function () {
                        if (!that._dragEnd) {
                            $(this).parent().addClass("edit-mode");
                        } else
                            that._dragEnd = false;
                    });

                    t.find(".arrows.left").click(function(e) {
                        vDesigner._addRootLayout.call(that, $(this).parent().attr("guid"));
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                } else {
                    var toVal = t.find("div.to-value");
                    toVal.css({left: "", right: "-1.5em"});
                }

                if (i == minSizes.length - 1) t.css("border-right", "none");
                else t.css("border-right", "");

                if (lCount == 1) t.find("div[role='delete']").hide();
                else t.find("div[role='delete']").show();

                var toVal = t.find("div.to-value");
                var s = l.maxTargetWidth();
                t.find(".controls").find(".icon").hide();
                if (s === undefined || s == null)
                    t.find(".controls").find(".icon.pc").show();
                else if (+s < 320)
                    t.find(".controls").find(".icon.phone").show();
                else if (+s < 768)
                    t.find(".controls").find(".icon.tablet-v").show();
                else if (+s < 1024)
                    t.find(".controls").find(".icon.tablet-h").show();
                else
                    t.find(".controls").find(".icon.pc").show();
                var txt = s + "px";
                if (s === undefined || s == null) txt = "";
                toVal.find(".value-l").text(txt);
                toVal.find("input").val(txt.replace("px", ""));

                if (l == this.currentLayout()) t.addClass("active");
                else t.removeClass("active");

                var prevW = prevRootL ? +prevRootL.maxTargetWidth() : 0;
                var tSize = +(l.maxTargetWidth() ? l.maxTargetWidth() : minSizes.length) - prevW;
                var tw = Math.floor(tSize * coeff) - 1;
                if (i == minSizes.length - 1)
                    tw = allSize - takedSize - lCount + 1;
                takedSize += tw;
                t.width(tw);
                prevT = t;
                prevRootL = l;
            }

            //if (t) t.width(allSize - oneSize * (lCount - 1));

            // убираем удаленные объекты
            var del = this.getLogCol('Layouts') && 'del' in this.getLogCol('Layouts')? this.getLogCol('Layouts').del: {};
            for (var guid in del)
                $('#tab_' + del[guid].getLid()).remove();

            btnContent.children(".system-toolbar-icon.button").off("click").click(function() {
                vDesigner._addRootLayout.call(that);
            });

            if (this._widthPointer === undefined)
                this._widthPointer = Math.floor(minSizes.length/2);
            var pointer = toolContent.find(".width-pointer");
            if (this._widthPointer < 0) this._widthPointer = 0;
            if (this._widthPointer >= minSizes.length) this._widthPointer = minSizes.length -1;

            var x = Math.floor(this._widthPointer*coeff);
            pointer.css("left", x + "px");
            pointer.find(".label").text(this._widthPointer + "px");

            if (!this._dragPointer) {
                this._dragPointer = pointer.draggable({
                    axis: "x",
                    containment: toolContent,
                    drag: function(e, obj) {
                        if (coeff == 0) coeff = 1;
                        var minSizes = vDesigner._getRootsByMinSize.call(that);
                        var w = 0;
                        var left = obj.position.left;
                        var val = Math.floor(left/coeff);
                        pointer.find(".label").text(val + "px");
                        that._widthPointer = val;
                    },
                    stop: function() {
                        $(window).trigger("genetix:resize");
                    }
                });
            }
        }

        vDesigner._setDimension = function(guid, val, role) {
            var propName = role == "from-val" ? "minTargetWidth" : "maxTargetWidth";
            var that = this;
            var c = that.getCol("Layouts");
            var toSetL = c.get(c.indexOfGuid(guid));

            val = +val.replace("px", "");

            that.getControlMgr().userEventHandler(that, function () {
                toSetL.maxTargetWidth(val);
                that._isRendered(false);
                that.hasChanges(true);
            });

            return true;
        }

        vDesigner._deleteRootLayout = function(guid) {
            var that = this;
            var c = that.getCol("Layouts");
            var toSetL = c.get(c.indexOfGuid(guid));
            that.getControlMgr().userEventHandler(that, function () {
                var minSizes = vDesigner._getRootsByMinSize.call(that);
                var isLast = minSizes[minSizes.length - 1] == toSetL;
                var isCurrent = that.currentLayout() == toSetL;
                c._del(toSetL);
                var newCur = null;
                if (isCurrent) {
                    var startIdx = toSetL.maxTargetWidth() || minSizes.length - 1;
                    for (var i = startIdx - 1; i >= 0; i--)
                        if (minSizes[i]) {
                            newCur = minSizes[i];
                            break;
                        }

                    if (!newCur) {
                        for (var i = startIdx + 1; i < minSizes.length; i++)
                            if (minSizes[i]) {
                                newCur = minSizes[i];
                                break;
                            }
                    }

                    that.currentLayout(newCur);
                }

                if (isLast) {
                    var minSizes = vDesigner._getRootsByMinSize.call(that);
                    if (minSizes[minSizes.length - 1])
                        minSizes[minSizes.length - 1].maxTargetWidth(null);
                }

                that._isRendered(false);
                that.hasChanges(true);
            });
        }

        vDesigner._getRootsByMinSize = function() {
            var col = this.getCol("Layouts");
            var lCount = col.count();
            var minSizes = [];
            var undefL = null;
            for(var i = 0; i < lCount; i++) {
                var l = col.get(i);
                if (l.maxTargetWidth() == null || l.maxTargetWidth() === undefined)
                    undefL = l;
                else
                    minSizes[l.maxTargetWidth()] = l;
            }
            if (undefL) {
                minSizes[minSizes.length + 1000] = undefL;
            }

            return minSizes;

        }

        vDesigner._addRootLayout = function(beforeLGuid) {
            var that = this;
            var dir = "vertical";
            var newGuid = Utils.guid();
            var sObj = {
                "$sys": {
                    "guid": newGuid,
                    "typeGuid": UCCELLO_CONFIG.classGuids.Layout
                },
                "fields": {
                    "Id": newGuid,
                    "Name": newGuid,
                    "Width": "100%",
                    "Height": "100%",
                    "ResElemName": "Layout_" + that.getDB().getNewLid(),
                    "Direction": dir
                }
            };

            var colName = "Layouts";
            var parent = {
                colName: colName,
                obj: that
            };
            var mg = that.getGuid();

            that.getControlMgr().userEventHandler(that, function () {
                var minSizes = vDesigner._getRootsByMinSize.call(that);
                var col = that.getCol("Layouts");
                var beforeL = col.get(col.indexOfGuid(beforeLGuid));
                if (!beforeL) return;
                var afterL = null;

                var beforeSize = beforeL.maxTargetWidth() ? +beforeL.maxTargetWidth() : minSizes.length - 1;
                for (var i = beforeSize - 1; i >= 0; i--) {
                    if (minSizes[i]) {
                        afterL = minSizes[i];
                        break;
                    }
                }

                var afterSize = afterL ? +afterL.maxTargetWidth() : 0;

                sObj.fields.MaxTargetWidth = Math.floor(afterSize + (beforeSize - afterSize)/2);

                var db = that.getDB();
                var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);

                // Логгируем добавление поддерева
                var newObj = sObj;
                var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                that.getLog().add(o);
                that.logColModif("add", colName, resObj);
                that.currentLayout(resObj);
                that.getControlMgr().allDataInit(resObj);
                that.cursor(resObj);

                that._isRendered(false);
                that.hasChanges(true);
            });
        }

        vDesigner._renderToolbar = function() {
            var that = this;
            var item = $("#" + this.getLid());
            var ctrlsDiv = item.find(".designer-toolbar.controls").children(".system-panel-section-left");
            var mainToolbar = item.find(".designer-toolbar.main");

            var controls = this.getCol("Controls");
            var dots = item.find(".designer-toolbar.controls").find(".is-dots");
            var btnsWidth = 0;
            var availableWidth = item.find(".designer-toolbar.controls").width() - 36;

            this._hiddenControls = [];

            for (var i = 0; i < controls.count(); i++) {
                var control = controls.get(i);

                var opt = ctrlsDiv.children(".ext-control[guid='" + control.getGuid() +"']");
                if (opt.length == 0) {
                    var className = "icon-control";

                    switch (control.typeGuid()) {
                        case UCCELLO_CONFIG.classGuids.GenDataGrid:
                            className = "grid";
                            break;
                        case UCCELLO_CONFIG.classGuids.Toolbar:
                            className = "toolbar";
                            break;
                        case UCCELLO_CONFIG.classGuids.GenForm:
                            className = "form";
                            break;
                        case UCCELLO_CONFIG.classGuids.DbTreeView:
                            className = "tree";
                            break;
                    }

                    var ctrlStr = vDesigner._templates["button"];
                    ctrlStr = ctrlStr.replace("<<ICON_NAME>>", className)
                        .replace("<<CONTROL_NAME>>", control.resElemName())
                        .replace("<<CONTROL_NAME>>", control.resElemName())
                        .replace("<<GUID>>", control.getGuid());

                    var opt = $(ctrlStr);
                    ctrlsDiv.append(opt);
                    //opt.insertBefore(dots);
                    btnsWidth += opt.width();
                    if (btnsWidth >= availableWidth) {
                        opt.hide();
                        this._hiddenControls.push(control);
                    }
                } else {
                    opt.show();
                    btnsWidth += opt.width();
                    if (btnsWidth >= availableWidth) {
                        opt.hide();
                        this._hiddenControls.push(control);
                    } else opt.show();
                }

                if (vDesigner._isInCurrentLayout.call(this, control)) opt.addClass("disabled");
                else opt.removeClass("disabled");
            }

            if (btnsWidth >= availableWidth) dots.show();
            else dots.hide();


            ctrlsDiv.children(".ext-control").each(function() {
                var guid = $(this).attr("guid");
                if (controls.indexOfGuid(guid) === undefined)
                    $(this).remove();
            });

            var lPanel = mainToolbar.find("[role='changeLayout']");
            lPanel.empty();

            var layouts = this.getCol("Layouts");
            for (var i = 0; i < layouts.count(); i++) {
                var layout = layouts.get(i);
                var opt = $('<div class="button icon-layout" role="ext-layout" title="' + layout.resElemName() + '" value="'+ layout.getGuid() + '"></div>');
                lPanel.append(opt);
                if (this.currentLayout() == layout)
                    opt.addClass("active");
            }

            var propsPanel = mainToolbar.find(".props-wrapper[role='layout-props']");
            var orient = item.find(".orient-icon");
            var curr = this.cursor();
            var info = curr ? this._renderInfo[curr.getLid()] : null;

            if (info && !info.control) {
                var dimName = "width";
                var p = info.layout.getParentComp();
                if (p == that || p.direction() == "vertical") dimName = "height";
                var sizeVal = info.layout[dimName]() || 0;
                var unitVal = sizeVal == 0 ? "units" : "auto";
                if (sizeVal != "auto") {
                    if (String(sizeVal).indexOf("%") >= 0) {
                        sizeVal = +(sizeVal.replace("%", ""));
                        unitVal = "*";
                    } else if (String(sizeVal).indexOf("px") >= 0 || String(sizeVal).indexOf("em") >= 0 ) {
                        sizeVal = +(sizeVal.replace("px", "").replace("em", ""));
                        unitVal = "px";
                    }
                }
                propsPanel.children().find("input[role='size']").val(sizeVal);
                propsPanel.children().find("div[role='units']").text(unitVal);

                propsPanel.find("select[role='transform']").val(info.layout.direction());

                if (info.layout.getParentComp() != this) {
                    var lStr = "Width";
                    if (info.layout.getParentComp().direction() == "vertical") lStr = "Height";
                    propsPanel.children(".size-label").text(lStr);
                }

                var dir = info.layout.direction();
                orient.children().hide();
                orient.children("." + dir).show();
            }


            vDesigner._enableToolbarButtons.call(this);



            if (!this._orientPopup) {
                var popupDiv = $("<div role='orient-popup'/>");
                $("body").append(popupDiv);
                this._orientPopup = popupDiv.genetixPopup({
                    buttonControl: orient,
                    offsetX: -25,
                    offsetY: 3,
                    click: function (event, data) {
                        var cur = that.cursor();
                        if (!cur) return;
                        var info = that._renderInfo[cur.getLid()];
                        if (info.layout.control()) return;
                        var newDir = "vertical";
                        if (data.id.indexOf("horizontal") >= 0) newDir = "horizontal";
                        else if (data.id.indexOf("layer") >= 0) newDir = "layer";
                        that.getControlMgr().userEventHandler(that, function () {
                            info.layout.direction(newDir);
                            var col = info.layout.getCol("Layouts");
                            for (var i = 0; i < col.count(); i++) {
                                var l = col.get(i);
                                if (newDir == "horizontal") l.height("100%");
                                else if (newDir == "vertical") {
                                    if (info.layout.height() == "auto") l.height("auto");
                                    else l.height("100%");
                                } else {
                                    if (info.layout.height() == "auto") l.height("auto");
                                    else l.height("100%");
                                    l.width("100%");
                                }
                            }
                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                            //case "units": vDesigner._changeSize.call(that); break;
                    },
                    leftIcons: true,
                    rightIcons: false,
                    bigArrowInterval: true,
                    leftViewBoxSize: 16,
                    extendedClass: "is-gray-menu",
                    menuItems: [{
                        id: "vertical-menu_" + this.getLid(),
                        title: "Вертикально",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#arrows_vertical",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "horizontal-menu_" + this.getLid(),
                        title: "Горизонтально",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#arrows_horizontal",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "layer-menu_" + this.getLid(),
                        title: "Слоями",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#layer",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }]
                });
            }

            var units = item.find(".units");
            if (!this._unitsPopup) {
                var popupDiv = $("<div role='orient-popup'/>");
                $("body").append(popupDiv);
                this._unitsPopup = popupDiv.genetixPopup({
                    buttonControl: units,
                    offsetX: -25,
                    offsetY: 3,
                    click: function (event, data) {
                        var text = data.id.split("-")[0];
                        if (text == "parts") text = "*";
                        vDesigner._changeSize.call(that, text);
                    },
                    leftIcons: false,
                    rightIcons: false,
                    bigArrowInterval: true,
                    leftViewBoxSize: 16,
                    extendedClass: "is-gray-menu",
                    menuItems: [{
                        id: "px-menu_" + this.getLid(),
                        title: "px",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "parts-menu_" + this.getLid(),
                        title: "*",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "auto-menu_" + this.getLid(),
                        title: "auto",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }]
                });
            }

            if (!this._deletePopup) {
                var popupDiv = $("<div role='delete-popup'/>");
                $("body").append(popupDiv);
                this._deletePopup = popupDiv.genetixPopup({
                    buttonControl: null,
                    offsetX: 20,
                    offsetY: 3,
                    click: function (event, data) {
                        var text = data.id;
                        var guid = data.custom.buttonControl.attr("guid");
                        var col = that.getCol("Controls");
                        var ctrl  = col.get(col.indexOfGuid(guid));
                        if (text.indexOf("del-menu-layout") >= 0) {
                            that.getControlMgr().userEventHandler(that, function () {
                                var info = that._renderInfo[ctrl.getLid()];
                                var lCol = that.getCol("Layouts");
                                for (var i = 0; i < lCol.count(); i++)
                                    vDesigner._deleteFromLayout(lCol.get(i), ctrl);
                                col._del(ctrl);
                                that._isRendered(false);
                                that.hasChanges(true);
                            });
                        } else if (text.indexOf("del-menu-all") >= 0) {
                            that.getControlMgr().userEventHandler(that, function () {
                                while (col.count() > 0) {
                                    ctrl = col.get(0);
                                    var info = that._renderInfo[ctrl.getLid()];
                                    var lCol = that.getCol("Layouts");
                                    for (var i = 0; i < lCol.count(); i++)
                                        vDesigner._deleteFromLayout(lCol.get(i), ctrl);
                                    col._del(ctrl);
                                }
                                that._isRendered(false);
                                that.hasChanges(true);
                            });
                        } else {
                            that.getControlMgr().userEventHandler(that, function () {
                                var lCol = that.getCol("Layouts");
                                while (lCol.count() > 1) lCol._del(lCol.get(0));
                                var curL = lCol.get(0);
                                curL.maxTargetWidth(null);

                                while (col.count() > 0) {
                                    ctrl = col.get(0);
                                    vDesigner._deleteFromLayout(curL, ctrl);
                                    col._del(ctrl);
                                }

                                var lCol = curL.getCol("Layouts");
                                while (lCol.count() > 0) lCol._del(lCol.get(0));

                                that.currentLayout();
                                that._isRendered(false);
                                that.hasChanges(true);
                            });
                        }
                    },
                    leftIcons: false,
                    rightIcons: false,
                    bigArrowInterval: true,
                    leftViewBoxSize: 16,
                    extendedClass: "is-gray-menu",
                    menuItems: [{
                        id: "del-menu-layout-" + this.getLid(),
                        title: "Delete",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "del-menu-all-" + this.getLid(),
                        title: "Delete all",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }, {
                        id: "clear-form-" + this.getLid(),
                        title: "Clear form",
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#userInfo",
                        leftIconColor: "#ffffff",
                        custom: {}
                    }]
                });
            }

            if (!this._controlsDotsPopup) {
                var popupDiv = $("<div role='delete-popup'/>");
                $("body").append(popupDiv);
                this._controlsDotsPopup = popupDiv.genetixPopup({
                    buttonControl: dots,
                    offsetX: -17,
                    offsetY: -20,
                    click: function (event, data) {
                        var control = data.custom.control;
                        var isInCurrent = vDesigner._isInCurrentLayout.call(that, control);
                        if (isInCurrent) return;
                        var guid = control.getGuid();
                        var cur = that.cursor();
                        if (cur) {
                            var info = that._renderInfo[cur.getLid()];
                            if (info.layout.getCol("Layouts").count() == 0 && !info.layout.control()) {
                                that.getControlMgr().userEventHandler(that, function () {
                                    info.layout.control(guid);
                                    that._isRendered(false);
                                    that.hasChanges(true);
                                });
                            }
                        }
                    },
                    leftIcons: true,
                    rightIcons: false,
                    bigArrowInterval: true,
                    leftViewBoxSize: 16,
                    extendedClass: "is-gray-menu",
                    menuItems: []
                });
            }

            var curControlsVisible = controls.count() > 0 && layouts.count() > 1;
            if (curControlsVisible != this._controlToolbarVisible) {
                this._controlToolbarVisible = curControlsVisible;
                if (curControlsVisible) {
                    ctrlsDiv.parent().height(61);
                    item.find(".prop-edit").height(item.find(".prop-edit").height() - 61);
                } else {
                    ctrlsDiv.parent().height(0);
                    item.find(".prop-edit").height(item.find(".prop-edit").height() + 61);
                }
            }
        };

        vDesigner._enableToolbarButtons = function() {
            var that = this;
            var item = $("#" + this.getLid());
            var mainToolbar = item.find(".designer-toolbar.main");
            var curr = this.cursor();
            var info = curr ? that._renderInfo[curr.getLid()] : null;
            mainToolbar.children(".button").each(function() {
                var role = $(this).attr("role");

                var enabled = info;
                var lCount = info ? info.layout.getCol("Layouts").count() : 0;
                switch (role) {
                    case "vertical":
                        enabled = curr && !(info.layout.control()) && (lCount == 0 || curr.direction() == "vertical");
                        break;
                    case "horizontal":
                        enabled = curr && !(info.layout.control()) && (lCount == 0 || curr.direction() == "horizontal");
                        break;
                    case "layer":
                        enabled = curr && !(info.layout.control()) && (lCount == 0 || curr.direction() == "layer");
                        break;
                    case "control-grid":
                    case "control-toolbar":
                    case "control-form":
                    case "control-tree":
                        enabled = curr && !(info.layout.control()) && lCount == 0;
                        break;
                    case "delete": enabled = curr; break;
                    case "layout": enabled = true; break;
                    case "load-model": enabled = true; break;
                }

                if (enabled) $(this).removeClass("disabled");
                else $(this).addClass("disabled");

            });

            var propsPanel = mainToolbar.find(".props-wrapper[role='layout-props']");
            if (!info || info.control) propsPanel.hide();
            else propsPanel.show();

            if (info && info.layout.getParentComp() == this) {
                propsPanel.find("input[role='size']").attr("disabled", "true");
                propsPanel.find("select[role='units']").attr("disabled", "true");
            } else {
                propsPanel.find("input[role='size']").attr("disabled", null);
                propsPanel.find("select[role='units']").attr("disabled", null);
            }

            if (propsPanel.find("select[role='units']").val() == "auto")
                propsPanel.find("input[role='size']").attr("disabled", "true");

            if (info && (info.layout.control() || info.layout.getCol("Layouts").count() == 0))
                propsPanel.find("select[role='transform']").attr("disabled", "true");
            else
                propsPanel.find("select[role='transform']").attr("disabled", null);

            if (this.getModel()) item.find(".model-content").addClass("disabled");
            else item.find(".model-content").removeClass("disabled");
        }

        vDesigner._isInCurrentLayout = function(control) {
            if (!this.currentLayout()) return false;
            var info = this._renderInfo[control.getLid()];
            if (!info) return false;
            var colName = control.pvt.colName;
            var p = control.getParentComp();
            if (p.getCol(colName).indexOf(control) === undefined) return false;
            if (info.control) return vDesigner._layoutHasRefOn.call(this, this.currentLayout(), control);
            else {
                var l = info.layout;
                while (l.getParentComp() != this)
                    l = l.getParentComp();
                return l == this.currentLayout();
            }
        }

        vDesigner._layoutHasRefOn = function(layout, control) {
            if (layout.control() == control) return true;
            else {
                var col = layout.getCol("Layouts");
                var res = false;
                for (var i = 0; i < col.count(); i++) {
                    var l = col.get(i);
                    var res = vDesigner._layoutHasRefOn.call(this, l, control);
                    if (res) break;
                }
                return res;
            }
        }

        vDesigner._deleteFromLayout = function(layout, control) {
            if (layout.control() == control) {
                layout.control(null);
                return true;
            } else {
                var col = layout.getCol("Layouts");
                for (var i = 0; i < col.count(); i++) {
                    var l = col.get(i);
                    var res = vDesigner._deleteFromLayout.call(this, l, control);
                    if (res) break;
                }
                return res;
            }
        }

        vDesigner._setToolbarEvents = function() {
            var item = $("#" + this.getLid());
            var that = this;
            item.find(".designer-toolbar.main").find(".button").off("click").click(function() {
                if ($(this).hasClass("disabled")) return;
                var role = $(this).attr("role");
                if (role == "load-model") {
                    if (!that.getModel()) {
                        var pComp = that.getParentComp();
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = that.getDB();
                            var sObj = JSON.parse(vDesigner._templates["model"]);
                            var newObj = sObj;
                            var colName = "Children";
                            var p = {
                                colName: colName,
                                obj: pComp
                            };

                            var resObj = db.deserialize(sObj, p, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var mg = pComp.getGuid();
                            var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                            pComp.getLog().add(o);
                            pComp.logColModif("add", colName, resObj);
                            that.getControlMgr().allDataInit(resObj);
                            PropEditManager.setModel(resObj);
                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    }
                } else if (role == "vertical" || role == "horizontal" || role == "layer") {
                    var cur = that.cursor();
                    if (!cur) return;
                    var info = that._renderInfo[cur.getLid()];
                    if (info.layout.control()) return;
                    vDesigner._onAddLayoutClicked.call(that, cur, role);
                } else if (role == "control-grid" || role == "control-toolbar" || role == "control-form" || role == "control-tree") {
                    var cur = that.cursor();
                    if (!cur) return;
                    vDesigner._onAddControlClicked.call(that, cur, role);
                } else if ($(this).attr("role") != "delete") {
                    var toolbar = $(this).parent();
                    var active = true;
                    if ($(this).hasClass("active")) {
                        active = false;
                        that._toolbarMode = ToolbarModes.pointer;
                    }

                    if (active) {
                        toolbar.children().each(function () {
                            $(this).removeClass("active");
                        });
                        $(this).addClass("active");
                        that._toolbarMode = ToolbarModes[$(this).attr("role")];
                    } else
                        $(this).removeClass("active");
                } else if (that.cursor()) {
                    var cur = that.cursor();
                    var info = that._renderInfo[cur.getLid()];
                    if (info.control) {
                        that.getControlMgr().userEventHandler(that, function () {
                            info.layout.control(null);
                            that.cursor(info.layout);
                            //info.group.remove();
                            //delete that._renderInfo[cur.getLid()];
                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    } else {
                        that.getControlMgr().userEventHandler(that, function () {
                            var par = info.layout.getParentComp();
                            if (par == that) {
                                var col = info.layout.getCol("Layouts");
                                while (col.count() > 0) col._del(col.get(0));
                                info.layout.control(null);
                            } else {
                                var col = par.getCol("Layouts");
                                col._del(info.layout);
                                if (info.layout == that.currentLayout()) {
                                    that.currentLayout(null);
                                    that.cursor(null);
                                } else {
                                    var par = info.layout.getParentComp();
                                    that.cursor(par);
                                }
                            }

                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    }
                }
                that.getControlMgr().userEventHandler(that, function () {
                    if (that.getForm().currentControl() != that) that.setFocused();
                });
            });

            var ctrlsDiv = item.find(".designer-toolbar.controls").children();
            ctrlsDiv.children(".ext-control").click(function() {
                if ($(this).hasClass("disabled")) return;
                var guid = $(this).attr("guid");
                var cur = that.cursor();
                if (cur) {
                    var info = that._renderInfo[cur.getLid()];
                    if (info.layout.getCol("Layouts").count() == 0 && !info.layout.control()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var item = $("#" + that.getLid());
                            info.layout.control(guid);
                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    }
                }
            }).contextmenu(function (e) {
                var guid = $(this).attr("guid");
                that._deletePopup.genetixPopup("show", null, $(this));
                return false;
            });

            var lPanel = item.find(".designer-toolbar.main").find("[role='changeLayout']");
            lPanel.children().click(function() {
                var val = $(this).attr("value");
                that.getControlMgr().userEventHandler(that, function () {
                    that.currentLayout(val == -1 ? null : val);
                    that.cursor(null);
                    that._isRendered(false);
                    that.hasChanges(true);
                });
            });

            var propsPanel = item.find(".designer-toolbar.main").find(".props-wrapper[role='layout-props']");

            propsPanel.children().find("input").change(function() {
                vDesigner._changeSize.call(that);
            });

            item.find(".close-button").off("click").click(function () {
                var left = item.find(".designer-left");
                var right = item.find(".designer-right");

                var toggledButton = $(this).attr("role");

                var hide = that._mode != DesignerModes.form;
                item.find(".gen-form").show();

                var closeDesignerBtn = $(this).parent().children("[role='left']");
                var closeFormBtn = $(this).parent().children("[role='right']");

                var curDesignerVisible = that._mode == DesignerModes.both || that._mode == DesignerModes.designer;
                var curFormVisible = that._mode == DesignerModes.both || that._mode == DesignerModes.form;

                $(this).toggleClass("active");
                if (toggledButton == "left" && curDesignerVisible && !curFormVisible) {
                    closeFormBtn.toggleClass("active");
                } else if (toggledButton == "right" && !curDesignerVisible && curFormVisible) {
                    closeDesignerBtn.toggleClass("active");
                }

                var newMode;

                if (closeDesignerBtn.hasClass("active") && closeFormBtn.hasClass("active"))
                    newMode = DesignerModes.both;
                else if (closeDesignerBtn.hasClass("active"))
                    newMode = DesignerModes.designer;
                else if (closeFormBtn.hasClass("active"))
                    newMode = DesignerModes.form;

                var designer = item.find(".c-content.designer-content-wrp");

                if (that._mode == DesignerModes.both) {
                    if (newMode == DesignerModes.form) {
                        designer.css("overflow", "hidden");
                        left.css("min-width", 0);
                        left.animate({width: 0}, 300, function() {
                            $(window).trigger("genetix:resize");
                        });
                    } else {
                        designer.css("overflow", "visible");
                        designer.children(".side-padding").width(left.width());
                        designer.children(".side-padding").animate({width: left.parent().parent().width() - 32}, 300, function() {
                            $(window).trigger("genetix:resize");
                        });
                    }
                } else if (that._mode == DesignerModes.form && newMode == DesignerModes.designer) {
                    var w = 35*16;
                    //left.css("min-width", w);
                    designer.css("overflow", "hidden");
                    left.animate({width: w}, 300, function() {
                        designer.children(".side-padding").width(w);
                        designer.css("overflow", "visible");
                        designer.children(".side-padding").animate({width: left.parent().parent().width() - 32}, 300, function() {
                            $(window).trigger("genetix:resize");
                        });
                    });
                } else if (that._mode == DesignerModes.designer && newMode == DesignerModes.form) {
                    var allSize = right.width();
                    var w = 35*16;
                    designer.children(".side-padding").animate({width: w - 32}, 300, function() {
                        item.find(".gen-form").show();
                        designer.css("overflow", "hidden");
                        left.css("min-width", 0);
                        left.animate({width: 0}, 300, function() {
                            $(window).trigger("genetix:resize");
                        });
                    });
                } else if (that._mode == DesignerModes.form && newMode == DesignerModes.both) {
                    designer.css("overflow", "hidden");
                    var w = 35*16;
                    designer.children(".side-padding").width(w - 32);
                    left.animate({width: w}, 300, function() {
                        left.css("min-width", w);
                        $(window).trigger("genetix:resize");
                    });
                } else if (that._mode == DesignerModes.designer && newMode == DesignerModes.both) {
                    var w = 35*16;
                    designer.children(".side-padding").animate({width: w - 32}, 300, function() {
                        item.find(".gen-form").show();
                        $(window).trigger("genetix:resize");
                    });
                }

                that._mode = newMode;
            });

            item.find(".refresh-button").click(function() {
                that.getControlMgr().userEventHandler(that, function () {
                    that.generateFrom();
                    that._isRendered(false);
                });
            });

            item.find(".orient-icon").off("click").click(function () {
                that._orientPopup.genetixPopup("show", null, item.find(".orient-icon"));
            });

            item.find(".units").off("click").click(function () {
                that._unitsPopup.genetixPopup("show", null, item.find(".units"));
            });

            item.find(".model-content").off("click").click(function () {
                if (!that.getModel()) {
                    var pComp = that.getParentComp();
                    that.getControlMgr().userEventHandler(that, function () {
                        var db = that.getDB();
                        var cm = that.getControlMgr();
                        var rootGuid = "99b19dbb-12a2-7901-498e-904e69c01833";
                        cm.getRoots([rootGuid], { rtype: "res" }, function (guids) {

                            console.log("Request done: " + guids.guids[0]);

                            var db_tree = cm.getObj(guids.guids[0]);
                            var roots = db_tree.getTreeRoots();
                            console.log("tree roots", roots);

                            var datasets = {};
                            var datasetGuids = {};

                            function getFieldDefs(root, name, parent, callback) {
                                root.getFieldDefs(function (result) {
                                    datasetGuids[root.getGuid()] = parent;
                                    datasets[name] = {
                                        guid: root.getGuid(),
                                        parent: parent,
                                        fields: result
                                    }
                                    console.log(name + " fields: ", result);
                                    callback(root, name);
                                });
                            }

                            function getSources(root, name, callback) {
                                var sources = root.getDataSources();
                                console.log("Root sources", sources);
                                if (Object.keys(sources).length == 0) {
                                    callback();
                                    return;
                                }

                                for (var item in sources) {
                                    datasets[item] = null;
                                    getFieldDefs(sources[item], item, name, function(curRoot, curName) {
                                        getSources(curRoot, curName, callback);
                                    });
                                }
                            }


                            function finishRead() {
                                var found = false;
                                for (var item in datasets) {
                                    if (!datasets[item]) {
                                        found = true;
                                        setTimeout(finishRead, 0);
                                        break;
                                    }
                                }

                                console.log("finish read", datasets);
                                if (!found) {
                                    vDesigner._genDatamodel.call(that, rootGuid, datasets, datasetGuids);
                                }
                            }


                            for (var item in roots) {
                                datasets[item] = null;
                                var root = db_tree.getTreeRoot(item);
                                getFieldDefs(root, item, null, function(curRoot, curName) {
                                    getSources(curRoot, curName, function() {

                                    });
                                });
                            }

                            setTimeout(finishRead, 0);

                            /*var root = db_tree.getTreeRoot("DataTstCompany");

                            */
                        });

                    });
                }
            });

            var dots = item.find(".designer-toolbar.controls").find(".is-dots");
            dots.off("click").click(function (e) {
                var data = [];
                for (var i = 0; i < that._hiddenControls.length; i++) {
                    var control = that._hiddenControls[i];

                    var className = "icon-control";

                    switch (control.typeGuid()) {
                        case UCCELLO_CONFIG.classGuids.GenDataGrid:
                            className = "grid";
                            break;
                        case UCCELLO_CONFIG.classGuids.Toolbar:
                            className = "toolbar";
                            break;
                        case UCCELLO_CONFIG.classGuids.GenForm:
                            className = "form";
                            break;
                        case UCCELLO_CONFIG.classGuids.DbTreeView:
                            className = "tree";
                            break;
                    }

                    var item = {
                        id: "mi-hidden-cintrol-" + control.getLid(),
                        title: control.resElemName(),
                        subTree: [],
                        leftIcon: "/images/Genetix.svg#" + className,
                        leftIconColor: "#ffffff",
                        custom: {control: control}
                    };

                    data.push(item);
                }
                that._controlsDotsPopup.genetixPopup("show", data, $(this));
                return false;
            });
        };

        vDesigner._genDatamodel = function(rootGuid, datasets, treeGuids) {
            var datasetGuids = {};

            for (var it in datasets) {
                datasetGuids[it] = Utils.guid();
            }

            var lid = this.getDB().getNewLid();
            var sObj = {
                "$sys": {
                    "guid": Utils.guid(),
                    "typeGuid": UCCELLO_CONFIG.classGuids.ADataModel
                },
                "fields": {
                    "Id": lid,
                    "Name": "DataModel_" + lid,
                    "ResElemName": "ADataModel_" + lid
                },
                "collections": {
                    "Datasets": []
                }
            };

            for (var dsName in datasets) {
                lid = this.getDB().getNewLid();
                var dsInfo = datasets[dsName];
                var dsObj = {
                        "$sys": {
                            "guid": datasetGuids[dsName],
                            "typeGuid": UCCELLO_CONFIG.classGuids.Dataset
                        },
                        "fields": {
                            "Id": lid,
                            "ObjectTree": {
                                "guidRes": rootGuid,
                                "guidElem": dsInfo.guid.split("@")[0]
                            },
                            "Name": dsName + "_" + lid,
                            "Active": true,
                            "ResElemName": dsName + "_" + lid,
                        },
                        "collections": {
                            "Fields": [
                            ]
                        }
                    };

                if (dsInfo.parent) {
                    dsObj.fields.Master = datasetGuids[dsInfo.parent];
                }

                for (var i = 0; i < dsInfo.fields.fields.length; i++) {
                    var fObj = {
                        "$sys": {
                            "guid": Utils.guid(),
                            "typeGuid": UCCELLO_CONFIG.classGuids.DataField
                        },
                        "fields": {
                            "Id": this.getDB().getNewLid(),
                            "Name": dsInfo.fields.fields[i].name,
                            "ResElemName": "fld_" + dsName + "_" + lid + "_" + dsInfo.fields.fields[i].name,
                            "FieldType": dsInfo.fields.fields[i].dataType.type,
                            "FieldLength": dsInfo.fields.fields[i].dataType.length,
                            "FieldPresision": dsInfo.fields.fields[i].dataType.precision
                        }
                    }

                    dsObj.collections.Fields.push(fObj);
                }


                sObj.collections.Datasets.push(dsObj);
            }

            var that = this;

            that.getControlMgr().userEventHandler(that, function () {
                var db = that.getDB();
                var colName = "Children";
                var pComp = that.getParentComp();
                var p = {
                    colName: colName,
                    obj: pComp
                };
                var newObj = sObj;

                var resObj = db.deserialize(sObj, p, db.pvt.defaultCompCallback);

                // Логгируем добавление поддерева
                var mg = pComp.getGuid();
                var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                pComp.getLog().add(o);
                pComp.logColModif("add", colName, resObj);
                that.getControlMgr().allDataInit(resObj);
                PropEditManager.setModel(resObj);
                that._isRendered(false);
                that.hasChanges(true);
            });

        };

        vDesigner._changeSize = function(text) {
            var item = $("#" + this.getLid());
            var that = this;
            var propsPanel = item.find(".designer-toolbar.main").find(".props-wrapper[role='layout-props']");
            var inpt = propsPanel.find("input[role='size']");
            var val = text;
            if (!$.isNumeric(inpt.val()) && inpt.val() != "auto") return;

            var cur = that.cursor();
            if (!cur) return;
            var info = that._renderInfo[cur.getLid()];
            if (info.control) return;

            var p = info.layout.getParentComp();
            if (p == that) return;

            if (p.direction() != "vertical" && val == "auto") return;

            var dimName = "width";
            if (p.direction() == "vertical") dimName = "height";

            var size = "auto";
            if (val != "auto") {
                if (!$.isNumeric(inpt.val())) inpt.val("100");
                if (val == "*") size = inpt.val() + "%";
                else size = inpt.val() + "px";
            }
            var s = size;

            var units = item.find(".units");
            units.children().text(text);

            that.getControlMgr().userEventHandler(that, function () {
                info.layout[dimName](s);

                if (text == "auto") {
                    var siblings = p.getCol("Layouts");
                    for (var i = 0; i < siblings.count(); i ++) {
                        var l = siblings.get(i);
                        if (l == cur) continue;
                        var size = l[dimName]();
                        if (size && String(size).indexOf("%") >= 0)
                            l[dimName]("100px");
                    }

                    var children = cur.getCol("Layouts");
                    for (var i = 0; i < children.count(); i ++) {
                        var l = children.get(i);
                        if (l == cur) continue;
                        var size = l[dimName]();
                        if (size && String(size).indexOf("%") >= 0)
                            l[dimName]("100px");
                    }
                } else if (text = "*") {
                    var siblings = p.getCol("Layouts");
                    for (var i = 0; i < siblings.count(); i ++) {
                        var l = siblings.get(i);
                        if (l == cur) continue;
                        var size = l[dimName]();
                        if (size && String(size).indexOf("%") >= 0)
                            l[dimName]("100px");
                    }

                    if (p.getParentComp() != that && p[dimName]() && String(p[dimName]()).indexOf("auto") >= 0) {
                        p[dimName]("100px");
                    }
                }

                that._isRendered(false);
                that.hasChanges(true);
            });

        }

        vDesigner._onAddControlClicked = function(cur, role) {
            var that = this;
            var info = that._renderInfo[cur.getLid()];
            var classGuids = UCCELLO_CONFIG.classGuids;
            if (info.layout.getCol("Layouts").count() != 0 || info.layout.control()) return;
            var ctrlGuid;
            switch (role) {
                case "control-grid": ctrlGuid = classGuids.GenDataGrid; break;
                case "control-toolbar": ctrlGuid = classGuids.Toolbar; break;
                case "control-form": ctrlGuid = classGuids.GenForm; break;
                case "control-tree": ctrlGuid = classGuids.DbTreeView; break;
                default:
                    ctrlGuid = classGuids.GenDataGrid;
            }


            var newGuid = Utils.guid();
            var sObj = {
                "$sys": {
                    "guid": newGuid,
                    "typeGuid": (
                        ctrlGuid == classGuids.GenDataGrid ? classGuids.DesignerDataGrid : classGuids.DesignerControl
                    )
                },
                "fields": {
                    "Id": newGuid,
                    "Name": newGuid,
                    "ResElemName": "DControl_" + that.getDB().getNewLid(),
                    "TypeGuid": ctrlGuid
                }
            };

            var colName = "Controls";
            var parent = {
                colName: colName,
                obj: that
            };
            var mg = that.getGuid();

            that.getControlMgr().userEventHandler(that, function () {
                var db = info.layout.getDB();
                var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);

                // Логгируем добавление поддерева
                var newObj = sObj;
                var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                info.layout.getLog().add(o);
                info.layout.logColModif("add", colName, resObj);

                info.layout.control(resObj);

                that.getControlMgr().allDataInit(resObj);
                that.cursor(resObj);

                that._addControlPropSource(resObj);

                that._isRendered(false);
                that.hasChanges(true);
            });
        }

        vDesigner._onAddLayoutClicked = function(cur, role) {
            var that = this;
            var info = that._renderInfo[cur.getLid()];
            if (info.layout.control()) return;
            var col = info.layout.getCol("Layouts");
            var chCount = col.count();
            var newGuid = Utils.guid();
            var dir = role;

            var sObj = {
                "$sys": {
                    "guid": newGuid,
                    "typeGuid": UCCELLO_CONFIG.classGuids.Layout
                },
                "fields": {
                    "Id": newGuid,
                    "Name": newGuid,
                    "Width": "100%",
                    "Height": "100%",
                    "ResElemName": "Layout_" + that.getDB().getNewLid(),
                    "Direction": dir
                }
            };

            var colName = "Layouts";
            var parent = {
                colName: colName,
                obj: info.layout
            };
            var mg = info.layout.getGuid();


            that.getControlMgr().userEventHandler(that, function () {
                var db = info.layout.getDB();
                var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);

                // Логгируем добавление поддерева
                var newObj = sObj;
                var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                info.layout.getLog().add(o);
                info.layout.logColModif("add", colName, resObj);

                that.getControlMgr().allDataInit(resObj);

                if (chCount == 0) {
                    info.layout.direction(dir);
                    newGuid = Utils.guid();
                    sObj = {
                        "$sys": {
                            "guid": newGuid,
                            "typeGuid": UCCELLO_CONFIG.classGuids.Layout
                        },
                        "fields": {
                            "Id": newGuid,
                            "Name": newGuid,
                            "Width": "100%",
                            "Height": "100%",
                            "ResElemName": "Layout_" + that.getDB().getNewLid(),
                            "Direction": dir
                        }
                    };

                    var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);
                    newObj = sObj;

                    var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                    info.layout.getLog().add(o);
                    info.layout.logColModif("add", colName, resObj);
                }

                that._isRendered(false);
                that.hasChanges(true);
            });

        }

        vDesigner._onKeyPress = function(e) {
            if (!this.cursor()) {
                return;
            }
            console.log(e);

            var that = this;

            if (e.which == KEYCODE_ESC) {
                var curLayout = this.cursor();
                var info = this._renderInfo[curLayout.getLid()];
                var parent = curLayout.getParentComp();
                if (info.control) parent = info.layout;
                if (parent != this)
                    vDesigner._moveCursor.call(this, this._renderInfo[parent.getLid()]);
                e.preventDefault();
                return false;
            } else if ((e.ctrlKey && (e.which == KEYCODE_INS || e.which == KEYCODE_C || e.which == KEYCODE_X)) ||
                (e.shiftKey && e.which == KEYCODE_DEL)
            ) {
                var info = this._renderInfo[this.cursor().getLid()];
                var serWrp = {};
                var isControl = info.control ? true : false;
                serWrp.isControl = isControl;
                var db = info.layout.getDB();
                if (isControl) {
                    var ser = db.serialize(info.control);
                    serWrp.control = ser;
                } else {
                    var ser = db.serialize(info.layout);
                    serWrp.layout = ser;
                    serWrp.controls = [];
                    var controls = this.getCol("Controls");
                    for (var i = 0; i < controls.count(); i++) {
                        var control = controls.get(i);
                        if (vDesigner._layoutHasRefOn.call(this, info.layout, control)) {
                            ser = db.serialize(info.layout);
                            serWrp.controls.push(ser);
                        }
                    }
                }

                this._tempClipboardPlace = JSON.stringify(serWrp);

                if ((e.shiftKey && e.which == KEYCODE_DEL) ||
                    (e.ctrlKey && e.which == KEYCODE_X)) {
                    if (isControl) {
                        that.cursor(info.layout);
                        vDesigner._deleteFromLayout(info.layout, info.control);
                    } else {
                        var par = info.layout.getParentComp();
                        if (par == that) {
                            var col = info.layout.getCol("Layouts");
                            while (col.count() > 0) col._del(col.get(0));
                            info.layout.control(null);
                        } else {
                            var col = par.getCol("Layouts");
                            col._del(info.layout);
                            if (info.layout == that.currentLayout()) {
                                that.currentLayout(null);
                                that.cursor(null);
                            } else {
                                var par = info.layout.getParentComp();
                                that.cursor(par);
                            }
                        }
                    }
                    that._isRendered(false);
                    that.hasChanges(true);
                }

                e.preventDefault();
                return false;
            } else if ((e.ctrlKey && e.which == KEYCODE_V) || (e.shiftKey && e.which == KEYCODE_INS)) {
                var cur = this.cursor();
                var info = this._renderInfo[cur.getLid()];
                if (info.control) return;

                if (this._tempClipboardPlace) {
                    var serWrp = null;
                    try {
                        serWrp = JSON.parse(this._tempClipboardPlace);
                        if (serWrp.isControl === undefined ||
                            (serWrp.isControl && serWrp.control === undefined) ||
                            (!serWrp.isControl && (serWrp.layout === undefined || serWrp.controls === undefined))
                        )
                            return;
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = that.getDB();
                            if (serWrp.isControl) {
                                var colName = "Controls";
                                var parent = {
                                    colName: colName,
                                    obj: that
                                };
                                var resObj = db.deserialize(serWrp.control, parent, db.pvt.defaultCompCallback);
                                var newObj = serWrp.control;
                                var mg = that.getGuid();

                                var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                                that.getLog().add(o);
                                that.logColModif("add", colName, resObj);
                                info.layout.control(resObj.getGuid());
                            }
                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    } catch (err) {
                        // ни чего не делаем, просто в клипборде находится что-то, что нам не подходит
                        console.log(err);
                    }

                }
            }
        };

        vDesigner._getLayoutLevel = function(layout) {
            var l = 0;
            var cur = layout;
            while (cur.getParentComp() != this) {
                cur = cur.getParentComp();
                l++;
            }
            return l;
        }

        vDesigner._getLayoutFillColor = function(layout) {
            if (!layout) return "#000000"
            var level = vDesigner._getLayoutLevel.call(this, layout);
            var color = "#" + (START_COLOR1 + level * COLOR_INC1).toString(16) +
                (START_COLOR2 + level * COLOR_INC2).toString(16) +
                (START_COLOR3 + level * COLOR_INC3).toString(16);
            return color;
        }

        vDesigner._renderLayout = function(layout) {
            if (!layout) return;
            var info = this._renderInfo[layout.getLid()];
            var parentGrp = this._global;
            var pComp = layout.getParentComp();
            if (pComp != this) parentGrp = this._renderInfo[pComp.getLid()].group;
            if (!info || !info.group) {
                if (!info) {
                    info = {};
                    this._renderInfo[layout.getLid()] = info;
                }

                info.group = this._snap.group();
                info.group.attr({id: layout.getLid()});
                info.invisible = this._snap.rect();
                info.invisible.addClass("invisible");
                info.border = this._snap.rect();
                info.border.addClass("border").addClass("d-layout");
                info.border.attr({rx: "5px", ry: "5px"});
                info.label = this._snap.text(MARGIN_LEFT + 20, MARGIN_TOP - 5, "");
                info.label.addClass("layer-header-text"); //.addClass("black");
                info.group.add(info.border, info.label, info.invisible);
                info.layout = layout;
                parentGrp.add(info.group);

                vDesigner._setEvents.call(this, info);
            }

            var color = vDesigner._getLayoutFillColor.call(this, layout);
            info.border.attr({fill: color});

            var headText = ""; //"O: " + (layout.direction() ? layout.direction() : "V")[0].toUpperCase();
            if (pComp != this) {
                headText += pComp.direction() == "horizontal" ? "W: " + layout.width() : "";
                headText += pComp.direction() == "vertical" ? "H: " + layout.height() : "";
                headText = headText.replace("%", "*");
            }
            if (info.label.attr("text") != headText)
                info.label.attr({text: headText});
            var oldX = info.dim.x, oldY = info.dim.y, oldH = info.dim.h, oldW = info.dim.w;

            var dims = vDesigner._getLayoutDimensions.call(this, layout);
            info.dim = dims;

            //if (oldX != dims.x || oldY != dims.y)
                info.group.attr({
                    transform: "translate(" + dims.x + "," + dims.y + ")"
                });

            if (oldW != dims.w || oldH != dims.h) {
                info.border.attr({width: dims.w, height: dims.h});
                info.invisible.attr({width: dims.w, height: dims.h});
            }


            if (this.cursor() == layout) info.group.addClass("cursor");
            else info.group.removeClass("cursor");

            if (pComp != this) {

                if (!info.icon || info.icon.direction != layout.direction()) {
                    if (info.icon) info.icon.remove();
                    var svgStr = vDesigner._templates["layer-icon"];
                    if (layout.direction() == "horizontal") svgStr = vDesigner._templates["arrows-horizontal"];
                    else if (layout.direction() == "vertical") svgStr = vDesigner._templates["arrows-vertical"];
                    info.icon = this._snap.group();
                    info.icon.direction = layout.direction();

                    var icon = Snap.parse(svgStr);
                    info.icon.add(icon);
                    info.icon.attr({
                        transform: "translate(" + MARGIN_LEFT + "," + 2 + ")"
                    });
                    info.group.add(info.icon);
                }
            }


            // если парент слоенный, то показываем только текущую закладку
            if (pComp != this && pComp.direction() == "layer") {
                var tabNum = pComp.tabNumber();
                var col = pComp.getCol("Layouts");
                if (col.indexOf(layout) == tabNum || (!tabNum && col.indexOf(layout) == 0)) {
                    info.group.attr({display: ""});
                } else {
                    info.group.attr({display: "none"});
                }
            } else { // вдруг она была невидимой
                info.group.attr({display: null});
            }


            if (layout.control()) {
                vDesigner._renderControl.call(this, layout);
            } else {
                var children = layout.getCol('Layouts');
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    vDesigner._renderLayout.call(this, child)
                }
            }

            // проверим вместились ли чилдрены
            if (!layout.control() && layout.direction() == "vertical") {
                var takedSize = MARGIN_TOP + MARGIN_BUT;
                var children = layout.getCol('Layouts');
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    takedSize += this._renderInfo[child.getLid()].dim.h;
                }
                if (takedSize > info.dim.h) {
                    info.dim.h = takedSize;
                    info.border.attr({width: dims.w, height: dims.h});
                    info.invisible.attr({width: dims.w, height: dims.h});
                }
            }

            // если разметка слоенная, то поверх разметок рисуем табы
            if (layout.direction() == "layer") {
                if (!info.tabs) {
                    info.tabs = {};
                    info.tabs.group = this._snap.group();
                    info.tabs.headers = {};
                    info.group.add(info.tabs.group);
                }

                var layouts = layout.getCol("Layouts");
                for (var i = 0; i < layouts.count(); i++) {
                    var l = layouts.get(i);
                    var nextColor = vDesigner._getLayoutFillColor.call(this, l);
                    var header = info.tabs.headers[l.getGuid()];
                    if (!header) {
                        header = {};
                        info.tabs.headers[l.getGuid()] = header;
                        header.rect = this._snap.rect(i * 20, y = 0, 20, MARGIN_TOP);
                        header.rect.addClass("layer-header");
                        header.text = this._snap.text(6 + i * 20, 13, i);
                        header.text.addClass("layer-header-text");
                        header.invisible = this._snap.rect(i * 20, y = 0, 20, MARGIN_TOP);
                        header.invisible.addClass("invisible");
                        info.tabs.group.add(header.rect, header.text, header.invisible);
                        vDesigner._setTabHeaderEvent.call(this, info, l);
                    }
                    header.rect.attr({fill: color});
                    if (layout.tabNumber() == i || (!layout.tabNumber() && i == 0)) {
                        header.rect.addClass("active");
                        header.rect.attr({fill: nextColor});
                    } else {
                        header.rect.removeClass("active");
                        header.rect.attr({fill: color});
                    }
                    header.text.attr({text: i});
                }

                for (var it in info.tabs.headers) {
                    if (layouts.indexOfGuid(it) === undefined) {
                        var header = info.tabs.headers[it];
                        header.rect.remove();
                        header.text.remove();
                        header.invisible.remove();
                    }
                }

                var bb = info.tabs.group.getBBox();
                info.tabs.group.attr({display: "none"});
                var bbP = info.group.getBBox();
                info.tabs.group.attr({display: null});

                info.tabs.group.attr({
                    transform: "translate(" + (bbP.width - bb.width) + ", 0)"
                });
            } else if (info.tabs) {
                info.tabs.group.remove();
                delete info.tabs;
            }

        };

        vDesigner._setTabHeaderEvent = function(info, layout) {
            var that = this;
            var header = info.tabs.headers[layout.getGuid()];
            header.invisible.click(function () {
                that.getControlMgr().userEventHandler(that, function () {
                    var col = info.layout.getCol("Layouts");
                    var i = col.indexOf(layout);
                    info.layout.tabNumber(i);
                    that._isRendered(false);
                    that.hasChanges(true);
                });
            });
        }

        vDesigner._renderControl = function(layout) {
            var control = layout.control();
            if (!control) return;
            var info = this._renderInfo[control.getLid()];
            var lInfo = this._renderInfo[layout.getLid()];
            var imgUrl = "/images/form-32.png";

            var iw = 22;
            switch (control.typeGuid()) {
                case UCCELLO_CONFIG.classGuids.GenDataGrid: imgUrl = "grid"; break;
                case UCCELLO_CONFIG.classGuids.Toolbar: imgUrl = "toolbar"; iw = 26; break;
                case UCCELLO_CONFIG.classGuids.GenForm: imgUrl = "form"; break;
                case UCCELLO_CONFIG.classGuids.DbTreeView: imgUrl = "tree"; break;

            }

            if (!info || !info.group) {
                if (!info) {
                    info = {};
                    this._renderInfo[control.getLid()] = info;
                }

                info.group = this._snap.group();
                info.group.addClass("d-control");
                info.group.attr({id: control.getLid()});
                info.invisible = this._snap.rect();
                info.invisible.addClass("invisible");
                info.border = this._snap.rect();
                info.border.addClass("border").addClass("d-control");
                info.border.attr({rx: "5px", ry: "5px"});
                info.border2 = this._snap.rect();
                info.border2.attr({rx: "5px", ry: "5px"});
                info.border2.addClass("border").addClass("d-control");
                info.largeIconGrp = this._snap.group();

                info.lTitle = this._snap.text(0, 35, control.resElemName());
                info.lTitle.addClass("c-title")
                info.smallIconGroup = this._snap.group();
                info.group.add(info.border, info.border2, info.largeIconGrp, info.smallIconGroup, info.invisible);
                info.largeIconGrp.add(info.lTitle);

                info.icon = this._snap.image("/images/" +imgUrl + "_" + iw + ".svg", 0, 0, iw, 22, null);
                info.largeIconGrp.add(info.icon);

                info.sTitle = this._snap.text(21, 12, control.resElemName());
                info.sTitle.addClass("c-title");
                info.smallIcon = this._snap.image("/images/" +imgUrl + ".svg", 0, 0, 16, 16, null);
                info.smallIconGroup.add(info.smallIcon, info.sTitle);

                info.layout = layout;
                info.control = control;
                var parentGrp = this._renderInfo[layout.getLid()].group;
                parentGrp.add(info.group);

                this._renderInfo[control.getLid()] = info;
                vDesigner._setControlEvents.call(this, info)
            } else {

                info.group.remove();
                lInfo.group.add(info.group);
                info.layout = layout;
            }

            var dims = vDesigner._getControlDimensions.call(this, layout);
            info.dim = dims;

            info.group.attr({
                transform: "translate(" + dims.x + "," + dims.y + ")"
            });
            info.border.attr({width: dims.w, height: dims.h});
            var tBB = lInfo.label.getBBox();
            info.border2.attr({
                x: tBB.width + 5 + MARGIN_LEFT + 22,
                y: -MARGIN_TOP,
                width: dims.w - tBB.width - 5 - MARGIN_LEFT - 22,
                height: MARGIN_TOP + 8});

            info.smallIconGroup.attr({
                transform: "translate(" + (tBB.width + 10 + MARGIN_LEFT + 22) + "," + (-MARGIN_TOP + 3) + ")"
            });

            info.invisible.attr({width: dims.w, height: dims.h});

            var bBB = info.border.getBBox();
            var liBB = info.largeIconGrp.getBBox();
            var x = bBB.width/2 - liBB.width/2;
            var y = bBB.height/2 - liBB.height/2;
            var displaySmall = (x <= 2 || y <= 2);
            info.largeIconGrp.attr({
                transform: "translate(" + x + "," + y + ")",
                display: displaySmall ? "none" : null
            });

            var lBB = info.lTitle.getBBox();
            info.icon.attr({x:lBB.width/2 - iw/2});
            info.largeIconGrp.add(info.icon);


            if (displaySmall) {
                info.smallIconGroup.attr({display: null});

                info.sTitle.attr({display: null});
                var slx = tBB.width + 10 + MARGIN_LEFT + 22;
                var text = control.resElemName();
                info.sTitle.attr({text: text});

                var sBB = info.smallIconGroup.getBBox();
                while (slx + sBB.width >= (info.dim.w - 5) && text != "") {
                    sBB = info.smallIconGroup.getBBox();
                    text = text.slice(0, -1);
                    info.sTitle.attr({text: text + "..."});
                }
                if (text == "") info.sTitle.attr({display: "none"});
            } else
                info.smallIconGroup.attr({display: "none"});

            if (this.cursor() == control) info.group.addClass("cursor");
            else info.group.removeClass("cursor");
        };

        vDesigner._setControlEvents = function(info) {
            var control = info.control;
            if (!control) return;

            var that = this;

            info.invisible.click(function(e) {
                //e.stopPropagation();
                //e.preventDefault();
                //return false;
            }).mousemove(function(event) {
                if (!that._resizeData) {
                    that._resizeData = {
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }
            }).mouseout(function (event) {
                if(that._resizeData && !that._resizeData.resizeStarted) {
                    that._resizeData = null;
                }
            }).drag(function (deltaX, deltaY, x, y, event) {
                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return false;
                if (!that._resizeData.resizeStarted && (Math.abs(deltaX) >= 5 || Math.abs(deltaY) >=5) ) {
                    var x = info.group.node.getBoundingClientRect().left - that._global.node.getBoundingClientRect().left;
                    var y = info.group.node.getBoundingClientRect().top - that._global.node.getBoundingClientRect().top;
                    that._dragElGroup.attr({
                        display: ""
                    });
                    info.group.attr({
                        transform: "translate(" + x + "," + y + ")"
                    });
                    that._resizeData.x = x;
                    that._resizeData.y = y;
                    that._dragElGroup.add(info.group);
                    that._resizeData.resizeStarted = true;
                } else if (!that._resizeData.resizeStarted)
                    return;

                info.group.attr({
                    transform: "translate(" + (that._resizeData.x + deltaX) + "," + (that._resizeData.y + deltaY) + ")"
                });
                that._resizeData.deltaX = deltaX;
                that._resizeData.deltaY = deltaY;
                //return false;
            }, function(/*x, y, event*/) {
                console.log("Drag start");
                vDesigner._moveCursor.call(that, info);
                that.getControlMgr().userEventHandler(that, function () {
                    if (that.getForm().currentControl() != that) that.setFocused();
                });

                //event.stopPropagation();
                //event.preventDefault();
                //return false;
            }, function (event) {
                console.log("Drag end");
                var p = info.layout;

                info.group.attr({display: "none"});
                var dropEl = Snap.getElementByPoint(event.clientX, event.clientY);
                info.group.attr({display: ""});
                var dropGrp = dropEl.parent();
                var dropLid = dropGrp.attr("id");
                var dropInfo = that._renderInfo[dropLid];
                if (dropInfo.layout != p) {
                    that.getControlMgr().userEventHandler(that, function () {
                        dropInfo.layout.control(info.control);
                        p.control(null);
                        that._isRendered(false);
                        that.hasChanges(true);
                    });
                } else {
                    dropInfo.group.add(info.group);
                    that.getControlMgr().userEventHandler(that, function () {
                        that._isRendered(false);
                    });
                }
                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return;// false;
                that._resizeData = null;
                //return true;
            });

        }

        vDesigner._recalcControlMinDimensions = function(layout) {
            var cInfo = this._renderInfo[layout.control().getLid()];
            var res = cInfo && cInfo.dim ? cInfo.dim : {};
            res.minW = MIN_CTRL_W;
            res.minH = MIN_CTRL_H;
            if (!cInfo) {
                cInfo = {};
                this._renderInfo[layout.control().getLid()] = cInfo;
            }
            cInfo.dim = res;
            return res;
        }

        vDesigner._getControlDimensions = function(layout) {
            var info = this._renderInfo[layout.control().getLid()];
            var lInfo = this._renderInfo[layout.getLid()];
            if (!info) {
                info = {};
                this._renderInfo[layout.control().getLid()] = info;
            }
            var res;
            if (info.dim) {
                res = vDesigner._recalcControlMinDimensions.call(this, layout);
                info.dim = res;
            }
            else res = info.dim;
            res.x = MARGIN_LEFT;
            res.y = MARGIN_TOP;
            res.w = lInfo.dim.w - (MARGIN_LEFT + MARGIN_RIGHT);
            res.h = lInfo.dim.h - (MARGIN_TOP + MARGIN_BUT);

            if (res.h < res.minH) res.h = res.minH;
            if (res.w < res.minW) res.w = res.minW;
            return res;
        }

        vDesigner._setEvents = function(info) {
            var that = this;
            info.invisible.click(function(e) {
                console.log("Layout click");
                if (that._toolbarMode == ToolbarModes.pointer) {
                    var target = info.control || info.layout;
                    if (that._renderInfo[target.getLid()])
                        vDesigner._moveCursor.call(that, info);
                } else {
                    var item = $("#" + that.getLid());
                    var toolbar = item.find(".designer-toolbar.main");

                    toolbar.children().each(function() {
                        $(this).removeClass("active");
                    });
                    that._toolbarMode = ToolbarModes.pointer;

                }
                that.getControlMgr().userEventHandler(that, function () {
                    if (that.getForm().currentControl() != that) that.setFocused();
                });
                //e.stopPropagation();
                //e.preventDefault();
                //return false;
            }).mousemove(function(event) {
                if (!that._resizeData) {
                    that._resizeData = {
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }
            }).mouseout(function (event) {
                if(that._resizeData && !that._resizeData.resizeStarted) {
                    that._resizeData = null;
                }
            }).drag(function (deltaX, deltaY, x, y, event) {
                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return false;
                var p = info.layout.getParentComp();
                if (p == that) return;
                if (!that._resizeData.resizeStarted && (Math.abs(deltaX) >= 5 || Math.abs(deltaY) >=5) ) {
                    var x = info.group.node.getBoundingClientRect().left - that._global.node.getBoundingClientRect().left;
                    var y = info.group.node.getBoundingClientRect().top - that._global.node.getBoundingClientRect().top;
                    that._dragElGroup.attr({
                        display: ""
                    });
                    info.group.attr({
                        transform: "translate(" + x + "," + y + ")"
                    });
                    that._resizeData.x = x;
                    that._resizeData.y = y;
                    that._dragElGroup.add(info.group);
                    that._resizeData.resizeStarted = true;
                } else if (!that._resizeData.resizeStarted)
                    return;

                console.log("Drag");
                info.group.attr({
                    transform: "translate(" + (that._resizeData.x + deltaX) + "," + (that._resizeData.y + deltaY) + ")"
                });
                that._resizeData.deltaX = deltaX;
                that._resizeData.deltaY = deltaY;
                //return false;
            }, function(x, y, event) {
                console.log("Drag start");
                vDesigner._moveCursor.call(that, info);
                that.getControlMgr().userEventHandler(that, function () {
                    if (that.getForm().currentControl() != that) that.setFocused();
                });
                //event.stopPropagation();
                //event.preventDefault();
                //return false;
            }, function (event) {
                console.log("Drag end");
                var p = info.layout.getParentComp();

                that._dragElGroup.attr({
                    display: "none"
                });
                if (p == that) {
                    that.getControlMgr().userEventHandler(that, function () {
                        that._isRendered(false);
                    });
                    //return false;
                } else {
                    info.group.attr({display: "none"});
                    var dropEl = Snap.getElementByPoint(event.clientX, event.clientY);
                    info.group.attr({display: ""});
                    var dropGrp = dropEl.parent();
                    var dropLid = dropGrp.attr("id");
                    var dropInfo = that._renderInfo[dropLid];
                    if (event.ctrlKey && dropInfo.layout.getParentComp() != that && !dropInfo.control) {
                        dropLid = dropInfo.layout.getParentComp().getLid();
                        dropInfo = that._renderInfo[dropLid];
                    }

                    if (dropInfo.layout == p) {
                        dropInfo.group.add(info.group);
                        that.getControlMgr().userEventHandler(that, function () {
                            that._isRendered(false);
                        });
                    } else if (dropInfo.layout != p && !dropInfo.layout.control()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = info.layout.getDB();
                            var ser = db.serialize(info.layout);
                            p.getCol("Layouts")._del(info.layout);
                            delete that._renderInfo[info.layout.getLid()];
                            info.invisible.unclick().unmousemove().unmouseout().undrag();
                            info.group.remove();
                            if (that.cursor() == info.layout || that.cursor() == info.layout.control())
                                that.cursor(null);

                            var resObj = db.deserialize(ser, {
                                colName: "Layouts",
                                obj: dropInfo.layout
                            }, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var mg = dropInfo.layout.getGuid();
                            var newObj = ser;
                            var o = { adObj: newObj, obj: resObj, colName: "Layouts", guid: mg, type: "add" };
                            dropInfo.layout.getLog().add(o);
                            dropInfo.layout.logColModif("add", "Layouts", resObj);
                            that.getControlMgr().allDataInit(resObj);

                            that._isRendered(false);
                            that.hasChanges(true);
                        });
                    } else
                        that.getControlMgr().userEventHandler(that, function () {
                            that._isRendered(false);
                        });
                }

                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return;// false;
                that._resizeData = null;
                //return true;
            });
        }

        vDesigner._moveCursor = function (info) {
            var that = this;
            that.getControlMgr().userEventHandler(that, function () {
                if (that.cursor()) {
                    var oldInfo = that._renderInfo[that.cursor().getLid()];
                    if (oldInfo)
                        oldInfo.group.removeClass("cursor");
                }

                that.cursor(info.control ? info.control : info.layout);
                info.group.addClass("cursor");

                vDesigner._enableToolbarButtons.call(that);
            });
        }

        vDesigner._renderPropEditor = function() {
            var that = this;
            var changeHandler = function(obj) {
                return function (e, fName, dataset, val) {
                    that.getControlMgr().userEventHandler(that, function () {
                        var value = null;
                        var ds = null;
                        if (val === undefined) {
                            value = dataset;
                        } else {
                            ds = dataset;
                            value = val;
                        }
                        if (ds) {
                            ds.edit(function() {
                                ds.setField(fName, value);
                                ds.save({}, function() {
                                    that.hasChanges(true);
                                });
                            });
                        } else {
                            obj[fName](value);
                            that.hasChanges(true);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                }
            };

            var item = $("#" + this.getLid());
            var propDiv = item.find(".prop-edit");

            var mdl = this.getModel();
            if (mdl)
                PropEditManager.setModel(mdl);
            PropEditManager.renderProperties(propDiv, this.cursor(), changeHandler(this.cursor()));
        }

        vDesigner._recalcLayoutMinDimensions = function(layout) {
            if (!layout) return;
            var pComp = layout.getParentComp();
            var info = this._renderInfo[layout.getLid()];
            if (!info) {
                info = {};
                this._renderInfo[layout.getLid()] = info;
            }
            var result = info.dim;
            if (!result) {
                result = {};
                info.dim = result;
            }

            var chDims = [];

            if (layout.control())
                chDims.push(vDesigner._recalcControlMinDimensions.call(this, layout));
            else {
                var col = layout.getCol("Layouts");
                for (var i = 0; i < col.count(); i++) {
                    var l = col.get(i);
                    chDims.push(vDesigner._recalcLayoutMinDimensions.call(this, l));
                }
            }

            result.minW = MARGIN_LEFT + MARGIN_RIGHT;
            result.minH = MARGIN_TOP + MARGIN_BUT;

            for (var i = 0; i < chDims.length; i++) {
                if (layout.direction() == "horizontal") {
                    result.minW += chDims[i].minW;
                    if (result.minH < (chDims[i].minH + MARGIN_BUT + MARGIN_TOP)) result.minH = (chDims[i].minH + MARGIN_BUT + MARGIN_TOP);
                } else if (layout.direction() == "vertical") {
                    result.minH += chDims[i].minH;
                    if (i + 1 < chDims.length) result.minH += MARGIN_BUT;
                    if (result.minW < (chDims[i].minW + MARGIN_LEFT + MARGIN_RIGHT)) result.minW = (chDims[i].minW + MARGIN_LEFT + MARGIN_RIGHT);
                } else {
                    if (result.minH < (chDims[i].minH + MARGIN_BUT + MARGIN_TOP)) result.minH = (chDims[i].minH + MARGIN_BUT + MARGIN_TOP);
                    if (result.minW < (chDims[i].minW + MARGIN_LEFT + MARGIN_RIGHT)) result.minW = (chDims[i].minW + MARGIN_LEFT + MARGIN_RIGHT);
                }
            }



            if (pComp == this) {
                var item = $("#" + this.getLid());
                var cont = item.children(".c-content").find(".designer-content");

                if (result.minW < cont[0].clientWidth) result.minW = cont[0].clientWidth;
                if (result.minH < (cont[0].clientHeight - 5)) result.minH = cont[0].clientHeight - 5;
            } else {
                var pDir = pComp.direction();
                var sizeName = pDir == "vertical" ? "height" : "width";

                var sizeVal = layout[sizeName]();
                if (String(sizeVal).indexOf("px") >= 0 || String(sizeVal).indexOf("px") >= 0) {
                    sizeVal = +(sizeVal.replace("px", "").replace("em", ""));
                    if (sizeName == "height" && result.minH < sizeVal) result.minH = sizeVal;
                    if (sizeName == "width" && result.minW < sizeVal) result.minW = sizeVal;
                } else if (sizeVal == "auto" && pDir == "vertical") {
                    if (result.minH < autoHeight) result.minH = autoHeight;
                }
            }

            return result;
        }

        vDesigner._getLayoutDimensions = function(layout) {
            var pComp = layout.getParentComp();
            var info = this._renderInfo[layout.getLid()];
            if (!info) {
                info = {};
                this._renderInfo[layout.getLid()] = info;
            }

            var result = info.dim;
            if (!result) {
                result = {};
                info.dim = result;
            }

            if (pComp == this) {
                result.x = 0;
                result.y = 0;

                var item = $("#" + this.getLid());
                var cont = item.children(".c-content").find(".designer-content");

                result.w = cont[0].clientWidth;
                result.h = cont[0].clientHeight - 5;
            } else {
                var pDir = pComp.direction();
                var takedSize = pDir == "horizontal" ? (MARGIN_LEFT) : (MARGIN_TOP);
                var r = this._renderInfo[pComp.getLid()];
                var pDims = r.dim;
                if (pDir == "layer") {
                    result.x = MARGIN_LEFT;
                    result.y = MARGIN_TOP;
                    result.w = pDims.w - (MARGIN_LEFT + MARGIN_RIGHT);
                    result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                } else {
                    var allSize = pDims.w;
                    var sizeName = pDir == "vertical" ? "height" : "width";
                    if (pDir == "vertical") allSize = pDims.h;
                    var lSize = layout[sizeName]() || 0;
                    if (lSize == "auto") lSize = autoHeight;
                    var siblings = pComp.getCol("Layouts");
                    if ($.isNumeric(lSize) || String(lSize).indexOf("px") >= 0 || String(lSize).indexOf("em") >= 0) {
                        if (String(lSize).indexOf("px") >= 0) lSize = lSize.replace("px", "");
                        if (String(lSize).indexOf("em") >= 0) lSize = lSize.replace("em", "");
                        if (pDir == "vertical") {
                            result.x = MARGIN_LEFT;
                            result.y = MARGIN_TOP;
                            result.h = +lSize;
                            result.w = pDims.w - (MARGIN_LEFT + MARGIN_RIGHT);
                        } else {
                            result.x = MARGIN_LEFT;
                            result.y = MARGIN_TOP;
                            result.w = +lSize;
                            result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                        }
                    } else if (String(lSize).indexOf("%") >= 0) {
                        lSize = +(lSize.replace("%", ""));
                        var fixedSize = pDir == "vertical" ? (MARGIN_TOP + MARGIN_BUT + CELL_SPACING*(siblings.count()-1)) : (MARGIN_LEFT + MARGIN_RIGHT);
                        var percSize = 0;
                        for (var i = 0; i < siblings.count(); i++) {
                            var sib = siblings.get(i);
                            var sibInfo = this._renderInfo[sib.getLid()];
                            var sibSize = sib[sizeName]() || 0;
                            if (sibSize == "auto") sibSize = autoHeight;
                            if ($.isNumeric(sibSize) || String(sibSize).indexOf("px") >= 0 || String(sibSize).indexOf("em") >= 0) {
                                if (String(sibSize).indexOf("px") >= 0) sibSize = sibSize.replace("px", "");
                                if (String(sibSize).indexOf("em") >= 0) sibSize = sibSize.replace("em", "");
                                fixedSize += Math.max(+sibSize, (sizeName == "height" ? sibInfo.dim.minH : sibInfo.dim.minW));
                            }  else if (String(sibSize).indexOf("%") >= 0) {
                                sibSize = +(sibSize.replace("%", ""));
                                percSize += sibSize;
                            }
                        }

                        var restSize = allSize - fixedSize;
                        var size;

                        // те процентные, которые не влезут в оставшееся пространство, считаем фиксированными
                        // с высотой равной их минимальной высоте

                        for (var i = 0; i < siblings.count(); i++) {
                            var sib = siblings.get(i);
                            var sibSize = sib[sizeName]() || 0;
                            if (String(sibSize).indexOf("%") <= 0 || sib == layout) continue;
                            sibSize = +(sibSize.replace("%", ""));
                            if (restSize <= 0) size = 0;
                            else size = (restSize / percSize) * lSize;
                            var sibInfo = this._renderInfo[sib.getLid()];
                            if (sizeName == "height") {
                                if (size < sibInfo.dim.minH) {
                                    restSize -= sibInfo.dim.minH;
                                    percSize -= sibSize;
                                }
                            } else {
                                if (size < sibInfo.dim.minW) {
                                    restSize -= sibInfo.dim.minW;
                                    percSize -= sibSize;
                                }
                            }
                        }

                        if (restSize <= 0) size = 0;
                        else size = (restSize / percSize) * lSize;
                        if (pDir == "vertical") {
                            result.h = size;
                            result.w = pDims.w - (MARGIN_LEFT + MARGIN_RIGHT);

                        } else {
                            result.w = size;
                            result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                        }
                    }
                    for (var i = 0; i < siblings.count(); i ++) {
                        var sib = siblings.get(i);
                        var rSib = this._renderInfo[sib.getLid()];
                        if (sib == layout) break;
                        takedSize += ((pDir == "vertical") ? (rSib.dim.h) : (rSib.dim.w + (MARGIN_LEFT + MARGIN_RIGHT)));
                        takedSize += CELL_SPACING;
                        if (takedSize >= allSize) {
                            takedSize = 0;
                            break;
                        }
                    }

                    if (pDir == "vertical") {
                        result.y = takedSize;
                        result.x = MARGIN_LEFT;
                        if (result.y + result.h > allSize) result.h = allSize - result.y;
                    } else {
                        result.x = takedSize;
                        result.y = MARGIN_TOP;
                        if (result.x + result.w > allSize) result.w = allSize - result.x;
                    }
                }
            }

            if (result.w < result.minW) result.w = result.minW;
            if (result.h < result.minH) result.h = result.minH;

            return result;
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vDesigner._genEventsForParent = function() {
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

        vDesigner._handleResize = function(layout) {
            if (!layout) return;
            var p = '#ch_' + layout.getLid();
            $(p).css("height", "");
            $(p).css("height", $(p).parent().height());
            var pp = $("#mid_" + layout.getLid());
            pp.css("height", "");
            pp.css("height", $(p).height());

            var children = layout.getCol("Layouts");
            for (var i = 0; i < children.count(); i++) {
                var child = children.get(i);
                vDesigner._handleResize.call(this, child);
            }
        }

        vDesigner._refreshScroll = function() {
            var item = $('#' + this.getLid());
            item.find(".designer-scroll").height(item.find(".designer-scroll").parent().height());
            if (this._iscroll) {
                //this._iscroll.destroy();
                //this._iscroll = null;
                this._iscroll.refresh();
            } else {

                var parentDivSel = item.find(".designer-scroll")[0];
                var _iscroll = new IScroll(parentDivSel, {
                    snapStepY: 23,
                    scrollX: false,
                    scrollY: true,
                    bottomPadding: 0,
                    topPadding: 0,
                    resize: true,
                    scrollbars: true,
                    mouseWheel: true,
                    disableMouse: true,
                    interactiveScrollbars: true,
                    keyBindings: false,
                    click: true,
                    probeType: 3,
                    rightPadding: 0
                });
                //_iscroll.on('scroll', function () {
                //    //gr.data("grid").updatePosition(this.y);
                //    if (this._grid)
                //        this._grid.grid("updatePosition", this.y);
                //});
                _iscroll.on('scrollStart', function () {
                    $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: 1});
                });
                _iscroll.on('scrollEnd', function () {
                    $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: ""});
                });
                this._iscroll = _iscroll;
            }
        }

        return vDesigner;

    }
);
