define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/treeView.html', '/scripts/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vTreeView = {};
        vTreeView._templates = template.parseTemplate(tpl);
        vTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');
            if (item.length == 0) {
                item = $(vTreeView._templates['treeView']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });

                tree = item.find('.tree').jstree({
                    'core' : {
                        'data' : function (node, cb) {
                            if(node.id === "#") {
                                cb(vTreeView.getItems.apply(that, [null]));
                            }
                            else {
                                cb(vTreeView.getItems.apply(that, [node.data]));
                            }
                        }
                    }
                });

                item.find('.addItem').click(function(){
                    var parent = tree.jstree('get_selected').length>0 ? tree.jstree('get_selected')[0] : '#';
                    var node = {id:Utils.id(), text:item.find('.elemName').val()};
                    vTreeView.addItem.apply(that, [parent, node])
                });

                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }
            tree.jstree("refresh");

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        vTreeView.getItems = function(parent) {
            var items = this.getCol('Items'), itemsTree=[];
            for (var i = 0, len = items.count(); i < len; i++) {
                var item = items.get(i);
                if (parent == item.parent())
                    itemsTree.push({"text" : item.name(), "id" : item.id(), "children" : vTreeView.getItems.apply(this, [item]).length!=0, data:item});
            }
            return itemsTree;
        }

        vTreeView.addItem = function(parentId, node) {

            var parent = null;
            if (parentId !== '#') {
                var items = this.getCol('Items'), itemsTree=[];
                for (var i = 0, len = items.count(); i < len; i++) {
                    var item = items.get(i);
                    if (item.id() == parentId)
                        parent = item;
                }
            }

            // добавляем в коллекцию
            var cm = this.getControlMgr(), vc = cm.getContext();
            this.getControlMgr().userEventHandler(this, function(){
                new (vc.getConstructorHolder().getComponent(UCCELLO_CONFIG.classGuids.TreeViewItem).constr)(cm, {parent: this, colName: "Items", ini:{fields:{Id:node.id, Name:node.text, Parent:parent, Kind:"item"}} });
            });

            // добавляем в дерево
            var tree = $('#' + this.getLid()).find('.tree');
            tree.jstree('create_node', parentId, node);
            tree.jstree("refresh", parentId);
            tree.jstree("open_node", parentId);
        }
        return vTreeView;
    }
);