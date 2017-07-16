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

            get templates() {
                return _templates;
            }

            set templates(value) {
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
                _templates = template.parseTemplate(tpl)
            }

            static render(component, options) {
                var _viewSetInstance = _getInstance();

                var item = $('#' + component.getLid());
                if (item.length == 0) {
                    // объект контейнера
                    item = $(_viewSetInstance.templates['user-session-info']).attr('id', component.getLid());

                    // добавляем в парент
                    // IK 26/10/2016 раньше было getParent, исправил на getParentComp как в контейнере, но возможны проблемы при вставке в др форму?
                    var parent = component.getParentComp() ? '#ch_' + component.getLid() : options.rootContainer;
                    $(parent).append(item);
                    item.show();
                }

                _viewSetInstance.user = component.user();
                _viewSetInstance.sid = component.currentSessionId();
                _viewSetInstance.clid = component.currentConnectionId();
                _viewSetInstance.contextId = component.currentContextId();
                _viewSetInstance.formId = component.currentFormId();
                _viewSetInstance.userSessionControl = component;

                _viewSetInstance.onClick = component.onConnectClick();
                if (!(_viewSetInstance._widget)) {
                    _viewSetInstance._widget = new DevicesControl(_viewSetInstance);
                    _viewSetInstance._widget.render();
                } else {
                    _viewSetInstance._widget.sessions(_viewSetInstance.user);
                }
            }
        };

        return ViewSet;
    }
);
