define(
    ['/scripts/uccello/uses/template.js', 'text!./templates/user-session-info.html'
        , 'devices'],
    function(template, tpl, DevicesControl) {
        var _templates;
        var _instance;

        function _getInstance() {
            if (!_instance) {
                _instance = new ViewSet()
            }

            return _instance;
        }

        function getEventTarget(e) {
            e = e || window.event;
            return e.target || e.srcElement;
        }

        const ViewSet = class ViewSet {

            static get templates() {
                return _templates;
            }

            static set templates(value) {
                _templates = value
            }

            get user() {
                return this._user;
            }

            set user(value) {
                if (this._user !== value) {
                    this._user = value
                }
            }

            get selectedContext() {
                return this._selectedContext;
            }

            set selectedContext(value) {
                if (this._selectedContext !== value) {
                    this._selectedContext = value;
                    this.selectedForm = null;

                }
            }

            get selectedForm() {
                return this._selectedForm;
            }

            set selectedForm(value) {
                if (this._selectedForm !== value) {
                    this._selectedForm = value;
                    this._selectedSubForm = null;

                }
            }

            constructor(){
                ViewSet.templates = template.parseTemplate(tpl)
            }

            render(options) {
                var item = $('#' + this.getLid());
                if (item.length == 0) {
                    // объект контейнера
                    item = $(ViewSet.templates['user-session-info']).attr('id', this.getLid());

                    // добавляем в парент
                    // IK 26/10/2016 раньше было getParent, исправил на getParentComp как в контейнере, но возможны проблемы при вставке в др форму?
                    var parent = this.getParentComp() ? '#ch_' + this.getLid() : options.rootContainer;
                    $(parent).append(item);
                    item.show();
                }


                var _viewSetInstance = _getInstance();
                _viewSetInstance.user = this.user();
                _viewSetInstance.sid = this.currentSessionId();
                _viewSetInstance.clid = this.currentConnectionId();
                _viewSetInstance.contextId = this.currentContextId();
                _viewSetInstance.formId = this.currentFormId();
                _viewSetInstance.userSessionControl = this;

                _viewSetInstance.onClick = this.onConnectClick();
                if (!(_viewSetInstance._widget)) {
                    _viewSetInstance._widget = new DevicesControl(_viewSetInstance);
                    _viewSetInstance._widget.render();
                } else {
                    _viewSetInstance._widget.sessions(_viewSetInstance.user);
                }
                //_viewSetInstance._reloadData();
            }

            _reloadData(){
                this._fillSessions();
                this._fillContexts();
                this._configButtons();
            }

            _fillSessions() {
                var _sessions = $('#sessions');
                _sessions.empty();

                if (this.user) {
                    for (var i = 0; i < this.user.sessions().count(); i++) {
                        var _session = this.user.sessions().get(i);
                        var _option = $('<option />').attr('value', _session.getGuid()).html(_session.name());
                        if ((this.sid) && (_option.attr('value') === this.sid)) {
                            _option.attr("selected", true);
                            _option[0].style.fontWeight = "bold";
                            this._selectedSession = this.sid;
                        }
                        _sessions.append(_option);
                    }

                    this._showSessionConnections();

                    var that = this;
                    _sessions.change((args) => {
                        var _target = getEventTarget(args);
                        if ((_target) && (_target.selectedIndex !== undefined)) {
                            var _selected = _target.options[_target.selectedIndex];
                            if (_selected.value != that._selectedSession) {
                                that._selectedSession = _selected.value;
                                that._showSessionConnections();
                            }
                        }
                    });
                }
            }

            _showSessionConnections() {
                var _connections = $('#connections');
                _connections.empty();

                if ((!this._selectedSession) || (!this.user)) {
                    return
                }
                var _session = this.user.getSession(this._selectedSession);
                if (_session) {
                    for (var i = 0; i < _session.connects().count(); i++) {
                        var _connect = _session.connects().get(i);
                        var _option = $('<option />').attr('value', _connect.channelId()).html(_connect.descr());
                        if ((this.clid) && (_option.attr('value') === this.clid)) {
                            _option.attr("selected", true);
                            _option[0].style.fontWeight = "bold";
                        }
                        _connections.append(_option);
                    }
                }
            }

            _fillContexts() {
                var _contextsCtrl = $('#contexts');
                _contextsCtrl.empty();

                if (this.user) {
                    for (var i = 0; i < this.user.contexts().count(); i++) {
                        var _item = this.user.contexts().get(i);
                        var _option = $('<option />').attr('value', _item.getGuid()).html(_item.name());
                        if (!this.selectedContext) {
                            this.selectedContext = _item.getGuid();
                        }
                        if (_option.attr('value') === this.selectedContext) {
                            _option.attr("selected", true);
                        }
                        if (_option.attr('value') === this.contextId) {
                            _option.css("font-weight","Bold")
                        }

                        _contextsCtrl.append(_option);
                    }

                    this._showContextForms();

                    var that = this;
                    _contextsCtrl.change((args) => {
                        var _target = getEventTarget(args);
                        if ((_target) && (_target.selectedIndex !== undefined)) {
                            var _selected = _target.options[_target.selectedIndex];
                            if (_selected.value != that.selectedContext) {
                                that.selectedContext = _selected.value;
                                that._showContextForms();
                            }
                        }
                    });
                }
            }

            _showContextForms(){
                var _formsCtrl = $('#forms');
                _formsCtrl.empty();

                if ((!this.selectedContext) || (!this.user)) {
                    return
                }
                var _context = this.user.getContext(this.selectedContext);
                if (_context) {
                    this._fillForms(_formsCtrl, _context.forms());
                }

                this._showSubForms();

                var that = this;
                _formsCtrl.change((args) => {
                    var _target = getEventTarget(args);
                    if ((_target) && (_target.selectedIndex !== undefined)) {
                        var _selected = _target.options[_target.selectedIndex];
                        if (_selected.value != that.selectedForm) {
                            that.selectedForm = _selected.value;
                            that._showSubForms();
                        }
                    }
                });
            }

            _fillForms(control, collection) {
                for (var i = 0; i < collection.count(); i++) {
                    var _item = collection.get(i);
                    var _option = $('<option />').attr('value', _item.formGuid()).html(_item.name());

                    if (!this.selectedForm) {
                        this.selectedForm = _item.formGuid();
                    }

                    if ((this.selectedForm) && (_option.attr('value') === this.selectedForm)) {
                        _option.attr("selected", true);
                    }

                    if (_option.attr('value') === this.formId) {
                        _option.css("font-weight","Bold")
                    }

                    control.append(_option);

                    if (_item.childForms().count() > 0) {
                        this._fillForms(control, _item.childForms())
                    }
                }
            }

            _showSubForms(){
                var _subFormsCtrl = $('#sub-forms');
                _subFormsCtrl.empty();

                if ((!this.selectedForm) || (!this.user)) {
                    return
                }
                var _context = this.user.getContext(this.selectedContext);
                if (_context) {
                    var _form = _context.getForm(this.selectedForm);
                    if (_form) {
                        for (var i = 0; i < _form.subResForms().count(); i++) {
                            var _item = _form.subResForms().get(i);
                            var _option = $('<option />').attr('value', _item.resFormGuid()).html(_item.name());

                            if (!this._selectedSubForm) {
                                this._selectedSubForm = _item.resFormGuid();
                            }

                            if ((this._selectedSubForm) && (_option.attr('value') === this._selectedSubForm)) {
                                _option.attr("selected", true);
                            }

                            _subFormsCtrl.append(_option);
                        }
                    }
                }

                var that = this;
                _subFormsCtrl.change((args) => {
                    var _target = getEventTarget(args);
                    if ((_target) && (_target.selectedIndex !== undefined)) {
                        var _selected = _target.options[_target.selectedIndex];
                        if (_selected.value != that._selectedSubForm) {
                            that._selectedSubForm = _selected.value;
                        }
                    }
                });
            }

            _configButtons() {
                var _btnCreateAndConnect = $('#btn-create-and-connect');
                var _btnConnect = $('#btn-connect');
                var _enable = ((!!this.onClick) && (!!this.selectedContext) && (!!this.selectedForm));


                _btnCreateAndConnect[0].disabled = !(_enable && (!!this._selectedSubForm));
                _btnConnect[0].disabled = !_enable;

                if (this.onClick) {
                    var that = this;
                    _btnCreateAndConnect.unbind().click((args) => {
                        that.onClick(that.selectedContext, {parentGuid: that.selectedForm, guid : that._selectedSubForm, isInstance: false})
                    });

                    _btnConnect.unbind().click((args) => {
                        that.onClick(that.selectedContext, {guid: that.selectedForm, isInstance: true})
                    });
                }
            }
        };

        return _getInstance();
    }
);
