/**
 * User: kiknadze
 * Date: 27.02.2015
 * Time: 19:38
 */
define(
    "devices",
    ['/scripts/uccello/uses/template.js', 'text!./widgets/templates/devices.html', "gPopup"],
    function (template, tpl) {
        var templates = template.parseTemplate(tpl);

        var DevicesControl = Class.extend({

            /**
             * Конструктор
             * @param obj - ожъект сессий
             */
            init: function(obj) {
                this._ViewSetInstance = obj;

                this._tabsPopup = null;
                this._OpenOnDevicePopup = null;
                this._FormsPopup = null;
                this._CurrentRoot = null;
                this.sessions(obj.user);
            },

            currentRoot: function (value) {
                if (value !== undefined) this._CurrentRoot = value;
                return this._CurrentRoot;
            },

            /**
             * Проперти сессии. При установке вызывает перерисовку
             * @param user
             */
            sessions: function(user) {
                console.log(user);
                if (user === undefined)
                    return this._User;
                else {
                    this._User = user;
                    this.render();
                }

            },

            render: function() {
                var mainPanel = $(".is-device-wrapper");
                this._renderTabs(mainPanel);
                this._renderDevices(mainPanel);
            },

            /**
             * Вывод устройств
             * @param mainPanel
             * @private
             */
            _renderDevices: function(mainPanel) {
                // если сессии пустые, то все чистим
                if (!(this._User)) {
                    mainPanel.find(".is-device-icon").remove(":not(#tabs-placeholder)");
                    return;
                }

                var sessions = {};
                var curSessionId = this._ViewSetInstance.sid;
                var sessionsCount = this._User.countChild("Sessions");
                var curSession = null;
                var sessCol = this._User.getCol("Sessions");
                for (var i = 0; i <sessionsCount; i++) {
                    var sessionObj = sessCol.get(i);
                    sessions[sessionObj.getGuid()] = sessionObj;
                    if (sessionObj.getGuid() == curSessionId) curSession = sessionObj;
                }


                // разберемся с текущим девайсом
                var curSessionIcon = mainPanel.find("#" + curSessionId);

                if (curSessionIcon.length == 0) {
                    if (curSession.deviceType() == "C")
                        curSessionIcon = $(templates["pc"]).attr("id", curSessionId);
                    else
                        curSessionIcon = $(templates["tablet"]).attr("id", curSessionId);
                    curSessionIcon.find("svg").css({color: curSession.deviceColor()});
                    curSessionIcon.find(".is-device-text").text(curSession.name());
                    mainPanel.append(curSessionIcon);
                }


                // очистим удаленные устройства
                mainPanel.find(".is-device-icon:not(#tabs-placeholder)").each(function (i) {
                    if (!($(this).attr("id") in sessions)) {
                        $(this).find("svg").css({opacity: 0});
                        $(this).find("is-device-text").css({opacity: 0});
                        var that2 = this;
                        setTimeout(function () {
                            $(that2).remove();
                        }, 500);
                    }
                });

                // добавин новые в конец
                for (var id in sessions) {
                    if (id == curSessionId) continue;
                    var session = sessions[id];
                    var existing = mainPanel.find("#" + id);
                    // если элемент не найден, то добавим
                    if (existing.length == 0) {
                        if (session.deviceType() == "C")
                            existing = $(templates["pc"]);
                        else
                            existing = $(templates["tablet"]);
                        existing.attr("id", session.getGuid());
                        // сначала спрячем их
                        // а потом прекрасно покажем
                        existing.find("svg").css({opacity: 0});
                        existing.find("is-device-text").css({opacity: 0});
                        mainPanel.append(existing);
                    }
                    existing.find(".is-device-text").text(session.name());

                    function slowShow(el, s) {
                        setTimeout(function() {
                            if (s.countChild("Connects") != 0) {
                                el.find("svg").css({color: s.deviceColor(), opacity: "1"});
                                el.find(".is-device-text").css({opacity: "1"});
                            }
                            else {
                                el.find("svg").css({color: "#ffffff", opacity: "0.8"});
                                el.find(".is-device-text").css({opacity: "0.8"});
                            }
                        }, 0);
                    }

                    slowShow(existing, session);


                }

                /* перемещение будет с задержкой, чтобы не мешать анимации */
                setTimeout(function() {
                    // переместим неактивные в конец
                    for (var id in sessions) {
                        if (id == curSessionId) continue;
                        var session = sessions[id];
                        if (session.countChild("Connects") != 0) continue;
                        var existing = mainPanel.find("#" + id);
                        existing.appendTo(mainPanel);
                    }
                }, 500);
            },

            /**
             * Вывод верхней кнопки
             * @param mainPanel - панел, куда выводить
             * @private
             */
            _renderTabs: function(mainPanel) {
                if ($("#tabs-placeholder").length == 0) {
                    var that = this;
                    var tabsIcon = $(templates['tabs']).attr('id', 'tabs-placeholder');
                    mainPanel.append(tabsIcon);
                    this._tabsIcon = tabsIcon;
                    var popupDiv = $("<div></div>");
                    $("body").append(popupDiv);
                    this._tabsPopup = popupDiv.genetixPopup({
                        buttonControl: this._tabsIcon,
                        offsetX: 26,
                        click: function (event, data) {
                            var vc = data.custom.contextGuid;
                            var formGuid = data.custom.formGuid;
                            that._selectContext(vc, {guid: formGuid,
                                isInstance: data.custom.type == "context"
                            });
                        },
                        righticonclick: function (event, data) {
                            if (data.data.custom.type == "context") {
                                if (that._FormsPopup) {
                                    $("#forms-popup-div").remove();
                                    that._FormsPopup = null;
                                }
                                var formsPopupDiv = $("<div id='forms-popup-div'></div>");
                                popupDiv.append(formsPopupDiv);
                                that._FormsPopup = formsPopupDiv.genetixPopup({
                                    buttonControl: data.button,
                                    title: null,
                                    offsetX: -49,
                                    offsetY: -105,
                                    leftIcons: true,
                                    rightIcons: true,
                                    click: function (event, data2) {
                                        if (data2.custom.type == "form") {
                                            var vc = data2.custom.contextGuid;
                                            var formGuid = data2.custom.formGuid;
                                            that._selectContext(vc, {guid: formGuid, isInstance: true});
                                        } else {
                                            that._openOnDevice(data2);
                                        }
                                    },
                                    righticonclick: function (event, data) {
                                        that._showDevicesPopup(data, formsPopupDiv, -40, -143);
                                    },
                                    hide: function () {
                                        popupDiv.find(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                                    }
                                });

                                var formsData = that._prepareFormsData(data);
                                that._FormsPopup.genetixPopup("show", formsData, data.button);
                            } else
                                that._showDevicesPopup(data, popupDiv);
                        }
                    });


                    tabsIcon.click(function () {
                        var popupData = that._preparePopupData();
                        that._tabsPopup.genetixPopup("show", popupData, null, url("#database"));
                    });
                }
            },

            _showDevicesPopup: function(data, popupDiv, ox, oy) {
                var offsetX = ox || -49;
                var offsetY = oy || -105;
                var that = this;
                if (that._OpenOnDevicePopup) {
                    that._OpenOnDevicePopup = null;
                    $("#open-on-device").remove();
                }

                var devPopupDiv = $("<div id='open-on-device'></div>");
                popupDiv.append(devPopupDiv);
                that._OpenOnDevicePopup = devPopupDiv.genetixPopup({
                    buttonControl: data.button,
                    title: "Open on device",
                    offsetX: offsetX,
                    offsetY: offsetY,
                    leftIcons: true,
                    rightIcons: false,
                    click: function (event, data2) {
                        that._openOnDevice(data2);
                    },
                    hide: function () {
                        popupDiv.find(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                    }
                });
                var oodData = that._prepareOODData(data);
                that._OpenOnDevicePopup.genetixPopup("show", oodData, data.button);
            },

            _openOnDevice: function (data) {
                var formGuids = data.custom.parent.data.custom.formGuid || 'all';
                if (formGuids != 'all') formGuids = [formGuids];
                uccelloClt.getClient().newTab(
                    data.custom.parent.data.custom.contextGuid,
                    formGuids,
                    data.custom.sessionId
                );
            },

            _prepareOODData: function(parentData, prefix) {
                prefix = prefix || "OODpopup";
                var that = this;
                if (!(this._User)) return;
                var contexts = [];

                var sessions = {};
                var curSessionId = this._ViewSetInstance.sid;
                var sessCol = this._User.getCol("Sessions")
                var sessionsCount = sessCol.count();
                var curSession = null;
                for (var i = 0; i <sessionsCount; i++) {
                    var sessionObj = sessCol.get(i);
                    sessions[sessionObj.getGuid()] = sessionObj;
                    if (sessionObj.getGuid() == curSessionId) curSession = sessionObj;
                }


                // разберемся с текущим девайсом
                var cnt = {
                    id: prefix + "-" + curSessionId.replace("@", "_"),
                    title: curSession.name(),
                    subTree: [],
                    leftIcon: (curSession.deviceType() == "C" ? "/images/Genetix.svg#pc" : "/images/Genetix.svg#tablet"),
                    leftIconColor: curSession.deviceColor(),
                    custom: {
                        type: "device",
                        sessionId: curSessionId,
                        parent: parentData
                    }
                };
                contexts.push(cnt);

                // добавин новые в конец
                for (var id in sessions) {
                    if (id == curSessionId) continue;
                    var session = sessions[id];
                    if (session.countChild("Connects") == 0) continue;
                    var cnt = {
                        id:  prefix + "-" + session.getGuid().replace("@", "_"),
                        title: session.name(),
                        subTree: [],
                        leftIcon: (session.deviceType() == "C" ? "/images/Genetix.svg#pc" : "/images/Genetix.svg#tablet"),
                        leftIconColor: session.deviceColor(),
                        custom: {
                            type: "device",
                            sessionId: session.getGuid(),
                            parent: parentData
                        }
                    };
                    contexts.push(cnt);
                }

                return contexts;
            },

            _prepareFormsData: function(parentData) {
                var contGuid = parentData.data.custom.contextGuid;
                var context = this._User.getContext(contGuid);
                var result = [];

                var formsCol = context.forms()
                for (var f = 0, len5 = formsCol.count(); f < len5; f++) {
                    var resource = formsCol.get(f);
                    var cnt2 = {
                        id: "OpenFrm-" + resource.getGuid(),
                        title: resource.name(),
                        subTree: [],
                        rightIcon: "/images/controls.svg#hamburger",
                        custom: {
                            type: "form",
                            contextGuid: contGuid,
                            formGuid: resource.formGuid()
                        }
                    };
                    result.push(cnt2);
                }

                if (result.length != 0)
                    result.push({
                        type: "separator"
                    });

                var devArray = this._prepareOODData(parentData, "frmOOD");
                result = result.concat(devArray);

                return result;
            },

            /**
             * Вызвращает данные для всплывающего меню устройств
             * @private
             */
            _preparePopupData: function() {
                var contexts = [];

                if (this._User) {
                    var contextsCol = this._User.contexts();
                    for (var i = 0, l = contextsCol.count(); i < l; i++) {
                        var item = contextsCol.get(i);
                        var contGuid = item.getGuid();

                        var formGuid = null;
                        if (item.forms().count() != 0) {
                            var resource = item.forms().get(0);
                            formGuid = resource.formGuid();
                        }

                        var cnt = {
                            id: item.getGuid(),
                            title: item.name(),
                            subTree: [],
                            rightIcon: "/images/controls.svg#hamburger",
                            custom: {
                                type: "context",
                                contextGuid: contGuid,
                                formGuid:  formGuid
                            }
                        };

                        if (item.getGuid() == this._ViewSetInstance.userSessionControl.currentContextId())
                            contexts.unshift(cnt);
                        else
                            contexts.push(cnt);

                        var rootForm = item.forms().get(0);
                        if (rootForm) {
                            var subFormsCol = rootForm.subResForms();
                            for (var j = 0; j < subFormsCol.count(); j++) {
                                var subFrmItem = subFormsCol.get(j);
                                var cnt2 = {
                                    id: item.getLid() + "-" + subFrmItem.getGuid(),
                                    title: subFrmItem.name(),
                                    subTree: [],
                                    rightIcon: "/images/controls.svg#hamburger",
                                    custom: {
                                        type: "sub-form",
                                        contextGuid: contGuid,
                                        formGuid: subFrmItem.resFormGuid()
                                    }
                                };
                                cnt.subTree.push(cnt2);
                            }
                        }
                    }
                }
                return contexts;
            },
            _selectContext: function(contextId, params) {
                $("#root-form-container").empty();
                var that = this;
                uccelloClt.connectServerContext(contextId, params);
            },
            _setAutoSendDeltas: function() {
                var cm = uccelloClt.getContextCM(currRoot);
                if (cm)
                    cm.autoSendDeltas(true);
            },

            _setContextUrl: function(context, formGuids) {
                if (typeof formGuids == "string")
                    formGuids = [formGuids];
                if (formGuids[0] != "all")
                    this._CurrentRoot = formGuids[0];
                window.isHashchange = false;
                document.location = this._getContextUrl(context, formGuids);
            },

            _getContextUrl: function(context, formGuids) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                return location+'#context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
            },

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            _renderRoot: function(rootGuid){
                this.currentRoot(rootGuid);
                return {rootContainer: "#root-form-container"};
            }
        });

        return DevicesControl;
    }
);