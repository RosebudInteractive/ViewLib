/**
 * Created by kiknadze on 06.04.2016.
 */

define(
    ["./defaultEditor", "./dataGridPropEditor"],
    function(DefEditor, DBGridPropEditor) {
        var editors = null;

        var PropEditorManager = Class.extend({

            init: function(model, propSource) {
                this._model = model;
                this._propSource = propSource;
                editors = {
                    default: {
                        name: "DefaultEditor",
                        default: true,
                        obj: new DefEditor(this._model)
                    } ,
                    dataGrid: {
                        DataGridEditor: {
                            name: "DataGridEditor",
                            default: true,
                            obj: new DBGridPropEditor(this._model, this._propSource)
                        }
                    }
                }

            },

            setModel: function(model) {
                this._model = model;
                editors.default.obj.setModel(model);
                editors.dataGrid.DataGridEditor.obj.setModel(model);
            },

            setPropSource: function(propSource) {
                this._propSource = propSource;
                editors.dataGrid.DataGridEditor.obj.setPropSource(propSource);
            },

            renderProperties: function(parentDiv, control, callback) {
                var editor = editors.default;
                if (control && control.className == "DesignerDataGrid" &&
                    (control.typeGuid() == UCCELLO_CONFIG.classGuids.DataGrid ||
                        control.typeGuid() ==  UCCELLO_CONFIG.classGuids.GenDataGrid)
                    ) {
                    editor = editors.dataGrid.DataGridEditor;
                }

                editor.obj.render(parentDiv, control, callback);
            }

        });
        return new PropEditorManager();
    }
);
