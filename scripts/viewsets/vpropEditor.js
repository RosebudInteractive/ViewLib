define(
    ['/scripts/uccello/uses/emplate.js', 'text!./templates/propEditor.html'],
    function(template, tpl) {
        var vPropEditor = {};

        vPropEditor._templates = template.parseTemplate(tpl);

        vPropEditor.render = function (options) {
            var that = this;
            var editor = $('#' + this.getLid()), props, controls, change, delbtn, parents;
            if (editor.length == 0) {
                editor = $(vPropEditor._templates['propEditor']).attr('id', this.getLid());
                controls = $(vPropEditor._templates['controls']);
                controls.change(function () {
                    var val = $(this).val();
                    that.getControlMgr().userEventHandler(that, function(){
                        that.control(val);
                    });
                });
                parents = $(vPropEditor._templates['parents']);
                props = $(vPropEditor._templates['props']);
                change = $(vPropEditor._templates['change']);
                change.click(function () {
                    vPropEditor.saveProps.apply(that, arguments);
                });
                delbtn = $(vPropEditor._templates['delbtn']);
                delbtn.click(function () {
                    that.getControlMgr().userEventHandler(that, function () {
                        var editor = $('#' + this.getLid());
                        that.getControlMgr().del(editor.find('.controls').val());
                    });
                });
                editor.append(controls);
                editor.append(parents);
                editor.append(props);
                editor.append(change);
                editor.append(delbtn);
                var parent = (this.getParentComp()? '#' + this.getParentComp().getLid(): options.rootContainer);
                $(parent).append(editor);
                editor.css({top: this.top() + 'px', left: this.left() + 'px'});
            } else {
                controls = editor.find('.controls');
                controls.empty();
                parents = editor.find('.parents');
                parents.find('select').empty();
                parents.hide();
                props = editor.find('.props');
                props.empty();
                change = editor.find('.change');
                change.hide();
                delbtn = editor.find('.delbtn');
                delbtn.hide();
                if (this.getObj().isFldModified('Top') || this.getObj().isFldModified('Left'))
                    editor.css({top: this.top() + 'px', left: this.left() + 'px'});
            }

            parents.find('select').append('<option value=""></option>');
            controls.append('<option value=""></option>');
            var gl = this.getControlMgr()._getCompGuidList();
            for (var f in gl) {
                var name = gl[f].getClassName();
                var id = gl[f].getGuid();
                controls.append($('<option/>').val(id).html(gl[f].getObj().get('Name')));
                if (gl[f].pvt.obj.getCol("Children")) {
                    parents.find('select').append($('<option/>').val(id).html(gl[f].getObj().get('Name')));
                }
            }

            // отобразить текущий контрол
            if (this.control()) {
                controls.val(this.control());
                vPropEditor.renderProps.apply(this);
            }
        }

        /**
         *  Рендер свойств
         */
		vPropEditor.renderProps = function() {

			var guid = this.control();

            var editor = $('#' + this.getLid());
            var props = editor.find('.props');
            var change = editor.find('.change');
            var delbtn = editor.find('.delbtn');
            var parents = editor.find('.parents');
            props.empty();

            if (guid == '') {
                change.hide();
                delbtn.hide();
                parents.hide();
                return;
            }
            change.show();
            delbtn.show();
            parents.show();

            var comp = this.getControlMgr().get(guid);
            if (!comp) {
                vPropEditor.renderProps.apply(this, ['']);
                return;
            }

            parents.find('select').val(comp.getParentComp()?comp.getParentComp().getGuid():'');
            var countProps = comp.countProps();
            for (var i = 0; i < countProps; i++) {
                var propName = comp.getPropName(i);
                var p = $(vPropEditor._templates['field']);
                p.find('.name').html(propName);
                p.find('.value input').val(comp[propName.charAt(0).toLowerCase() + propName.slice(1)]()).attr('name', propName);
                props.append(p);
            }			
		}

        /**
         * Сохранить свойства
         */
        vPropEditor.saveProps = function () {
            var editor = $('#' + this.getLid());
            var props = editor.find('.props');
            var inputs = props.find('input');
            var comp = this.getControlMgr().get(editor.find('.controls').val());
            var parents = editor.find('.parents');
            var that = this;

            // отсылка дельт и рендер
            this.getControlMgr().userEventHandler(this, function(){
                // свойства
                for (var i = 0; i < inputs.length; i++) {
                    var propName = $(inputs[i]).attr('name');
                    var value = $(inputs[i]).val();
                    comp[propName.charAt(0).toLowerCase() + propName.slice(1)](value);
                }
                // родитель
                that.getControlMgr().move(comp.getGuid(), parents.find('select').val());
            });
        }

        return vPropEditor;
    });