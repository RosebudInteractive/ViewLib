/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ['/scripts/uccello/uses/template.js', 'text!./../templates/designerPropEditor.html'],
    function(template, tpl) {
        var _templates = template.parseTemplate(tpl);

        var DefaultEditor = Class.extend({

            init: function() {

            },

            setModel: function(model) {
                this._model = model;
            },

            render: function(parentDiv, control, callback) {
                var tbl = parentDiv.find("table");

                var changeHandler = function(obj, funcName, inpt, callback) {
                    return function (e) {
                        callback(e, funcName, inpt.val());
                    }
                };

                if (tbl.length == 0) {
                    var header = $(_templates["header"]);
                    parentDiv.append(header);
                    parentDiv.append(_templates["body"]);
                }
                var tb = tbl.find("tbody");
                tb.empty();

                var curr = control;
                if (curr) {
                    var tmpl = _templates["property"];

                    var propNames = curr._objType._fieldsArr;
                    for (var i = 0; i < propNames.length; i++) {
                        var propName = propNames[i];
                        var funcName = propName.charAt(0).toLowerCase() + propName.slice(1);
                        var val = curr[funcName]();
                        var tr = $(tmpl);
                        tr.find(".name").text(propName);
                        var inpt = tr.find(".value").find("input");
                        inpt.val(val);
                        tb.append(tr);
                        $.data(inpt[0], "propName", propName);
                        inpt.change(changeHandler(control, funcName, inpt, callback));
                    }
                }


            }

        });
        return DefaultEditor;
    }
);
