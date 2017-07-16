/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ['/scripts/uccello/uses/template.js', 'text!./../templates/designerPropEditor.html'],
    function(template, tpl) {
        var _templates = template.parseTemplate(tpl);

        var DataGridPropEditor = Class.extend({

            init: function(model, propSource) {
                this._model = model;
                this._propSource = propSource;
            },

            setModel: function(model) {
                this._model = model;
            },

            setPropSource: function(propSource) {
                this._propSource = propSource;
            },

            _getPropsDataset: function(control) {
                var propDS = null;
                var col = this._propSource.getCol("Datasets");
                for (var i = 0, len = col.count(); i < len; i++) {
                    var d = col.get(i);
                    if (d.getCurrentDataObject() == control) {
                        propDS = d;
                        break;
                    }
                }
                return propDS;
            },

            render: function(parentDiv, control, callback) {
                var tbl = parentDiv.find("table");

                var changeHandler = function(obj, funcName, inpt, callback) {
                    return function (e) {
                        var opts = {
                            Dataset: inpt.val() == "null" ? null : inpt.val()
                        };
                        callback(e, funcName, JSON.stringify(opts));
                    }
                };

                if (tbl.length == 0) {
                    var header = $(_templates["header"]);
                    parentDiv.append(header);
                    parentDiv.append(_templates["body"]);
                }
                var tb = tbl.find("tbody");
                tb.empty();

                var funcName = "controlProperties";
                var curr = control;
                if (curr) {
                    var propsStr = control.controlProperties();
                    var props = {};
                    if (propsStr) {
                        props = JSON.parse(propsStr);
                    }
                    var tmpl = _templates["selectProperty"];
                    var tr = $(tmpl);
                    var propName = "Dataset";
                    tr.find(".name").text(propName);
                    var inpt = tr.find(".value").find("select");
                    $.data(inpt[0], "propName", propName);

                    if (this._model) {
                        var opt = $("<option value='null'>(None)</option>");
                        inpt.append(opt);
                        var col = this._model.getCol("Datasets");
                        for (var i = 0; i < col.count(); i++) {
                            var ds = col.get(i);
                            var opt = $("<option value='" + ds.resElemName() + "'>" + ds.resElemName() + "</option>");
                            inpt.append(opt);
                        }
                    }
                    tb.append(tr);


                    inpt.val(props.Dataset ? props.Dataset : "null");
                    inpt.change(changeHandler(control, funcName, inpt, callback));
                }
            }

        });
        return DataGridPropEditor;
    }
);
