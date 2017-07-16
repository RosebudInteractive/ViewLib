define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/scripts/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');

            var curMode = this.cursorSyncMode();
            if (curMode === undefined || curMode == null)
                curMode = "OneWay";
            curMode = curMode.toUpperCase();

            if (item.length == 0) {
                this.elemId = 0;
                this.itemsIndex = {};
                item = $(vDbTreeView._templates['dbTreeView']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            /*var selectedNodes = tree.jstree("get_selected", false);
                            if (selectedNodes.length > 0) {
                                var toFocus = "#" + selectedNodes[0] + "_anchor";
                                toFocus = toFocus.replace("@", "\\@");
                                $(toFocus).focus();
                            }*/
                            that.setFocused();
                        });
                    }
                });

                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                tree = item.find('.tree');
                tree.css({width: "100%", height: "100%"});

                setTimeout(function() {
                    that.getControlMgr().userEventHandler(that, function(){
                        that.getData(null, function(data) {
                            var treeData = data;
                            for (var i = 0; i < treeData.length; i++)
                                treeData[i].webix_kids = treeData[i].children;

                            //treeTable.define("width", 600);
                            //grid.resize();
                            var rowHeight = 30;
                            if (!that.size() || this.size().toLowerCase() == "standart") {
                                rowHeight = 30;
                            } else if ( this.size().toLowerCase() == "large") {
                                rowHeight = 36;
                            } else {
                                rowHeight = 24;
                            }

                            that._treeTable = webix.ui ({
                                container:tree[0],
                                view:"treetable",
                                fixedRowHeight: true,
                                headerRowHeight: 24,
                                rowHeight: rowHeight,
                                select: "row",
                                animate:{type:"flip", subtype:"vertical"},
                                columns:[
                                    { id:"text", header:"Name", template:"{common.treetable()} #text#", fillspace:true}
                                ],
                                data: treeData,
                                on: {
                                    onDataRequest: function (id) {
                                        var cntx = this;
                                        that.getControlMgr().userEventHandler(that, function(){
                                            var col = that.getCol("Items");
                                            var idx = col.indexOfGuid(id);
                                            that.getData(col.get(idx), function(data) {
                                                for (var i = 0; i < data.length; i++) {
                                                    data[i].webix_kids = true;
                                                    delete data[i].children;
                                                }
                                                cntx.parse({
                                                    parent: id,
                                                    data: data
                                                });
                                            });
                                        });
                                        // cancelling default behaviour
                                        return false;
                                    },
                                    onAfterSelect: function(data, preserve) {
                                        var col = that.getCol("Items");
                                        var idx = col.indexOfGuid(data.id);
                                        var treeItem = col.get(idx);
                                        // если и то и другое не определено

                                        if (!treeItem && !that.cursor()) return;
                                        if (that.cursor() != treeItem)
                                            that.getControlMgr().userEventHandler(that, function(){
                                                if (treeItem.kind() == 'item') {
                                                    that._setDatasetCursor(treeItem);
                                                }
                                                that.cursor(treeItem);
                                            });
                                    },
                                    onBeforeOpen: function(id) {
                                        var col = that.getCol("Items");
                                        var idx = col.indexOfGuid(id);
                                        var treeItem = col.get(idx);
                                        if (!(treeItem.isOpen()))
                                            that.getControlMgr().userEventHandler(that, function() {
                                                treeItem.isOpen(true);
                                            });
                                    },
                                    onBeforeClose: function(id) {
                                        var col = that.getCol("Items");
                                        var idx = col.indexOfGuid(id);
                                        var treeItem = col.get(idx);
                                        if (treeItem.isOpen())
                                            that.getControlMgr().userEventHandler(that, function(){
                                                treeItem.isOpen(false);
                                            });
                                    }
                                }
                            });
                        });
                    });

                    vDbTreeView._restoreNodeStates.call(that);
                    vDbTreeView._restoreCursor.call(that, true);

                    $(window).on("genetix:resize", function () {
                        that._treeTable.resize()
                    });

                }, 0);

            } else {
                vDbTreeView._restoreNodeStates.call(that);
                vDbTreeView._restoreCursor.call(that, false);
            }

            if (!this.size() || this.size().toLowerCase() == "standart")
                tree.removeClass("small-size large-size").addClass("standard-size");
            else if ( this.size().toLowerCase() == "large")
                tree.removeClass("small-size standard-size").addClass("large-size");
            else
                tree.removeClass("large-size standard-size").addClass("small-size");

            if (this.verticalLines()) tree.addClass("vertical-lines");
            else tree.removeClass("vertical-lines");
            if (this.horizontalLines()) tree.addClass("horizontal-lines");
            else tree.removeClass("horizontal-lines");
            if (this.alternateLines()) tree.addClass("alternate-lines");
            else tree.removeClass("alternate-lines");
/*
            var itemsCol = this.getCol("Items");
            for (var i = 0, len = itemsCol.count(); i < len; i++) {
                var item = itemsCol.get(i);
                if (item.isOpen()) {
                    if (!tree.jstree("is_open", item.getGuid()))
                        tree.jstree("open_node", item.getGuid());
                } else {
                    if (tree.jstree("is_open", item.getGuid()))
                        tree.jstree("close_node", item.getGuid());
                }
            }

            if (this.cursor()) {
                var n = tree.jstree("get_node",  this.cursor().getGuid());
                if (n) {
                    var selectedNodes = tree.jstree("get_selected", false);
                    if (n.id != selectedNodes[0])
                        tree.jstree("deselect_all", false);
                    tree.jstree("select_node", n.id);

                    var el = document.getElementById(this.cursor().getGuid());
                    if (el) {
                        var offset = el.offsetTop;
                        var scrollPos = el.offsetParent.children[0].scrollTop;
                        var height = el.offsetParent.children[0].offsetHeight;
                        if (offset < scrollPos && offset > (scrollPos + height - el.offsetHeight))
                            el.scrollIntoView();
                    }
                }
            }
*/
            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        vDbTreeView._restoreCursor = function(isInit) {
            if (this.cursor()) {
                this._treeTable.select(this.cursor().getGuid());
                if (isInit || this.isFldModified("Cursor"))
                this._treeTable.showItem(this.cursor().getGuid());
            }
        }

        vDbTreeView._restoreNodeStates = function() {
            var itemsCol = this.getCol("Items");
            for (var i = 0, len = itemsCol.count(); i < len; i++) {
                var item = itemsCol.get(i);
                var treeNode = this._treeTable.getItem(item.getGuid());
                if (!treeNode) continue;
                if (item.isOpen()) {
                    if (!this._treeTable.isBranchOpen(item.getGuid()))
                        this._treeTable.open(item.getGuid());
                } else {
                    if (this._treeTable.isBranchOpen(item.getGuid()))
                        this._treeTable.close(item.getGuid());
                }
            }
        };

        return vDbTreeView;


        function elementInViewport(el) {
            var top = el.offsetTop;
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            var height = el.offsetHeight;

            while(el.offsetParent) {
                el = el.offsetParent;
                top += el.offsetTop;
                left += el.offsetLeft;
            }

            return (
                top >= window.pageYOffset &&
                left >= window.pageXOffset &&
                (top + height) <= (window.pageYOffset + window.innerHeight) &&
                (left + width) <= (window.pageXOffset + window.innerWidth)
            );
        }
    }
);