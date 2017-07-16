/**
 * Created by levankiknadze on 28/01/2017.
 */

define(
    [
        '/scripts/uccello/uses/template.js', 
        'text!./templates/form.html', 
        'text!./../templates/genetix.html',
        '/scripts/viewsets/v-base.js',
        '/scripts/custom/main-menu-events.js'
    ],
    function(template, tpl, tplMain, BaseView, MainMenuEvents) {
        const vForm = class vForm extends BaseView {
            static getTemplate() {
                return tpl
            }

            createItem(component, options) {
                console.warn("createItem. Form guid=" + component.getGuid() + ", Form LID=" + component.getLid(), options)
                this._mainTemplates = template.parseTemplate(tplMain);

                var isMain = component.getParentComp() == null && options.rootContainer == "#v-toolbar";

                var pItem = null;

                if (isMain) {
                    pItem = $(this._mainTemplates['form']);
                    pItem.siblings(".is-content").attr('data-id', "mid_" + component.getLid());
                } else {
                    pItem = $(this._templates['form']).attr('data-id', "mid_" + component.getLid());
                    pItem.children(".control").attr('id', component.getLid())
                }

                return pItem;
            }

            initItem(pItem, component, options) {
                console.warn("initItem. Form guid=" + component.getGuid() + ", Form LID=" + component.getLid(), options)
                var isMain = component.getParentComp() == null && options.rootContainer == "#v-toolbar";
                var item = $("#" + component.getLid())

                if (!isMain) {
                    var p = pItem.parent();
                    //item.css({top: 0 + 'px', left: 0 + 'px', width: 100 + '%', height: p.innerHeight() + 'px'});

                    var cont = item.children(".c-content");
                    // создаем врапперы для чайлдов
                    var childs = component.getCol('Children');
                    for(var i=0; i<childs.count();i++) {
                        var child = component.getControlMgr().get(childs.get(i).getGuid());
                        if (!child.left) continue;
                        var div = $('#ext_'+child.getLid());
                        if (div.length == 0) {
                            div = $('<div class="control-wrapper"><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                            div.children().attr('id', 'ch_' + child.getLid());
                            cont.append(div);
                            div.on("genetix:childPropChanged", function(event, data) {
                                this.handleChildChanged(component, event, data);
                            });
                        }
                        var width=child.width(), height=child.height();

                        if ("position" in child && child.position() == "center") {
                            div.css({
                                margin: "0",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                /*"box-shadow": "1px 1px 0.75em 1px #3c4251",
                                 "-webkit-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                                 "-moz-box-shadow" : "1px 1px 0.75em 1px #3c4251",
                                 "border-radius": "0.25em",*/
                                "width": width,
                                "height": height
                            });

                        } else {
                            div.css({width: "100%"});
                            var height = child.height() || "auto";
                            var flex = "";
                            if (height != "auto") {
                                if ($.isNumeric(height))
                                    height += "px";
                                else if (height.length > 0 && height[height.length - 1] == "%") {
                                    if (childs.count() == 1) {
                                        height = "100%";
                                    } else {
                                        var perc = height.replace("%", "");
                                        height = "auto";
                                        flex = perc + " 0 auto";
                                    }
                                }
                            }
                            div.css({"height": height, "flex": flex, "-webkit-flex": flex, "-ms-flex": flex, "min-height": 0});
                        }
                    }

                    // убираем удаленные объекты
                    var del = component.getLogCol('Children') && 'del' in component.getLogCol('Children')? component.getLogCol('Children').del: {};
                    for (var guid in del)
                        $('#ext_' + del[guid].getLid()).remove();

                    this._setVisible(component);
                    this._genEventsForParent(component);
                } else {
                    this.setSystemToolbarEvents(component);
                }
            }

            setSystemToolbarEvents() {
                for(var i = 0; i < MainMenuEvents.length; i++) {
                    var it = MainMenuEvents[i];
                    ((menuData) => {
                        $(menuData.id).off("click").click(function () {
                            //'first button form',
                            $("#root-form-container").empty();
                            uccelloClt.addServerContext(menuData.guid);
                        });
                    })(it);
                    
                }
            }

            /**
             * Оповещение парента об изменениях пропертей
             * @private
             */
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

                if (genEvent) {
                    $('#ext_' + component.getLid()).trigger("genetix:childPropChanged", {
                        control: component,
                        properties: changedFields
                    });
                }
            }

            handleChildChanged(component, event, data) {
                console.log(event);
                if (!("Height" in data.properties)) return;
                var child = data.control;
                var div = $(event.target);
                var height = child.height() || "auto";
                var flex = "";
                if (height != "auto") {
                    if ($.isNumeric(height))
                        height += "px";
                    else if (height.length > 0 && height[height.length - 1] == "%") {
                        var perc = height.replace("%", "");
                        //height = "auto";
                        flex = perc + " 0 " + height;
                    }
                }
                div.css({
                    "height": height,
                    "flex": flex,
                    "-webkit-flex": flex,
                    "-ms-flex": flex,
                    "min-height": 0
                });

            }
        }

        return vForm;
    }
);
